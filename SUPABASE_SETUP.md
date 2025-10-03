# Supabase Setup Instructions for Zentry Zen Flow

## 🚀 Quick Setup (5 minutes)

### Step 1: Create a Supabase Account
1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub or email

### Step 2: Create a New Project
1. Click "New Project"
2. Choose an organization or create one
3. Fill in:
   - **Project name**: `zentry-zen-flow`
   - **Database password**: (save this somewhere safe)
   - **Region**: Choose closest to you
4. Click "Create new project" (wait 1-2 minutes)

### Step 3: Get Your API Keys
1. Once your project is ready, go to **Settings** (gear icon)
2. Navigate to **API** in the left sidebar
3. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

### Step 4: Add Keys to Your Project
1. Open `.env.local` in your project root
2. Replace the placeholders:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### Step 5: Create Database Tables
1. In Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click "New Query"
3. Copy the entire contents of `supabase-schema.sql`
4. Paste it into the SQL editor
5. Click "Run" (or press Ctrl+Enter)
6. You should see "Success. No rows returned"

### Step 6: Restart Your Dev Server
```bash
# Stop the current dev server (Ctrl+C)
npm run dev
```

## ✅ That's it! Your app now saves to Supabase!

## 🔄 How It Works

- **Auto-sync**: All tasks, notes, schedule, and profile data automatically save to Supabase
- **PIN-based**: Your PIN is used to create a unique user ID (hashed for security)
- **Offline-first**: Data is still saved to localStorage as backup
- **Real-time**: Changes sync instantly across devices

## 📊 View Your Data

1. Go to Supabase Dashboard
2. Click **Table Editor** (left sidebar)
3. You'll see your tables: `tasks`, `notes`, `schedule`, `profiles`
4. Click any table to view/edit data directly

## 🔐 Security Notes

- Your PIN is never sent to Supabase
- Data is isolated by user_id (derived from PIN)
- All data is transmitted over HTTPS
- Row Level Security (RLS) is enabled

## 🐛 Troubleshooting

**Problem**: Can't connect to Supabase
- Check your `.env.local` file has correct values
- Make sure you restarted the dev server
- Verify your Supabase project is active

**Problem**: No data showing
- Run the SQL schema in Supabase SQL Editor
- Check browser console for errors
- Verify your API keys are correct

**Problem**: Permission errors
- Make sure RLS policies were created (run the SQL schema)
- Check Supabase dashboard for any error messages

## 📱 Sync Existing Data

If you already have data in localStorage, it will automatically sync to Supabase on first load!

## 🎉 You're Done!

Your app now has:
- ✅ Cloud database
- ✅ Automatic backups
- ✅ Cross-device sync
- ✅ No data loss on browser clear
