import { createClient } from '@/lib/supabase/server';

/**
 * Ensures the current user has a profile row.
 * Safe to call after signup/login as a fallback when the DB trigger didn't run.
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single();

  if (existing) {
    return Response.json({ ok: true });
  }

  const { error } = await supabase.from('profiles').insert({
    id: user.id,
    email: user.email ?? '',
    full_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? '',
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json({ ok: true });
}
