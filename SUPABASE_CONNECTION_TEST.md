# Supabase Connection Test

Open your browser console (F12) and paste this code to test your Supabase connection:

```javascript
// Test 1: Check environment variables
console.log('=== SUPABASE CONFIG CHECK ===');
console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
console.log('Key length:', import.meta.env.VITE_SUPABASE_ANON_KEY?.length);

// Test 2: Test basic connection
console.log('\n=== CONNECTION TEST ===');
fetch('https://vnixcafcspbqhuytciog.supabase.co/rest/v1/')
  .then(res => {
    console.log('✅ Connection successful!');
    console.log('Status:', res.status);
    return res.text();
  })
  .then(data => console.log('Response:', data))
  .catch(err => {
    console.error('❌ Connection failed!');
    console.error('Error:', err.message);
  });

// Test 3: Test auth endpoint
console.log('\n=== AUTH ENDPOINT TEST ===');
fetch('https://vnixcafcspbqhuytciog.supabase.co/auth/v1/health')
  .then(res => {
    console.log('✅ Auth endpoint reachable!');
    return res.json();
  })
  .then(data => console.log('Health:', data))
  .catch(err => {
    console.error('❌ Auth endpoint failed!');
    console.error('Error:', err.message);
  });
```

## Expected Results:

### ✅ If Everything Works:
```
=== SUPABASE CONFIG CHECK ===
URL: https://vnixcafcspbqhuytciog.supabase.co
Key exists: true
Key length: 200+ (should be long JWT token)

=== CONNECTION TEST ===
✅ Connection successful!
Status: 200

=== AUTH ENDPOINT TEST ===
✅ Auth endpoint reachable!
Health: { ... }
```

### ❌ If Project is Paused:
```
❌ Connection failed!
Error: Failed to fetch
```
**Solution:** Go to Supabase dashboard and restore/unpause the project

### ❌ If Env Variables Not Loaded:
```
URL: undefined
Key exists: false
```
**Solution:** Restart dev server (Ctrl+C, then npm run dev)

### ❌ If CORS Error:
```
Access to fetch has been blocked by CORS policy
```
**Solution:** Check Supabase dashboard → Settings → API → Allowed origins

## Quick Fixes:

### Fix 1: Restart Everything
```bash
# Stop dev server
Ctrl+C

# Clear Vite cache
rm -rf node_modules/.vite

# Or on Windows:
rmdir /s node_modules\.vite

# Restart
npm run dev
```

### Fix 2: Verify .env.local is Loaded
Make sure your `.env.local` file is in the **root** of your project (same folder as `package.json`).

```
zentry-zen-flow/
├── .env.local          ← Should be here
├── package.json
├── vite.config.ts
└── src/
```

### Fix 3: Check Supabase Project
1. Go to https://supabase.com/dashboard
2. Look for your project: `vnixcafcspbqhuytciog`
3. Check for orange "Project Paused" banner
4. If paused: Click "Restore project"
5. Wait 1-2 minutes for project to restart

### Fix 4: Disable Email Confirmation (Again)
This is the **most common** issue with our username-only auth:

1. Go to: https://supabase.com/dashboard/project/vnixcafcspbqhuytciog/auth/providers
2. Click on "Email" provider
3. Scroll to "Confirm email" toggle
4. Make sure it's **OFF** ❌
5. Click Save

## Still Not Working?

### Check These:

1. **Internet Connection**: Can you access https://supabase.com?
2. **VPN/Proxy**: Turn off VPN and try again
3. **Firewall**: Check if Windows Firewall is blocking
4. **Antivirus**: Try disabling temporarily
5. **Browser Extensions**: Try in Incognito mode

### Get More Details:

Open browser console (F12) and look for:
- Red error messages
- CORS errors
- Network tab shows failed requests
- Take screenshots and share them

## Alternative: Test with Curl

Open PowerShell and run:
```powershell
curl https://vnixcafcspbqhuytciog.supabase.co/rest/v1/
```

Should return: `{"message":"Missing Authorization header"}`

If you get connection error, your network can't reach Supabase.
