-- Update the trigger function to look for username in metadata
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  meta_username text;
  final_username text;
  slug text;
BEGIN
  -- 1. Try to get username from the sign-up metadata
  meta_username := new.raw_user_meta_data->>'username';

  -- 2. If present, use it. If not, generate a safe default (user_xxxx)
  IF meta_username IS NOT NULL AND length(meta_username) > 0 THEN
    final_username := meta_username;
  ELSE
    final_username := 'user_' || substr(md5(random()::text), 1, 8);
  END IF;

  -- 3. Insert into profiles with this username
  INSERT INTO public.profiles (id, email, username, display_name)
  VALUES (
    new.id, 
    new.email, 
    final_username,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email)
  );

  RETURN new;
END;
$$;
