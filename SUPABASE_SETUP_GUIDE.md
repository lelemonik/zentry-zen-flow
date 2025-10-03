# 🔧 Supabase Setup Guide for Zentry

## ⚠️ Critical: You're Getting 400 Errors Because Tables Don't Exist

If you're seeing errors like:
```
Failed to load resource: the server responded with a status of 400
vnixcafcspbqhuytciog.supabase.co/rest/v1/profiles?select=user_id&username=eq.admin
```

**This means the database tables haven't been created in Supabase yet!**

---

## 📋 Step-by-Step Setup

### **Step 1: Access Supabase SQL Editor**

1. Go to https://app.supabase.com
2. Select your project: `vnixcafcspbqhuytciog`
3. Click on **"SQL Editor"** in the left sidebar
4. Click **"New Query"**

### **Step 2: Run the Schema Script**

1. Open the file `supabase-schema.sql` in this project
2. **Copy ALL the contents** (the entire file)
3. **Paste** into the Supabase SQL Editor
4. Click **"Run"** (or press Ctrl+Enter)

You should see:
```
Success. No rows returned
```

This creates all the tables:
- ✅ `tasks` - For task management
- ✅ `notes` - For notes
- ✅ `schedule` - For calendar events
- ✅ `profiles` - **For user accounts (REQUIRED)**
- ✅ `user_settings` - For user preferences

### **Step 3: Verify Tables Were Created**

1. Click on **"Table Editor"** in the left sidebar
2. You should see all 5 tables listed:
   - tasks
   - notes
   - schedule
   - profiles ← **Most important!**
   - user_settings

### **Step 4: Check Row Level Security (RLS)**

The schema automatically enables RLS with permissive policies. To verify:

1. Go to **"Authentication"** → **"Policies"**
2. Select each table and confirm policies exist
3. The policies should show: `USING (true)` - allowing all operations

### **Step 5: Verify Authentication Settings**

1. Go to **"Authentication"** → **"Providers"** → **"Email"**
2. **CRITICAL**: Make sure these settings are correct:
   - ✅ **"Confirm email"** should be **DISABLED**
   - ✅ **"Enable email provider"** should be **ENABLED**
   - ✅ **"Secure email change"** can be enabled or disabled

**Why disable email confirmation?**
- Zentry uses synthetic emails (username@zentry.local)
- Real emails aren't collected
- Email confirmation would block all signups

---

## 🔍 Troubleshooting

### **Issue: Still getting 400 errors after running schema**

**Solution 1: Check if tables exist**
```sql
-- Run this in SQL Editor to list all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

**Solution 2: Manually create profiles table**
If the schema didn't work, run just the profiles table:
```sql
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

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for profiles" ON profiles
  FOR SELECT USING (true);
CREATE POLICY "Enable insert access for profiles" ON profiles
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for profiles" ON profiles
  FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete access for profiles" ON profiles
  FOR DELETE USING (true);
```

### **Issue: "relation 'public.profiles' does not exist"**

This means the table wasn't created. Run the schema again.

### **Issue: "new row violates row-level security policy"**

This means RLS is blocking access. Fix:
```sql
-- Drop old policies
DROP POLICY IF EXISTS "Enable all access for profiles" ON profiles;

-- Create new policies
CREATE POLICY "Enable read access for profiles" ON profiles
  FOR SELECT USING (true);
CREATE POLICY "Enable insert access for profiles" ON profiles
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for profiles" ON profiles
  FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete access for profiles" ON profiles
  FOR DELETE USING (true);
```

### **Issue: Can't signup or login**

1. Check Supabase Dashboard → Authentication → Users
2. Are users being created?
   - **Yes** → Profile creation might be failing (check SQL Editor logs)
   - **No** → Check email confirmation settings (must be DISABLED)

---

## ✅ How to Verify Everything Works

### **Test 1: Check Database Connection**
1. Open browser console (F12)
2. Try to signup with username "testuser123"
3. Check for errors in console
4. Should NOT see any 400 errors from Supabase

### **Test 2: Check Tables**
```sql
-- Run in Supabase SQL Editor
SELECT COUNT(*) FROM profiles;
SELECT COUNT(*) FROM tasks;
SELECT COUNT(*) FROM notes;
SELECT COUNT(*) FROM schedule;
SELECT COUNT(*) FROM user_settings;
```

All queries should return `0` or higher (not error).

### **Test 3: Manual Test**
```sql
-- Insert a test profile
INSERT INTO profiles (user_id, username, name, email)
VALUES ('test-123', 'testuser', 'Test User', 'test@zentry.local');

-- Check it was created
SELECT * FROM profiles WHERE username = 'testuser';

-- Clean up
DELETE FROM profiles WHERE username = 'testuser';
```

---

## 🚀 Quick Fix Commands

If you're in a hurry and just want to fix the 400 error:

**Copy and paste this entire block into Supabase SQL Editor:**

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table with RLS
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

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for profiles" ON profiles;
CREATE POLICY "Enable read access for profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Enable insert access for profiles" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for profiles" ON profiles FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete access for profiles" ON profiles FOR DELETE USING (true);
```

Then click **"Run"**.

---

## 📞 Still Having Issues?

1. **Check Supabase Logs:**
   - Dashboard → Logs → Check for errors

2. **Check RLS Policies:**
   - Dashboard → Authentication → Policies
   - Make sure policies exist for `profiles` table

3. **Verify Anon Key:**
   - Dashboard → Settings → API
   - Copy the `anon` `public` key
   - Make sure it matches what's in `src/lib/supabase.ts`

4. **Check Project URL:**
   - Should be: `https://vnixcafcspbqhuytciog.supabase.co`
   - Verify in `src/lib/supabase.ts`

---

## ✨ After Setup

Once tables are created:
1. Try signing up with a new account
2. You should see a user in: Dashboard → Authentication → Users
3. You should see a profile in: Dashboard → Table Editor → profiles
4. Login should work without 400 errors!

**Your app will now work correctly at: https://my-zentry.vercel.app** 🎉
