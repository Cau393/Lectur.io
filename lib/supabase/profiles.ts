import { createClient } from './server';

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
};

/**
 * Fetch the current user's profile (server-side).
 * Returns null when no session or profile not found.
 */
export async function getCurrentUserProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}
