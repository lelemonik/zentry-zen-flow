# 🔧 Supabase Project Restore Guide

## The Problem
You're seeing **"Signup failed - Failed to fetch"** because your Supabase project is paused or offline.

## Quick Fix (2 minutes)

### Step 1: Open Your Project Dashboard
**Click this link:** [https://supabase.com/dashboard/project/vnixcafcspbqhuytciog](https://supabase.com/dashboard/project/vnixcafcspbqhuytciog)

### Step 2: Check Project Status
Look at the top of the page:

#### If You See a Yellow/Orange Banner:
- Banner text: "This project is paused" or "Project paused due to inactivity"
- **Action:** Click the **[Restore project]** or **[Resume]** button
- **Wait:** 1-2 minutes for the project to wake up
- **Verify:** Refresh the page and check for green "Active" status

#### If No Banner (Project Appears Active):
Test the connection in your browser:

1. Press **F12** to open DevTools
2. Click **Console** tab
3. Paste this code and press Enter:

```javascript
fetch('https://vnixcafcspbqhuytciog.supabase.co/auth/v1/health')
  .then(r => r.json())
  .then(d => console.log('✅ CONNECTED:', d))
  .catch(e => console.log('❌ FAILED:', e))
```

**Results:**
- ✅ **CONNECTED** = Shows health data → Project is working!
- ❌ **FAILED** = "Failed to fetch" → Project is still paused

### Step 3: Verify Auth Settings
While in the dashboard:

1. Click **Authentication** in left sidebar
2. Click **Providers**
3. Click **Email**
4. Find **"Confirm email"** toggle
5. Make sure it's **OFF** (gray/disabled)
6. Click **Save** if you made changes

### Step 4: Try Your App Again
1. Go back to your app
2. Click **"Create Account"**
3. Fill in username and password
4. Should work now! ✅

---

## Why This Happens

Free tier Supabase projects automatically pause after:
- **7 days** of no activity
- **1 week** without database queries

This is **normal** and not a problem! Just restore the project whenever you need it.

---

## Alternative: Use Offline Mode

Don't want to deal with Supabase right now?

1. Click **"Back to Home"** in your app
2. Use the app without creating an account
3. All your data will be stored locally (in your browser)
4. You can add a Supabase account later for cloud sync

---

## Quick Links

- **Your Project Dashboard:** https://supabase.com/dashboard/project/vnixcafcspbqhuytciog
- **Supabase Status Page:** https://status.supabase.com
- **Support Docs:** https://supabase.com/docs

---

## Need Help?

**Common Issues:**

1. **"Project not found"**
   - Make sure you're logged into the correct Supabase account
   - Check that the project ID is correct: `vnixcafcspbqhuytciog`

2. **"Restore button doesn't work"**
   - Wait 2-3 minutes after clicking
   - Refresh the page
   - Try logging out and back into Supabase

3. **"Still getting 'Failed to fetch'"**
   - Clear your browser cache (Ctrl+Shift+Delete)
   - Make sure project shows "Active" status
   - Restart your dev server: `npm run dev`

---

## After Restoring

Once your project is restored:

1. ✅ Signup/Login will work
2. ✅ Data will sync to cloud
3. ✅ Account deletion feature available
4. ✅ Can access from any device

**Note:** The project will pause again after 7 days of inactivity. Just restore it whenever you need it!
