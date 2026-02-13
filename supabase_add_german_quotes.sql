-- Add content_de column to daily_quotes table
ALTER TABLE public.daily_quotes 
ADD COLUMN IF NOT EXISTS content_de text;

-- Optional: Update existing quotes with a placeholder or copy English content
-- UPDATE public.daily_quotes SET content_de = content WHERE content_de IS NULL;
