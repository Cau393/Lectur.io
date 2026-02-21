import { createClient } from './server';

/**
 * Get the current authenticated user (server-side).
 * Use in API routes and Server Components.
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}
