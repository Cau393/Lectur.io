/**
 * Test script: generates a real syllabus via OpenAI and inserts it into Supabase.
 *
 * Run: npm run syllabus:test [topic]
 * Example: npm run syllabus:test "Python Basics"
 *
 * Requires in .env.local:
 *   - OPENAI_API_KEY
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 *   - TEST_USER_ID (a real user UUID from Supabase Auth - create one via signup first)
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// Load .env.local if present
const envPath = resolve(process.cwd(), '.env.local');
if (existsSync(envPath)) {
  const content = readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const val = match[2].trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

import { createClient } from '@supabase/supabase-js';
import { generateText, Output } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const syllabusSchema = z.object({
  classes: z.array(
    z.object({
      order_index: z.number(),
      title: z.string(),
      topics: z.array(z.string()),
      duration_minutes: z.literal(80),
    })
  ),
});

type SyllabusOutput = z.infer<typeof syllabusSchema>;

async function main() {
  const topic = process.argv[2] || 'Python Basics';

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const userId = process.env.TEST_USER_ID;

  if (!process.env.OPENAI_API_KEY) {
    console.error('Error: OPENAI_API_KEY is required.');
    process.exit(1);
  }
  if (!url || !serviceRoleKey) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
    process.exit(1);
  }
  if (!userId) {
    console.error(
      'Error: TEST_USER_ID is required. Create a user via Supabase Auth signup, then copy their UUID from Auth > Users.'
    );
    process.exit(1);
  }

  console.log(`\nGenerating syllabus for: "${topic}"\n`);

  const { experimental_output } = await generateText({
    model: openai('gpt-4o-mini'),
    experimental_output: Output.object({
      schema: syllabusSchema,
    }),
    prompt: `You are an expert curriculum designer. Break down the subject "${topic}" into a structured learning syllabus.

Each class must be designed for exactly 80 minutes (1 hour 20 minutes) of instruction.
- Cover the subject comprehensively in logical progression
- Each class must have 5-8 discrete topics
- By the end of the subject, the student should have a solid understanding of the subject and be able to apply the knowledge to real-world problems.
- Order classes from foundational to advanced
- Output valid JSON matching the schema`,
  });

  const output = experimental_output as SyllabusOutput | undefined;

  if (!output?.classes?.length) {
    console.error('Failed to generate syllabus');
    process.exit(1);
  }

  const slug =
    topic
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '') || 'subject';

  const supabase = createClient(url, serviceRoleKey);

  const { data: subject, error: subjectError } = await supabase
    .from('subjects')
    .insert({
      user_id: userId,
      name: topic.trim(),
      slug,
    })
    .select('id')
    .single();

  if (subjectError || !subject) {
    console.error('Failed to insert subject:', subjectError?.message ?? 'Unknown error');
    process.exit(1);
  }

  const classesToInsert = output.classes.map((c) => ({
    subject_id: subject.id,
    order_index: c.order_index,
    title: c.title,
    topics: c.topics,
    duration_minutes: 80,
  }));

  const { error: classesError } = await supabase.from('classes').insert(classesToInsert);

  if (classesError) {
    await supabase.from('subjects').delete().eq('id', subject.id);
    console.error('Failed to insert classes:', classesError.message);
    process.exit(1);
  }

  console.log('Inserted into DB:');
  console.log('  Subject id:', subject.id);
  console.log('  Classes:', classesToInsert.length);
  console.log('\n--- Per-class summary (80 min each) ---');
  classesToInsert.forEach((c, i) => {
    console.log(`\nClass ${i + 1}: ${c.title}`);
    console.log(`  Topics (${c.topics.length}): ${c.topics.join(', ')}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
