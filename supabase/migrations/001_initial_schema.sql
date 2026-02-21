-- Aura Learning Platform - Initial Schema (Backend Dev 1)
-- Run this in Supabase SQL Editor or via supabase db push

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Subjects
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, slug)
);

-- Classes
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  order_index INT NOT NULL,
  title TEXT NOT NULL,
  topics JSONB NOT NULL DEFAULT '[]',
  homework_markdown TEXT,
  duration_minutes INT NOT NULL DEFAULT 80,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_subjects_user_id ON public.subjects(user_id);
CREATE INDEX IF NOT EXISTS idx_classes_subject_id ON public.classes(subject_id);

-- Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- RLS Policies: profiles (users can read/update own profile)
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies: subjects (users can only access their own)
CREATE POLICY "Users can view own subjects"
  ON public.subjects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subjects"
  ON public.subjects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subjects"
  ON public.subjects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own subjects"
  ON public.subjects FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies: classes (via subject ownership)
CREATE POLICY "Users can view classes of own subjects"
  ON public.classes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.subjects
      WHERE subjects.id = classes.subject_id
      AND subjects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert classes into own subjects"
  ON public.classes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.subjects
      WHERE subjects.id = classes.subject_id
      AND subjects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update classes of own subjects"
  ON public.classes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.subjects
      WHERE subjects.id = classes.subject_id
      AND subjects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete classes of own subjects"
  ON public.classes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.subjects
      WHERE subjects.id = classes.subject_id
      AND subjects.user_id = auth.uid()
    )
  );

-- Trigger: Create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to allow re-running migration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
