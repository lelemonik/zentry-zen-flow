# 🚨 FIX AI CHAT - 403 FORBIDDEN ERROR

## The Problem
Your AI chat shows this error:
```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key= 403 (Forbidden)
Error: INVALID_KEY
```

**Root Cause**: The `VITE_GEMINI_API_KEY` environment variable is **NOT SET** in your Vercel deployment.

Notice the URL ends with `?key=` with nothing after it - that's because the API key is missing!

---

## ✅ IMMEDIATE FIX (5 Minutes)

### Step 1: Get Your Gemini API Key

1. **Go to Google AI Studio**: https://aistudio.google.com/apikey
2. **Sign in** with your Google account
3. **Click "Create API Key"**
   - Choose "Create API key in new project" (or select existing project)
4. **Copy the key** immediately (starts with something like `AIzaSy...`)
5. **Keep it safe** - you won't see it again!

### Step 2: Add Environment Variable to Vercel

**DO THIS NOW:**

1. **Open Vercel Dashboard**: https://vercel.com/dashboard
2. **Find your project**: Click on `zentry-zen-flow`
3. **Go to Settings**: Click "Settings" in the top menu
4. **Click "Environment Variables"** in the left sidebar
5. **Add New Variable**:
   ```
   Name: VITE_GEMINI_API_KEY
   Value: [Paste your API key from Step 1]
   ```
6. **Select all environments**: ✅ Production ✅ Preview ✅ Development
7. **Click "Save"**

8. **Add AI Provider Variable**:
   ```
   Name: VITE_AI_PROVIDER
   Value: gemini
   ```
9. **Select all environments** again
10. **Click "Save"**

### Step 3: Redeploy Your App

**You MUST redeploy after adding environment variables!**

**Option A: Via Vercel Dashboard**
1. Go to **"Deployments"** tab
2. Find your latest deployment
3. Click the **three dots (...)** on the right
4. Click **"Redeploy"**
5. Confirm and wait 1-2 minutes

**Option B: Push a New Commit** (Faster)
```bash
# In your terminal, run:
git commit --allow-empty -m "Configure Gemini API key"
git push origin main
```

### Step 4: Test Your Fix

1. Wait for deployment to complete (~2 minutes)
2. Visit your Vercel URL: `https://your-app.vercel.app`
3. Go to **AI Chat** page
4. Send a test message: "Hello"
5. ✅ You should get a response from Gemini!

---

## 🔍 Verify It's Working

### Check in Browser Console:
1. Open your deployed site
2. Press **F12** to open DevTools
3. Go to **Console** tab
4. Type: `console.log(import.meta.env.VITE_GEMINI_API_KEY)`
5. It should show your API key (or at least part of it)
6. If it shows `undefined`, the environment variable is not set correctly

### Check the API Request:
1. Open **Network** tab in DevTools
2. Send a chat message
3. Look for the Gemini API request
4. The URL should now have `?key=AIzaSy...` (with your actual key)
5. Status should be **200 OK**, not 403

---

## 🐛 Troubleshooting

### Still Getting 403 Error?

#### Issue 1: API Not Enabled
1. Go to: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com
2. Make sure you're in the **correct Google Cloud project** (same one as your API key)
3. Click **"Enable"** button
4. Wait 2-3 minutes for it to activate
5. Try again

#### Issue 2: Wrong API Key or Expired
1. Generate a **NEW** API key at: https://aistudio.google.com/apikey
2. Delete the old one if needed
3. Update in Vercel environment variables
4. Redeploy

#### Issue 3: Regional Restrictions
1. Check if Gemini is available in your region: https://ai.google.dev/gemini-api/docs/available-regions
2. If not available, switch to OpenAI (see Alternative Solution below)

#### Issue 4: Environment Variable Not Applied
1. Make sure you clicked **"Save"** in Vercel
2. Make sure you **redeployed** after adding variables
3. Check Vercel deployment logs for any errors
4. Try clearing browser cache (Ctrl+Shift+Delete)

### Still Shows `?key=` with No Value?

This means Vercel didn't pick up the environment variable. Check:

1. **Variable name is EXACT**: `VITE_GEMINI_API_KEY` (case-sensitive!)
2. **No extra spaces** in name or value
3. **Applied to Production** environment
4. **Redeployed after saving**

---

## 🔄 Alternative: Use OpenAI Instead

If Gemini continues to have issues, switch to OpenAI:

### Step 1: Get OpenAI API Key
1. Go to: https://platform.openai.com/api-keys
2. Create new secret key
3. Copy it (starts with `sk-proj-...`)

### Step 2: Update Vercel Environment Variables
1. In Vercel → Settings → Environment Variables
2. **Remove or rename** `VITE_GEMINI_API_KEY`
3. **Add new variable**:
   ```
   Name: VITE_OPENAI_API_KEY
   Value: [Your OpenAI key]
   ```
4. **Update provider**:
   ```
   Name: VITE_AI_PROVIDER
   Value: openai
   ```
5. Save and redeploy

### Step 3: Note OpenAI Limits
- Free tier: 3 requests/minute (vs Gemini's 60)
- Requires credit card for higher limits
- $5 free credit (expires in 3 months)

---

## 📋 Checklist

Before asking for help, make sure you've done ALL of these:

- [ ] Created Gemini API key at https://aistudio.google.com/apikey
- [ ] Added `VITE_GEMINI_API_KEY` in Vercel environment variables
- [ ] Added `VITE_AI_PROVIDER=gemini` in Vercel environment variables
- [ ] Selected **Production** environment when adding variables
- [ ] Clicked **"Save"** button in Vercel
- [ ] **Redeployed** the app after adding variables
- [ ] Waited 2-3 minutes for deployment to complete
- [ ] Cleared browser cache and hard refreshed (Ctrl+Shift+R)
- [ ] Checked browser console for the actual error
- [ ] Verified API is enabled in Google Cloud Console
- [ ] Tested the API key locally first

---

## 🎯 Quick Test Locally

Want to test before deploying? Create a local `.env.local` file:

```bash
# Create the file
echo "VITE_GEMINI_API_KEY=your_actual_key_here" > .env.local
echo "VITE_AI_PROVIDER=gemini" >> .env.local

# Restart dev server
npm run dev
```

Then test at http://localhost:8080

If it works locally but not on Vercel, the issue is 100% the Vercel environment variables.

---

## 📞 Still Need Help?

### Verify These Screenshots:
1. Screenshot of Vercel Environment Variables page showing `VITE_GEMINI_API_KEY`
2. Screenshot of Vercel deployment success
3. Screenshot of browser console error
4. Screenshot of Network tab showing the API request

### Check These URLs:
- Vercel Project: https://vercel.com/dashboard (find your project)
- Google AI Studio: https://aistudio.google.com/
- Google Cloud Console: https://console.cloud.google.com/

---

## 🎉 Success Indicators

You'll know it's working when:
- ✅ No 403 error in browser console
- ✅ API URL shows `?key=AIzaSy...` (with actual key)
- ✅ Network tab shows **200 OK** status
- ✅ You receive responses from Gemini
- ✅ No "INVALID_KEY" errors

---

**DO NOT skip the redeploy step!** Environment variables only take effect after redeploying.

**Last Updated**: October 6, 2025
