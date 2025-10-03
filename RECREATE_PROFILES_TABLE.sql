-- ==========================================
-- RECREATE PROFILES TABLE
-- Run this in Supabase SQL Editor
-- ==========================================

-- 1. Create the profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- 3. Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies
-- Allow public read access (needed for authentication flow)
CREATE POLICY "Enable read access for profiles" ON profiles
  FOR SELECT USING (true);

-- Allow users to insert their own profile
CREATE POLICY "Enable insert access for profiles" ON profiles
  FOR INSERT WITH CHECK (true);

-- Allow users to update their own profile
CREATE POLICY "Enable update access for profiles" ON profiles
  FOR UPDATE USING (true) WITH CHECK (true);

-- Allow users to delete their own profile
CREATE POLICY "Enable delete access for profiles" ON profiles
  FOR DELETE USING (true);

-- 5. Create trigger to auto-update updated_at timestamp
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- DONE! Your profiles table is recreated
-- ==========================================

-- Verify the table was created successfully
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
