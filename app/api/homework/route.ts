import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createClient } from '@/lib/supabase/server';

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
    const { classId } = body as { classId?: string };
    if (!classId || typeof classId !== 'string') {
      return Response.json(
        { error: 'classId is required' },
        { status: 400 }
      );
    }

    // Fetch class (RLS ensures we only get classes for the user's subjects)
    const { data: classRow, error: fetchError } = await supabase
      .from('classes')
      .select('id, title, topics')
      .eq('id', classId)
      .single();

    if (fetchError || !classRow) {
      const notFound = fetchError?.code === 'PGRST116';
      return Response.json(
        { error: notFound ? 'Class not found' : fetchError?.message },
        { status: notFound ? 404 : 500 }
      );
    }

    const title = classRow.title as string;
    const topics = (classRow.topics as string[]) ?? [];
    const topicList = topics.length
      ? `Topics covered: ${topics.join(', ')}.`
      : '';

    const { text: homeworkMarkdown } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: `You are an expert educational designer building a curriculum for a highly motivated student. The student has just completed a 40 minute class on: **${title}**. ${topicList}

Task: Design a homework assignment that requires critical thinking, problem-solving, and synthesis of the material, rather than simple memorization.

Constraints:
- The assignment must take roughly 20 minutes to complete.
- Include a real-world scenario or case study they must analyze.
- Do not ask simple multiple-choice or definition questions.
- Output the assignment in strict Markdown format.
- No need to provide any submission requirements or due dates.

Ethics/Engagement: Ensure the scenario is engaging, inclusive, and free of bias.`,
    });

    if (!homeworkMarkdown?.trim()) {
      return Response.json(
        { error: 'Failed to generate homework' },
        { status: 500 }
      );
    }

    const { error: updateError } = await supabase
      .from('classes')
      .update({ homework_markdown: homeworkMarkdown.trim() })
      .eq('id', classId);

    if (updateError) {
      return Response.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      homeworkMarkdown: homeworkMarkdown.trim(),
    });
  } catch (err) {
    console.error('[homework]', err);
    return Response.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
