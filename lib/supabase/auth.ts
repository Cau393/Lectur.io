import { createClient } from './server';

/**
 * Get the current authenticated user (server-side).
 * Use in API routes and Server Components.
 * Returns null when no session (e.g. AuthSessionMissingError) so callers can redirect to login.
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  // セッションなし・未認証はエラーではなく「ユーザーなし」として扱う
  if (error) {
    const isSessionMissing =
      error.name === 'AuthSessionMissingError' ||
      (error as { __isAuthError?: boolean }).__isAuthError === true;
    if (isSessionMissing) return null;
    throw error;
  }
  return user;
}
