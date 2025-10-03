# Vercel Deployment Instructions

## 🚀 Deploy to Vercel (Takes ~3 minutes)

### Step 1: Commit & Push Your Code
```bash
git add .
git commit -m "Add Vercel configuration"
git push origin main
```

### Step 2: Deploy to Vercel
1. Go to **https://vercel.com**
2. Click **"Sign in with GitHub"**
3. Authorize Vercel to access your repositories
4. Click **"New Project"** or **"Add New..."** → **"Project"**
5. Find and select your **`zentry-zen-flow`** repository
6. **Configure Project** (Vercel will auto-detect everything!):
   - Framework Preset: **Vite** ✅
   - Root Directory: `./` ✅
   - Build Command: `npm run build` ✅
   - Output Directory: `dist` ✅
7. Add Environment Variable (Important for Supabase):
   - Click **"Environment Variables"**
   - Add: `VITE_SUPABASE_URL` = `https://vnixcafcspbqhuytciog.supabase.co`
   - Add: `VITE_SUPABASE_ANON_KEY` = (your anon key from Supabase)
8. Click **"Deploy"** 🚀

### Step 3: Wait for Build (1-2 minutes)
- Vercel will build your app
- You'll see a progress bar
- Once done, you'll get a live URL! 🎉

### Step 4: Your PWA is Live! ✨
- You'll get a URL like: `https://zentry-zen-flow.vercel.app`
- Share it with anyone!
- Install it as a PWA on mobile/desktop

## 🔧 After Deployment

### Automatic Deployments
Every time you push to GitHub, Vercel will automatically:
- Build your app
- Deploy the new version
- Give you a preview URL

### Custom Domain (Optional)
1. Go to your project in Vercel
2. Click **"Settings"** → **"Domains"**
3. Add your custom domain
4. Follow DNS instructions

### Monitor Your App
- View analytics in Vercel dashboard
- Check build logs
- See deployment history

## 🎯 Troubleshooting

### If build fails:
1. Check build logs in Vercel
2. Make sure `package.json` has all dependencies
3. Test locally: `npm run build`

### If PWA doesn't work:
1. Make sure you're using HTTPS (Vercel does this by default)
2. Check service worker in DevTools
3. Verify manifest.json is accessible

## 📱 Test Your PWA

### On Mobile:
1. Open your Vercel URL in Chrome/Safari
2. Look for "Add to Home Screen" prompt
3. Install and open as an app!

### On Desktop:
1. Open in Chrome
2. Look for install icon in address bar
3. Click to install

---

**Your app is ready to deploy! Just follow the steps above.** 🚀
