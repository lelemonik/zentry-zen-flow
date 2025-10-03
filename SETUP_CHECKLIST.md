# ✅ Supabase Setup Checklist

Use this to track your progress through the setup!

## Step 1: Create Supabase Account & Project
- [ ] Go to https://supabase.com
- [ ] Click "Start your project" / Sign up
- [ ] Click "New Project"
- [ ] Enter project name: `zentry-zen-flow`
- [ ] Create & save database password: ___________________
- [ ] Choose region closest to you
- [ ] Click "Create new project"
- [ ] Wait 1-2 minutes for project to initialize

## Step 2: Get Your API Keys
- [ ] Go to Settings (⚙️ icon in sidebar)
- [ ] Click "API" in the left menu
- [ ] Copy "Project URL": ___________________
- [ ] Copy "anon public" key (long string): ___________________

## Step 3: Update .env.local File
- [ ] Open `.env.local` in your project
- [ ] Paste your Project URL
- [ ] Paste your anon public key
- [ ] Save the file

Example:
```env
VITE_SUPABASE_URL=https://abcdefghijk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 4: Create Database Tables
- [ ] In Supabase dashboard, click "SQL Editor" (left sidebar)
- [ ] Click "New query" button
- [ ] Open `supabase-schema.sql` from your project
- [ ] Copy ALL the SQL code (Ctrl+A, Ctrl+C)
- [ ] Paste into Supabase SQL Editor
- [ ] Click "Run" button (or press Ctrl+Enter)
- [ ] Verify you see: "Success. No rows returned"

## Step 5: Restart Your Dev Server
- [ ] In VS Code terminal, press Ctrl+C to stop server
- [ ] Run: `npm run dev`
- [ ] Wait for server to start
- [ ] Open http://localhost:8080

## Step 6: Test It! 🧪
- [ ] Go to Tasks page
- [ ] Create a new task
- [ ] Look for "✅ Saved to cloud" message
- [ ] Check for green cloud icon in header
- [ ] Go back to Supabase → Table Editor → tasks table
- [ ] Verify your task appears in the database!

---

## 🎉 Success!

If all checks pass, your app is now:
✅ Saving to cloud database
✅ Syncing across devices
✅ Protected by PIN authentication
✅ Working offline with localStorage backup

---

## ❓ Need Help?

If you get stuck:
1. Check QUICKSTART.md for detailed instructions
2. Check SUPABASE_SETUP.md for troubleshooting
3. Open browser console (F12) to see error messages

Common issues:
- **Can't connect**: Check .env.local has correct values & restart server
- **Permission denied**: Make sure SQL schema was run successfully
- **Still offline**: Check browser console for errors
