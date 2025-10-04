# Gemini API Setup Guide

## Getting Your API Key

The 404 error suggests your Gemini API key might be invalid or restricted. Here's how to get a working key:

### Step 1: Get a New API Key

1. **Visit Google AI Studio**: https://aistudio.google.com/apikey
   - (Or alternative: https://makersuite.google.com/app/apikey)

2. **Sign in** with your Google account

3. **Create API Key**:
   - Click "Create API Key" button
   - Choose "Create API key in new project" or select an existing project
   - Copy the key immediately (it won't be shown again)

### Step 2: Update Your Configuration

1. **Open `.env.local`** in your project root

2. **Replace the API key**:
   ```bash
   VITE_GEMINI_API_KEY=YOUR_NEW_KEY_HERE
   VITE_AI_PROVIDER=gemini
   ```

3. **Restart the dev server**:
   - Press `Ctrl+C` to stop the server
   - Run `npm run dev` to restart

### Step 3: Verify the Setup

1. Go to the Chat page in your app
2. Send a test message like "Hello"
3. You should get a response from Gemini Pro

## Common Issues

### 404 Error
- **Cause**: Invalid or expired API key
- **Solution**: Generate a new key from Google AI Studio

### 403 Error
- **Cause**: API key doesn't have permission
- **Solution**: Check your Google Cloud project permissions

### Rate Limit (429)
- **Cause**: Too many requests
- **Solution**: Gemini free tier allows 60 requests/minute - much better than OpenAI!

## Benefits of Gemini

✅ **Free Tier**:
- 60 requests per minute
- 1,500 requests per day
- Completely free, no credit card required

✅ **Better Limits** than OpenAI:
- OpenAI Free: 3 req/min
- Gemini Free: 60 req/min

✅ **Good Performance**:
- Fast responses
- Supports conversation history
- Multiple models available

## API Endpoint Format

The correct endpoint is:
```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_API_KEY
```

## Testing Your Key

You can test your API key with curl:

```bash
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_API_KEY" \
-H "Content-Type: application/json" \
-d '{
  "contents": [{
    "parts": [{"text": "Hello, how are you?"}]
  }]
}'
```

If you get a valid JSON response, your key is working!

## Support

If you continue to have issues:
1. Check the Google AI Studio dashboard for API usage
2. Verify your API key is copied correctly (no extra spaces)
3. Make sure you're using the latest API key
4. Try creating a new project and new API key

## Documentation

- Official Docs: https://ai.google.dev/gemini-api/docs
- API Reference: https://ai.google.dev/api/generate-content
- Get API Key: https://aistudio.google.com/apikey
