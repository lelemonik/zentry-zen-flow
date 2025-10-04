# AI Chat Integration Guide - ChatGPT

## ✅ FULLY FUNCTIONAL AI CHAT WITH CHATGPT

The AI Chat feature is now fully integrated with OpenAI's ChatGPT (GPT-3.5 Turbo) and only works when online.

---

## 🚀 Features

### ✨ What's Included:
- ✅ **Real ChatGPT Integration** - Powered by GPT-3.5 Turbo
- ✅ **Online-Only Mode** - Only works with internet connection
- ✅ **Real-time Status** - Shows online/offline status
- ✅ **Conversation Context** - Maintains chat history in session
- ✅ **Smart Error Handling** - Graceful fallbacks when API fails
- ✅ **Auto-scrolling** - Messages scroll automatically
- ✅ **Loading States** - Typing indicators while AI responds
- ✅ **Security** - API key stored in environment variables

### 🎯 User Experience:
- **Online**: Full ChatGPT functionality
- **Offline**: Feature disabled with clear message
- **Connection Lost**: Instant notification
- **API Error**: Helpful fallback message

---

## 📋 Setup Instructions

### Step 1: Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up or log in
3. Click **"Create new secret key"**
4. Copy your API key (starts with `sk-`)
5. **IMPORTANT**: Save it securely - you can't see it again!

### Step 2: Configure Environment Variable

1. **Create `.env.local` file** in the project root:
```bash
# In the zentry-zen-flow folder
touch .env.local  # Mac/Linux
# OR
type nul > .env.local  # Windows
```

2. **Add your OpenAI API key**:
```bash
# .env.local
VITE_OPENAI_API_KEY=sk-proj-your-actual-api-key-here
```

3. **Restart your development server**:
```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 3: Test the Integration

1. Open Zentry in your browser
2. Navigate to **AI Chat** from the menu
3. Check that status shows **"Online"** (green)
4. Type a message and hit Send
5. ChatGPT should respond within 2-3 seconds

---

## 🔧 Technical Details

### API Configuration

**Model**: GPT-3.5 Turbo
- Fast and cost-effective
- Good balance of quality and speed
- ~$0.002 per 1K tokens

**Settings**:
```javascript
{
  model: 'gpt-3.5-turbo',
  max_tokens: 500,        // Max response length
  temperature: 0.7,       // Creativity (0-1)
}
```

**System Prompt**:
```
You are a helpful AI assistant for Zentry, a productivity app. 
Help users with their tasks, notes, schedules, and general 
productivity questions. Be friendly, concise, and helpful.
```

### Online Detection

The app monitors internet connectivity:
```typescript
// Listens for online/offline events
window.addEventListener('online', handleOnline);
window.addEventListener('offline', handleOffline);
```

**When Offline**:
- Input field is disabled
- Send button is disabled
- Clear alert message displayed
- Toast notification if user tries to send

---

## 💰 Cost Estimation

### GPT-3.5 Turbo Pricing:
- **Input**: $0.0015 per 1K tokens
- **Output**: $0.002 per 1K tokens

### Example Usage:
```
Average conversation:
- User message: ~50 tokens
- AI response: ~200 tokens
- Cost per exchange: ~$0.0005

100 conversations = ~$0.05
1000 conversations = ~$0.50
```

### Free Tier:
- New OpenAI accounts get **$5 free credit**
- Enough for ~10,000 conversations
- Credit expires after 3 months

---

## 🔒 Security Best Practices

### ✅ DO:
- Store API key in `.env.local` (gitignored)
- Never commit `.env.local` to version control
- Use environment variables for sensitive data
- Monitor your OpenAI usage dashboard

### ❌ DON'T:
- Hard-code API key in source code
- Share your API key publicly
- Commit `.env.local` to Git
- Use production keys in development

### API Key Security:
```bash
# .gitignore already includes:
.env.local
.env
```

---

## 🐛 Troubleshooting

### "AI Service Unavailable" Error

**Possible Causes**:
1. **API Key Not Set**
   - Check `.env.local` exists
   - Verify `VITE_OPENAI_API_KEY` is set
   - Restart dev server

2. **Invalid API Key**
   - Key must start with `sk-`
   - Check for typos or extra spaces
   - Generate new key if needed

3. **No Internet Connection**
   - Check online status indicator
   - Test your network connection
   - Try refreshing the page

4. **API Rate Limit**
   - Free tier: 3 requests/minute
   - Wait 60 seconds and retry
   - Upgrade OpenAI account if needed

5. **Quota Exceeded**
   - Check OpenAI dashboard for usage
   - Add payment method or wait for reset
   - Free credits may have expired

### Check Console for Details

Open browser DevTools (F12) → Console:
```javascript
// Look for errors like:
ChatGPT API Error: Error: API error: 401
// ↑ Invalid API key

ChatGPT API Error: Error: API error: 429
// ↑ Rate limit exceeded

ChatGPT API Error: TypeError: Failed to fetch
// ↑ Network issue
```

### Environment Variable Not Loading

```bash
# 1. Verify file exists
ls -la .env.local

# 2. Check contents
cat .env.local

# 3. Restart dev server
npm run dev

# 4. Verify in browser console
console.log(import.meta.env.VITE_OPENAI_API_KEY ? 'Key loaded' : 'Key missing')
```

---

## 🎨 Customization

### Change AI Model

Edit `src/pages/Chat.tsx`:
```typescript
model: 'gpt-4',  // More capable but slower/costlier
// OR
model: 'gpt-3.5-turbo-16k',  // Longer context
```

### Adjust Response Length

```typescript
max_tokens: 1000,  // Longer responses (default: 500)
```

### Modify Personality

```typescript
{
  role: 'system',
  content: 'You are a [your custom personality]...'
}
```

### Add Conversation Memory

Currently stores messages in state (session only).
To persist:
```typescript
// Save to localStorage
localStorage.setItem('chat_history', JSON.stringify(messages));

// Load on mount
const savedMessages = localStorage.getItem('chat_history');
if (savedMessages) {
  setMessages(JSON.parse(savedMessages));
}
```

---

## 📊 Features Breakdown

| Feature | Status | Notes |
|---------|--------|-------|
| ChatGPT Integration | ✅ Complete | GPT-3.5 Turbo |
| Online Detection | ✅ Complete | Real-time status |
| Offline Mode | ✅ Complete | Graceful degradation |
| Error Handling | ✅ Complete | Fallback messages |
| Loading States | ✅ Complete | Typing indicators |
| Auto-scroll | ✅ Complete | Smooth scrolling |
| Conversation History | ✅ Complete | Session-based |
| API Security | ✅ Complete | Env variables |

---

## 🔮 Future Enhancements

### Easy Additions:
- [ ] Save conversation history to Supabase
- [ ] Export chat transcripts
- [ ] Clear conversation button
- [ ] Voice input (Speech-to-text)
- [ ] Message editing
- [ ] Regenerate response

### Advanced Features:
- [ ] Switch between GPT-3.5 and GPT-4
- [ ] Custom AI personalities
- [ ] Task creation from chat
- [ ] Schedule events from chat
- [ ] Context-aware suggestions (knows your tasks/notes)
- [ ] Multi-language support

---

## 📚 API Documentation

- [OpenAI API Docs](https://platform.openai.com/docs/api-reference)
- [GPT-3.5 Turbo Guide](https://platform.openai.com/docs/guides/gpt)
- [Usage Limits](https://platform.openai.com/account/limits)
- [Pricing](https://openai.com/pricing)

---

## ✅ Quick Start Checklist

- [ ] Create OpenAI account
- [ ] Generate API key
- [ ] Create `.env.local` file
- [ ] Add `VITE_OPENAI_API_KEY=sk-...`
- [ ] Restart dev server
- [ ] Test AI Chat feature
- [ ] Verify online status shows
- [ ] Send test message
- [ ] Receive ChatGPT response

---

## 🎉 Success Criteria

Your AI Chat is working correctly when:
- ✅ Online indicator shows green "Online"
- ✅ You can type and send messages
- ✅ ChatGPT responds within 2-5 seconds
- ✅ Responses are contextual and helpful
- ✅ Offline mode shows warning when disconnected
- ✅ No console errors appear

---

## 📞 Support

**OpenAI Issues**:
- [OpenAI Help Center](https://help.openai.com/)
- [Community Forum](https://community.openai.com/)

**Zentry Issues**:
- Check browser console for errors
- Verify environment variables are set
- Test internet connection
- Review troubleshooting section above

---

**Status**: ✅ **FULLY FUNCTIONAL**
**Last Updated**: October 4, 2025
**Integration**: Complete and Production-Ready
