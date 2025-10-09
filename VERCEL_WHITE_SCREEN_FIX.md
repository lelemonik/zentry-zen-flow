# Fixing White Screen on Vercel Deployment

## Problem
The deployed version shows only a white screen, while local development works fine.

## Common Causes
1. ❌ Missing environment variables on Vercel
2. ❌ Build errors not caught locally
3. ❌ Runtime JavaScript errors
4. ❌ MIME type issues with assets

## Solution Steps

### 1. Set Environment Variables on Vercel

Go to your Vercel project dashboard:
1. Navigate to: https://vercel.com/lelemonik/zentry-zen-flow/settings/environment-variables
2. Add these variables (use values from your `.env.local`):

```bash
# Required Variables
VITE_SUPABASE_URL=https://vnixcafcspbqhuytciog.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuaXhjYWZjc3BicWh1eXRjaW9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0NzI2NDQsImV4cCI6MjA3NTA0ODY0NH0.lZEkFrOU3chVCLdTZrQZGgp8riSe-UNlTdfRQJNEg-0

# AI Configuration
VITE_AI_PROVIDER=gemini
VITE_GEMINI_API_KEY=AIzaSyDBNueAhIjMgvcASQY4PHvoBlgZS6Omwfc
```

**Important:** Make sure to select **"Production"**, **"Preview"**, and **"Development"** for all variables.

### 2. Check Browser Console

Open your deployed site and press `F12` to open Developer Tools:
- Look for red errors in the Console tab
- Common errors:
  - "Supabase client creation failed" → Missing env vars
  - "401 Unauthorized" → Invalid API keys
  - Module loading errors → Build issue

### 3. Check Vercel Build Logs

1. Go to: https://vercel.com/lelemonik/zentry-zen-flow
2. Click on the latest deployment
3. Check the "Build Logs" tab for any errors
4. Look for:
   - TypeScript errors
   - Missing dependencies
   - Build failures

### 4. Redeploy After Setting Variables

After adding environment variables:
1. Go to Deployments tab
2. Click the 3 dots menu on the latest deployment
3. Click "Redeploy"
4. OR push a new commit to trigger automatic deployment

### 5. Test Locally with Production Build

Run these commands to test the production build locally:

```bash
# Build for production
npm run build

# Preview the production build
npm run preview
```

If this shows a white screen locally, you have a build issue.

## Quick Fix Checklist

- [ ] All environment variables added to Vercel
- [ ] Variables set for Production, Preview, and Development
- [ ] Redeployed after adding variables
- [ ] Checked browser console for errors
- [ ] Verified build logs on Vercel
- [ ] Tested production build locally

## Still Not Working?

If the white screen persists:

1. **Check Vercel Function Logs:**
   - Go to Vercel Dashboard → Deployments → Click deployment → Functions tab
   - Look for runtime errors

2. **Enable Source Maps:**
   - Temporarily enable source maps in production to see exact error locations
   - See build errors more clearly

3. **Add Error Boundary:**
   - The app now includes an error boundary that should catch and display errors
   - Check if you see an error message instead of white screen

4. **Verify Asset Loading:**
   - Check Network tab in DevTools
   - Ensure all JS/CSS files load with 200 status
   - Look for 404 errors on assets

## Environment Variable Verification

You can verify env vars are loaded by adding this temporarily to your app:

```tsx
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('AI Provider:', import.meta.env.VITE_AI_PROVIDER);
```

**Note:** Remove these console logs before committing!

## Need Help?

1. Share the browser console errors
2. Share the Vercel build logs
3. Verify the deployment URL: https://myzentry.vercel.app
