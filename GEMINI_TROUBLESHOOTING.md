# Gemini API 404 Error - Troubleshooting

## Current Issue
Getting 404 errors when calling the Gemini API, even with a fresh API key.

## Possible Causes & Solutions

### 1. API Key Not Activated Yet
**Issue**: New API keys sometimes take a few minutes to activate.
**Solution**: Wait 5-10 minutes and try again.

### 2. Generative Language API Not Enabled
**Issue**: The API might not be enabled in your Google Cloud project.

**Steps to Enable**:
1. Go to: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com
2. Make sure you're in the correct project (the one you created the API key in)
3. Click "Enable" button
4. Wait 1-2 minutes for it to activate
5. Try again

### 3. Regional Restrictions
**Issue**: Some regions might have restrictions.
**Solution**: Check if Gemini API is available in your region at https://ai.google.dev/gemini-api/docs/available-regions

### 4. Billing Not Set Up (Less Likely for Free Tier)
**Issue**: Some Google Cloud APIs require billing info even for free tier.
**Solution**: 
1. Go to: https://console.cloud.google.com/billing
2. Link a billing account (you won't be charged for free tier usage)

### 5. Try Different Authentication Method
**Issue**: API key authentication might have issues.
**Solution**: Let's try using a different endpoint or OAuth instead.

## Quick Test Commands

### Test with curl (if you have it):
```bash
curl https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_KEY \
  -H 'Content-Type: application/json' \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

### Test in Browser:
Open this URL and replace YOUR_KEY:
```
https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_KEY
```

This should list available models if your key is working.

## Alternative: Try OpenAI Instead

If Gemini continues to have issues, we can switch back to OpenAI with a better approach:

1. Get OpenAI credits or use a paid account
2. Or use a different free AI service

Let me know which approach you'd like to take!
