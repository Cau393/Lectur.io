import { generateText, Output } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

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

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { subjectName } = body as { subjectName?: string };
    if (!subjectName || typeof subjectName !== 'string') {
      return Response.json(
        { error: 'subjectName is required' },
        { status: 400 }
      );
    }

    const slug = subjectName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    const { experimental_output } = await generateText({
      model: openai('gpt-4o-mini'),
      experimental_output: Output.object({
        schema: syllabusSchema,
      }),
      prompt: `You are an expert curriculum designer. Break down the subject "${subjectName}" into a structured learning syllabus.

Each class must be designed for exactly 80 minutes (1 hour 20 minutes) of instruction.
- Cover the subject comprehensively in logical progression
- Each class must have 5-8 discrete topics
- By the end of the subject, the student should have a solid understanding of the subject and be able to apply the knowledge to real-world problems.
- Order classes from foundational to advanced
- Output valid JSON matching the schema`,
    });

    const output = experimental_output as SyllabusOutput | undefined;
    if (!output?.classes?.length) {
      return Response.json(
        { error: 'Failed to generate syllabus' },
        { status: 500 }
      );
    }

    const { data: subject, error: subjectError } = await supabase
      .from('subjects')
      .insert({
        user_id: user.id,
        name: subjectName.trim(),
        slug: slug || 'subject',
      })
      .select('id')
      .single();

    if (subjectError || !subject) {
      return Response.json(
        { error: subjectError?.message ?? 'Failed to create subject' },
        { status: 500 }
      );
    }

    const classesToInsert = output.classes.map((c) => ({
      subject_id: subject.id,
      order_index: c.order_index,
      title: c.title,
      topics: c.topics,
      duration_minutes: 80,
    }));

    const { error: classesError } = await supabase
      .from('classes')
      .insert(classesToInsert);

    if (classesError) {
      await supabase.from('subjects').delete().eq('id', subject.id);
      return Response.json(
        { error: classesError.message },
        { status: 500 }
      );
    }

    return Response.json({ subjectId: subject.id });
  } catch (err) {
    console.error('[syllabus]', err);
    return Response.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
