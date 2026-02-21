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
      duration_minutes: z.literal(40),
    })
  ),
});

const slidesSchema = z.object({
  slides: z.array(
    z.object({
      slide_index: z.number(),
      title: z.string(),
      type: z.enum(['title', 'content', 'example']),
      bullet_points: z.array(z.string()),
      real_world_example: z.string().optional(),
    })
  ),
});

type SyllabusOutput = z.infer<typeof syllabusSchema>;
type SlidesOutput = z.infer<typeof slidesSchema>;

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

Each class must be designed for exactly 40 minutes of instruction.
- Cover the subject comprehensively in logical progression
- Each class must have 3-5 discrete topics
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
      duration_minutes: 40,
    }));

    const { data: insertedClasses, error: classesError } = await supabase
      .from('classes')
      .insert(classesToInsert)
      .select('id, order_index, title, topics');

    if (classesError || !insertedClasses?.length) {
      await supabase.from('subjects').delete().eq('id', subject.id);
      return Response.json(
        { error: classesError?.message ?? 'Failed to insert classes' },
        { status: 500 }
      );
    }

    for (const cls of insertedClasses) {
      try {
        const topics = (cls.topics as string[]) ?? [];
        const { experimental_output: slidesOutput } = await generateText({
          model: openai('gpt-4o-mini'),
          experimental_output: Output.object({
            schema: slidesSchema,
          }),
          prompt: `You are an expert educator. Generate lecture slides for an AI teacher to explain this class.

Class title: ${cls.title}
Topics: ${topics.join(', ')}

Duration: 40 minutes. Create slides in lecture format:
- Start with a title/overview slide (type "title", bullet_points can be empty)
- One content slide per topic with 3-5 bullet points (key concepts, definitions)
- At least one "example" slide with a real-world scenario or case study (type "example", include real_world_example)
- Use type: "title" | "content" | "example"
- bullet_points: array of strings
- real_world_example: string (only for type "example")

Output valid JSON matching the schema.`,
        });

        const slides = (slidesOutput as SlidesOutput | undefined)?.slides;
        if (slides?.length) {
          await supabase
            .from('classes')
            .update({ slides })
            .eq('id', cls.id);
        }
      } catch (slidesErr) {
        console.error('[syllabus] slides generation failed for class', cls.id, slidesErr);
      }
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
