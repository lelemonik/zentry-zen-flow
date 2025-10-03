# 🚀 Quick Start: Supabase Setup

## ⏱️ Setup Time: 5 Minutes

### Step 1: Create Supabase Project (2 min)
1. Go to **https://supabase.com** → Sign up (free)
2. Click **"New Project"**
3. Fill in:
   - Name: `zentry-zen-flow`
   - Password: (create & save it)
   - Region: (choose closest)
4. Click **"Create new project"** (wait 1-2 min)

---

### Step 2: Get API Keys (1 min)
1. In Supabase dashboard → **Settings** (⚙️) → **API**
2. Copy these two values:
   ```
   Project URL: https://xxxxx.supabase.co
   anon public key: eyJhbG...
   ```

---

### Step 3: Configure Your App (1 min)
1. Open `.env.local` in your project
2. Replace with your values:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...your-key-here
   ```
3. Save the file

---

### Step 4: Create Database Tables (1 min)
1. In Supabase → **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Open `supabase-schema.sql` from your project
4. Copy ALL the SQL code
5. Paste into Supabase SQL Editor
6. Click **"Run"** (or Ctrl+Enter)
7. Should see: ✅ "Success. No rows returned"

---

### Step 5: Restart Dev Server
```bash
# Stop current server (Ctrl+C in terminal)
npm run dev
```

---

## ✅ You're Done!

Your app now:
- ✅ **Automatically saves** all data to cloud
- ✅ **Works offline** with localStorage backup
- ✅ **Syncs across devices** using your PIN
- ✅ Shows **cloud status** (green cloud icon = synced)

---

## 🧪 Test It

1. **Create a task** → Should say "✅ Saved to cloud"
2. **Check Supabase** → Dashboard → Table Editor → `tasks` → See your data!
3. **Clear browser data** → Refresh page → Data still there! (from cloud)

---

## 🔍 View Your Data

Go to Supabase → **Table Editor** to see:
- `tasks` - All your tasks
- `notes` - All your notes  
- `schedule` - All your events
- `profiles` - Your profile info

---

## ❓ Troubleshooting

**"Can't connect to Supabase"**
→ Check `.env.local` has correct URL & key
→ Restart dev server: `npm run dev`

**"Permission denied"**
→ Run the SQL schema in Supabase SQL Editor
→ Check all tables were created

**"Still using localStorage"**
→ Open browser console (F12)
→ Look for error messages
→ Verify env variables loaded: `console.log(import.meta.env.VITE_SUPABASE_URL)`

---

## 🎉 Features

- **Cloud Icons**: Green = synced, Amber = offline mode
- **Auto-save**: Every action saves to both cloud & localStorage
- **PIN Security**: Your PIN creates a unique user ID (never sent to server)
- **Offline First**: Works without internet, syncs when connected

---

## 📚 Need More Help?

See full documentation in `SUPABASE_SETUP.md`
