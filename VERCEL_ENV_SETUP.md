# Vercel Environment Variables Setup

## 🔑 Fix AI Chat After Deployment

The AI chat is not working on Vercel because the API keys are missing. Follow these steps to fix it:

## Quick Fix (5 minutes)

### Step 1: Choose Your AI Provider

**Option A: Google Gemini (Recommended - Free & Better Limits)**
- ✅ 60 requests/minute (vs OpenAI's 3)
- ✅ 1,500 requests/day
- ✅ Completely free
- Get key at: https://aistudio.google.com/apikey

**Option B: OpenAI ChatGPT**
- 3 requests/minute (free tier)
- Need credit card for higher limits
- Get key at: https://platform.openai.com/api-keys

### Step 2: Add Environment Variables to Vercel

#### Method 1: Via Vercel Dashboard (Easiest)

1. **Go to Vercel**: https://vercel.com/dashboard
2. Click on your **zentry-zen-flow** project
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

**For Gemini:**
```
VITE_GEMINI_API_KEY = [paste your Gemini API key]
VITE_AI_PROVIDER = gemini
```

**For OpenAI:**
```
VITE_OPENAI_API_KEY = [paste your OpenAI API key]
VITE_AI_PROVIDER = openai
```

5. **Important**: Select all environments (Production, Preview, Development)
6. Click **"Save"**

### Step 3: Redeploy

After adding environment variables, you must redeploy:

**Option A: Trigger Redeploy in Vercel**
1. Go to **Deployments** tab
2. Click **"..."** (three dots) on latest deployment
3. Click **"Redeploy"**
4. Wait 1-2 minutes

**Option B: Push a New Commit**
```bash
# Make a small change
echo "# Environment variables configured" >> README.md
git add .
git commit -m "Configure AI environment variables"
git push origin main
```

Vercel will automatically deploy with the new environment variables.

### Step 4: Test

1. Visit your Vercel URL (e.g., `https://zentry-zen-flow.vercel.app`)
2. Go to the **AI Chat** page
3. Send a message
4. You should get a response! 🎉

## Verification

### Check if Variables are Set

You can verify in the Vercel dashboard:
1. Settings → Environment Variables
2. You should see `VITE_GEMINI_API_KEY` or `VITE_OPENAI_API_KEY`
3. The value will be hidden (shows as `*****`)

### If Still Not Working

1. **Check Browser Console** (F12):
   - Look for API errors
   - Check if the API key is loaded: `console.log(import.meta.env.VITE_GEMINI_API_KEY ? 'loaded' : 'missing')`

2. **Verify API Key is Valid**:
   - Test locally first with `npm run dev`
   - Make sure the key works before deploying

3. **Check Vercel Build Logs**:
   - Go to Deployments → click on latest deployment
   - Check for any build errors

## Common Issues

### "AI Service Unavailable" Error
- ✅ Make sure environment variables are added to **Production** environment
- ✅ Verify you redeployed after adding variables
- ✅ Check that API key is valid and not expired

### Variables Not Loading
- ✅ Environment variables MUST start with `VITE_` to be accessible in the browser
- ✅ Must redeploy after adding variables
- ✅ Clear browser cache and hard refresh (Ctrl+Shift+R)

### 404 Error (Gemini)
- ✅ Enable the API: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com
- ✅ Wait 5-10 minutes after creating new API key
- ✅ Try generating a new API key

### 401 Error (OpenAI)
- ✅ Verify API key is correct
- ✅ Check if you have credits/quota remaining
- ✅ Make sure key hasn't expired

## Security Notes

✅ **Safe to expose in browser**: API keys with `VITE_` prefix are bundled into the client code
⚠️ **Important**: Only use keys with appropriate rate limits and quotas
⚠️ **Monitor usage**: Check your API dashboard regularly
✅ **Both providers**: Have free tiers and rate limiting built-in

## Cost Monitoring

### Gemini (Free Tier)
- 60 requests/minute
- 1,500 requests/day
- Completely free, no credit card needed
- Monitor at: https://aistudio.google.com/

### OpenAI (Paid)
- Free tier: $5 credit (expires in 3 months)
- Monitor at: https://platform.openai.com/usage
- Set usage limits in dashboard

## Support

If you continue having issues:

1. **Check documentation**:
   - See AI_CHAT_SETUP.md
   - See GEMINI_SETUP_GUIDE.md

2. **Verify locally first**:
   ```bash
   npm run dev
   # Test AI chat locally before deploying
   ```

3. **Contact support**:
   - Vercel: https://vercel.com/support
   - Gemini: https://ai.google.dev/
   - OpenAI: https://help.openai.com/

---

## Quick Reference

### Vercel Dashboard URLs
- Project Settings: `https://vercel.com/[your-username]/zentry-zen-flow/settings`
- Environment Variables: `https://vercel.com/[your-username]/zentry-zen-flow/settings/environment-variables`
- Deployments: `https://vercel.com/[your-username]/zentry-zen-flow/deployments`

### API Key URLs
- Gemini: https://aistudio.google.com/apikey
- OpenAI: https://platform.openai.com/api-keys

---

**After following these steps, your AI chat should work perfectly on Vercel!** ✨
