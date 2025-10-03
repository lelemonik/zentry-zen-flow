-- SQL function to allow users to delete their own account
-- Run this in your Supabase SQL Editor

-- Create a function that allows authenticated users to delete themselves
CREATE OR REPLACE FUNCTION delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
BEGIN
  -- Get the current authenticated user's ID
  current_user_id := auth.uid();
  
  -- Ensure user is authenticated
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Delete user's data from all tables (RLS will ensure they can only delete their own data)
  DELETE FROM public.tasks WHERE user_id = current_user_id::text;
  DELETE FROM public.notes WHERE user_id = current_user_id::text;
  DELETE FROM public.schedule WHERE user_id = current_user_id::text;
  DELETE FROM public.profiles WHERE id = current_user_id::text;
  
  -- Delete the auth user (this requires SECURITY DEFINER to bypass RLS)
  DELETE FROM auth.users WHERE id = current_user_id;
  
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user() TO authenticated;

-- Revoke from anonymous users
REVOKE EXECUTE ON FUNCTION delete_user() FROM anon;

COMMENT ON FUNCTION delete_user() IS 'Allows authenticated users to delete their own account and all associated data';
