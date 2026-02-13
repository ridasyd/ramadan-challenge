-- Add description_de column to tasks table
ALTER TABLE public.tasks 
ADD COLUMN description_de text;

-- Optional: Update existing rows to have same value as description for now
UPDATE public.tasks 
SET description_de = description 
WHERE description_de IS NULL;
