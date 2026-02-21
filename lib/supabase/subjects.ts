import { createClient } from './server';

export type Subject = {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  created_at: string;
};

export type Class = {
  id: string;
  subject_id: string;
  order_index: number;
  title: string;
  topics: string[];
  homework_markdown: string | null;
  duration_minutes: number;
  created_at: string;
};

/**
 * Fetch all subjects for the authenticated user.
 */
export async function getSubjects(): Promise<Subject[]> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('Unauthorized');

  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/**
 * Fetch a single subject by ID (must belong to the authenticated user).
 */
export async function getSubjectById(subjectId: string): Promise<Subject | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('Unauthorized');

  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .eq('id', subjectId)
    .eq('user_id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

/**
 * Fetch all classes for a subject (subject must belong to authenticated user).
 */
export async function getClassesBySubjectId(
  subjectId: string
): Promise<Class[]> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('Unauthorized');

  // Verify subject ownership via join
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .eq('subject_id', subjectId)
    .order('order_index', { ascending: true });

  if (error) throw error;

  return (data ?? []).map((c) => ({
    ...c,
    topics: (c.topics as string[]) ?? [],
  }));
}
