# Quick Reference: Delete Anonymous Data

## 🎯 TL;DR (Too Long; Didn't Read)

**Direct Link:** https://supabase.com/dashboard/project/vnixcafcspbqhuytciog/sql/new

**Copy this SQL:**
```sql
DELETE FROM tasks WHERE user_id = 'anonymous';
DELETE FROM notes WHERE user_id = 'anonymous';
DELETE FROM schedule_events WHERE user_id = 'anonymous';
```

**Paste → Click Run → Done!** ✅

---

## 📋 Step-by-Step (With Pictures in Mind)

### Step 1: Go to Supabase
```
https://supabase.com/dashboard
```
- Sign in if not already
- You'll see your project card

### Step 2: Click Your Project
```
vnixcafcspbqhuytciog
```
- This opens your project dashboard

### Step 3: Find SQL Editor
**Look at the left sidebar**, you'll see icons:
```
📊 Dashboard
🗄️  Table Editor
</> SQL Editor        ← Click this!
🔐 Authentication
📁 Storage
⚙️  Settings
```

### Step 4: Create New Query
- Click **"+ New query"** button (top right area)
- Or click **"New blank query"** if you see that

### Step 5: Paste SQL
Copy and paste this into the big text box:
```sql
DELETE FROM tasks WHERE user_id = 'anonymous';
DELETE FROM notes WHERE user_id = 'anonymous';
DELETE FROM schedule_events WHERE user_id = 'anonymous';
```

### Step 6: Run It
**Two ways:**
- **Click** the **"Run"** button (usually bottom right)
- **Or press** `Ctrl + Enter` (Windows/Linux) or `Cmd + Enter` (Mac)

### Step 7: Check Result
At the bottom, you should see:
```
✅ Success. No rows returned
```
or
```
✅ Success. X rows affected
```

**Done!** 🎉

---

## 🔍 Optional: Preview Before Deleting

Want to see how much data will be deleted first?

Run this query FIRST:
```sql
SELECT 
  (SELECT COUNT(*) FROM tasks WHERE user_id = 'anonymous') as tasks_count,
  (SELECT COUNT(*) FROM notes WHERE user_id = 'anonymous') as notes_count,
  (SELECT COUNT(*) FROM schedule_events WHERE user_id = 'anonymous') as events_count;
```

This shows you the count of items without deleting them.

Example result:
```
tasks_count | notes_count | events_count
------------|-------------|-------------
5           | 3           | 2
```

Then if you want to delete, run the DELETE queries.

---

## ⚠️ Important Notes

✅ **Safe:**
- Only deletes data with `user_id = 'anonymous'`
- Your real user accounts are NOT touched
- Can run multiple times safely

❌ **Warning:**
- Cannot be undone
- Make sure it's test data you want to delete

---

## 🆘 Troubleshooting

### "Permission denied" error?
- Make sure you're logged into Supabase
- Check you're on the correct project
- You might need owner/admin permissions

### "Table does not exist" error?
- Run the `supabase-schema.sql` first
- Or skip that table from the DELETE command

### "Query timeout" error?
- Delete one table at a time
- Start with smallest table first

---

## 📱 Can't Find SQL Editor?

### Method 1: Direct Link
Just click: https://supabase.com/dashboard/project/vnixcafcspbqhuytciog/sql/new

### Method 2: Search
- Press `/` on keyboard (opens search)
- Type "SQL"
- Click "SQL Editor"

### Method 3: Menu
- Click hamburger menu (☰) if sidebar is collapsed
- Look for "</>" icon
- Click it

---

## 🎓 What This Does

Before the fix, users without authentication shared a common `'anonymous'` ID. This SQL removes all that shared test data so each new user starts with a clean slate.

After running this, new users will:
- ✅ Have their own unique IDs
- ✅ See empty lists (their own data)
- ✅ Not see other users' data

---

## ✨ Pro Tip

You can also view/delete data using the Table Editor:
1. Click **Table Editor** in sidebar
2. Select a table (tasks, notes, schedule_events)
3. Filter by `user_id = 'anonymous'`
4. Select rows and delete

But SQL is faster! 🚀
