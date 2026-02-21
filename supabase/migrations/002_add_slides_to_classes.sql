-- Add slides column for AI teacher lecture content
ALTER TABLE public.classes
ADD COLUMN IF NOT EXISTS slides JSONB DEFAULT NULL;
