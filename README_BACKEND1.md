# Backend Dev 1 - Setup & Usage

## What's Included

- **Supabase schema**: `profiles`, `subjects`, `classes` tables + RLS
- **Supabase client**: Browser + Server clients, auth helpers
- **Subject/class helpers**: `getSubjects()`, `getSubjectById()`, `getClassesBySubjectId()`
- **API route**: `POST /api/syllabus` – generates syllabus via Vercel AI SDK and inserts into Supabase

## Setup

1. **Environment variables**

   Copy `env.example` to `.env.local` and fill in:

   ```bash
   cp env.example .env.local
   ```

   Required:
   - `NEXT_PUBLIC_SUPABASE_URL` – your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` – anon/public key
   - `OPENAI_API_KEY` – for syllabus generation (Vercel AI SDK uses this)

2. **Run Supabase migration**

   In the [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql), run the contents of `supabase/migrations/001_initial_schema.sql`.

   Or with Supabase CLI:
   ```bash
   supabase db push
   ```

3. **Install and run**

   ```bash
   npm install --legacy-peer-deps
   npm run dev
   ```

## API: POST /api/syllabus

**Request:**

```json
{
  "subjectName": "Quantum Physics"
}
```

**Response (success):**

```json
{
  "subjectId": "uuid-here"
}
```

**Requirements:** User must be authenticated (cookies/session). The route uses `createClient()` from `lib/supabase/server`, which reads the session from cookies.

## Test real syllabus (inserts into DB)

To generate a real syllabus via OpenAI and insert it into Supabase:

```bash
npm run syllabus:test "Python Basics"
# Or any topic: npm run syllabus:test "Quantum Physics"
```

Requires in `.env.local`:
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (Supabase Dashboard > Project Settings > API)
- `TEST_USER_ID` (a user UUID from Auth > Users; create one via signup first)

## Tests

Run the syllabus API tests:

```bash
npm run test        # watch mode
npm run test:run    # single run
```

Tests live in `tests/syllabus/syllabus.api.test.ts` and cover:
- 401 when unauthenticated
- 400 when subjectName is missing or invalid
- 500 when AI fails to generate syllabus
- 200 with subjectId on success

## Files Created

| Path | Purpose |
|------|---------|
| `supabase/migrations/001_initial_schema.sql` | DB schema + RLS |
| `lib/supabase/client.ts` | Browser Supabase client |
| `lib/supabase/server.ts` | Server Supabase client |
| `lib/supabase/auth.ts` | `getCurrentUser()` helper |
| `lib/supabase/subjects.ts` | Subject/class fetch helpers |
| `lib/supabase/index.ts` | Re-exports |
| `app/api/syllabus/route.ts` | Syllabus generation API |
| `tests/syllabus/syllabus.api.test.ts` | Syllabus API unit tests |
| `vitest.config.ts` | Vitest configuration |
