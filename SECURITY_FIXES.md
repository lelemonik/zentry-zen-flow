# Security Advisor Fixes

This guide will help you fix the security warnings in your Supabase Security Advisor.

## Issue 1: Function Search Path Mutable ⚠️

**Problem:** The `update_updated_at_column()` function doesn't have a fixed search path, which could allow malicious users to hijack the function behavior.

**Solution:** Add `SECURITY DEFINER` and set a fixed search path.

### Steps to Fix:

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run this SQL to fix the function:

```sql
-- Drop and recreate the function with security improvements
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Recreate all triggers (they were dropped by CASCADE)
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedule_events_updated_at
  BEFORE UPDATE ON schedule_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

3. Click **Run** to execute
4. Go back to **Advisors** → **Security Advisor** → Click **Refresh**
5. ✅ Warning should be gone!

---

## Issue 2: Leaked Password Protection Disabled ⚠️

**Problem:** Supabase's password leak detection is currently disabled, which means users can use passwords that have been exposed in data breaches.

**Solution:** Enable "Leaked Password Protection" in Auth settings.

### Steps to Fix:

1. Go to **Supabase Dashboard** → **Authentication** → **Policies**
2. Scroll down to **Security and Protection** section
3. Find **"Leaked Password Protection"**
4. Toggle it **ON** (enable it)
5. Click **Save**
6. Go back to **Advisors** → **Security Advisor** → Click **Refresh**
7. ✅ Warning should be gone!

### What This Does:
- Checks passwords against the [Have I Been Pwned](https://haveibeenpwned.com/) database
- Prevents users from using passwords that have been leaked in data breaches
- Improves account security without impacting user experience

---

## Verification

After applying both fixes:

1. Go to **Advisors** → **Security Advisor**
2. Click **Refresh** button (top right)
3. You should see: **"0 errors, 0 warnings, 1 suggestion"**

---

## What Changed?

### Function Security Fix:
```sql
-- BEFORE (insecure)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- AFTER (secure)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER          -- ✅ Runs with creator's permissions
SET search_path = public  -- ✅ Fixed search path (prevents hijacking)
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;
```

### Key Security Improvements:
- **`SECURITY DEFINER`**: Function runs with the permissions of the creator (secure)
- **`SET search_path = public`**: Prevents search path manipulation attacks
- **Leaked Password Protection**: Stops users from using compromised passwords

---

## Additional Security Best Practices

✅ **Already Implemented:**
- RLS (Row Level Security) enabled on all tables
- User-specific data isolation with `user_id` checks
- Secure authentication with Supabase Auth
- No direct admin access from frontend

💡 **Optional Enhancements:**
- Enable **2FA (Two-Factor Authentication)** in Auth settings
- Set up **Email Rate Limiting** to prevent spam
- Enable **CAPTCHA** for sign-ups (under Auth → CAPTCHA)

---

## Need Help?

If you encounter any issues:
1. Check the SQL Editor for error messages
2. Verify you're on the correct database/project
3. Make sure you have admin access to the Supabase project
4. Check the Security Advisor after each fix

Both warnings are low-severity and won't affect your app's functionality, but fixing them improves your security posture! 🔒
