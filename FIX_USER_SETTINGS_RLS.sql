-- ==========================================
-- ADD RLS POLICIES FOR USER_SETTINGS TABLE
-- Run this in Supabase SQL Editor
-- ==========================================

-- Check current policies (should be empty or show the old policy)
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename = 'user_settings';

-- Drop old policy if it exists
DROP POLICY IF EXISTS "Enable all access for user_settings" ON user_settings;

-- Create proper RLS policies for user_settings table

-- 1. Users can read their own settings
CREATE POLICY "Users can read own settings" ON user_settings
  FOR SELECT 
  USING (auth.uid()::text = user_id);

-- 2. Users can insert their own settings
CREATE POLICY "Users can insert own settings" ON user_settings
  FOR INSERT 
  WITH CHECK (auth.uid()::text = user_id);

-- 3. Users can update their own settings
CREATE POLICY "Users can update own settings" ON user_settings
  FOR UPDATE 
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- 4. Users can delete their own settings
CREATE POLICY "Users can delete own settings" ON user_settings
  FOR DELETE 
  USING (auth.uid()::text = user_id);

-- ==========================================
-- DONE! User settings policies are now secure
-- ==========================================

-- Verify the policies were created
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies 
WHERE tablename = 'user_settings';
