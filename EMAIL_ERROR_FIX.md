# Fix: "Email address is invalid" Error

## Problem
When trying to sign up, you get this error:
```
Signup failed
Email address "admin@zentry.local" is invalid
```

## Root Cause
- The app uses **username-only authentication** (no real emails)
- Supabase converts usernames to synthetic emails like `username@zentry.local`
- Supabase has **email confirmation enabled by default**
- It's trying to validate/send confirmation to these fake emails and failing

## Solution: Disable Email Confirmation

### Option 1: Via Authentication Settings (Recommended)

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project: `zentry-zen-flow`

2. **Navigate to Authentication Settings**
   - Click **Authentication** in left sidebar
   - Click **Settings** tab
   - Or go to: **Authentication → Providers → Email**

3. **Disable Email Confirmation**
   - Find the setting: **"Confirm email"** or **"Enable email confirmations"**
   - Toggle it **OFF** ❌
   - Click **Save**

### Option 2: Via Email Provider Settings

1. Go to: **Authentication → Providers**
2. Click on **Email** provider
3. Scroll to **Confirm email** setting
4. Toggle **OFF**
5. Click **Save**

## After Fixing

✅ **What happens:**
- Users can sign up instantly without email confirmation
- Synthetic emails (`username@zentry.local`) are accepted
- Authentication works with username + password only
- No email verification needed

✅ **Test it:**
```bash
npm run dev
```
- Go to Sign Up tab
- Enter username (e.g., "admin")
- Enter password (8+ chars with numbers)
- Should create account successfully!

## Why This Is Safe

✅ **Security maintained:**
- Users still need strong passwords (8+ chars, numbers required)
- Optional PIN for quick access
- Data is encrypted and stored in Supabase
- No real emails = no email-based attacks

✅ **User experience improved:**
- Instant signup (no waiting for confirmation email)
- Username-based login (easier to remember)
- Works offline with localStorage backup

## Additional Settings (Optional)

If you want even more control, you can also adjust:

### 1. Minimum Password Length
- Go to: **Authentication → Policies**
- Set minimum password length (currently 8 in our validation)

### 2. Rate Limiting
- Go to: **Authentication → Rate Limits**
- Configure signup/login rate limits to prevent abuse

### 3. Email Templates (If You Add Real Emails Later)
- Go to: **Authentication → Email Templates**
- Customize confirmation, reset, etc.

## Troubleshooting

### Still getting error after disabling?
1. **Clear browser cache and localStorage**
2. **Wait 1-2 minutes** for Supabase settings to propagate
3. **Try a different username** (in case previous attempt was cached)
4. **Check browser console** for more detailed error messages

### Want to use real emails instead?
If you prefer real email authentication:
1. Keep email confirmation enabled
2. Modify `src/lib/supabaseAuth.ts`:
   - Remove synthetic email generation
   - Add email input to signup form
   - Use real email addresses
3. Configure SMTP in Supabase (Authentication → Email)

---

**Need help?** Check the [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
