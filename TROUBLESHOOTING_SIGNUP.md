# 🔧 Troubleshooting "Signup Failed - Failed to Fetch"

## Current Status
✅ Supabase project is **active** (no yellow banner)
✅ Supabase is **reachable** (connection test passed)
❌ Signup is **failing** with "Failed to fetch" error

## Most Likely Cause: Email Confirmation

Your app uses synthetic emails (`username@zentry.local`) which can't receive confirmation emails. If email confirmation is enabled in Supabase, signups will fail.

---

## Quick Fix (2 minutes)

### Step 1: Disable Email Confirmation

**Direct link:** [Auth Providers Settings](https://supabase.com/dashboard/project/vnixcafcspbqhuytciog/auth/providers)

1. Click on **Email** in the providers list
2. Scroll down to find **"Confirm email"** toggle
3. Make sure it's set to **OFF** (gray/disabled)
4. If it's ON (blue), click to turn it **OFF**
5. Click **Save** button at the bottom

### Step 2: Check Browser Console for Exact Error

1. In your app, press **F12** to open DevTools
2. Click **Console** tab
3. Try to create an account
4. Look for red error messages starting with `Supabase signup error:`
5. **Tell me what error you see!**

---

## Possible Errors & Solutions

### Error 1: "Failed to fetch"
**Cause:** Network/CORS issue or project paused
**Solution:**
- Make sure dev server is running: `npm run dev`
- Check if project is paused (yellow banner in dashboard)
- Clear browser cache and try again

### Error 2: "Email confirmation required" or "Signups not allowed"
**Cause:** Email confirmation is enabled
**Solution:**
- Go to: [Auth Providers](https://supabase.com/dashboard/project/vnixcafcspbqhuytciog/auth/providers)
- Click Email → Confirm email → Set to OFF
- Click Save

### Error 3: "Invalid email format"
**Cause:** Supabase rejecting synthetic emails
**Solution:**
- Check if email validation rules exist
- We may need to use real email format or update settings

### Error 4: "User already registered"
**Cause:** Username already exists
**Solution:**
- Try a different username
- Or delete existing test users from dashboard

---

## Debug Checklist

Before asking for help, check these:

- [ ] ✅ Supabase project is active (no yellow banner)
- [ ] ✅ Dev server is running (`npm run dev` in terminal)
- [ ] ⚠️ Email confirmation is OFF in Supabase
- [ ] ⚠️ Checked browser console for error message (F12)
- [ ] ⚠️ Tried a unique username (not `demo` or `test`)
- [ ] ⚠️ Password meets requirements (8+ chars, has numbers)

---

## Quick Links

**Email Confirmation Settings:**
https://supabase.com/dashboard/project/vnixcafcspbqhuytciog/auth/providers

**Auth Logs (see signup attempts):**
https://supabase.com/dashboard/project/vnixcafcspbqhuytciog/logs/auth-logs

**Users Table (see created users):**
https://supabase.com/dashboard/project/vnixcafcspbqhuytciog/auth/users

**Project Dashboard:**
https://supabase.com/dashboard/project/vnixcafcspbqhuytciog

---

## What I Changed

I've added better error handling to help debug:

**Files Modified:**
- `src/lib/supabaseAuth.ts` - Added console logging for signup errors
- `src/pages/Auth.tsx` - Better error messages with longer display duration

Now when signup fails, you'll see:
- Detailed error in browser console (F12)
- Helpful message in the toast notification
- Info banner with link to dashboard

---

## Next Steps

1. **First:** Check if email confirmation is OFF in Supabase
2. **Second:** Open browser console (F12) and try signup
3. **Third:** Tell me what error message you see
4. **Then:** I'll fix it based on the exact error!

---

## Still Not Working?

If you've:
- ✅ Disabled email confirmation
- ✅ Checked browser console
- ✅ Tried different usernames
- ❌ Still getting errors

**Send me:**
1. The exact error from browser console
2. Screenshot of Auth > Providers > Email settings
3. Any red errors in the Supabase Auth Logs

I'll help you fix it! 🚀
