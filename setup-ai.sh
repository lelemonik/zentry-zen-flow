#!/bin/bash

# Quick Setup Script for AI Chat
# This script helps you configure your environment variables

echo "🚀 Zentry AI Chat Setup"
echo "======================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local file not found!"
    echo "Creating .env.local from template..."
    cp .env.example .env.local
    echo "✅ Created .env.local file"
fi

echo ""
echo "📋 Current Setup Instructions:"
echo ""
echo "1. Get your Gemini API key:"
echo "   👉 Visit: https://aistudio.google.com/apikey"
echo "   👉 Click 'Create API Key'"
echo "   👉 Copy the key (starts with 'AIzaSy...')"
echo ""
echo "2. Edit .env.local file:"
echo "   👉 Replace 'your_gemini_api_key_here' with your actual key"
echo ""
echo "3. Restart the dev server:"
echo "   👉 Press Ctrl+C to stop"
echo "   👉 Run: npm run dev"
echo ""
echo "4. Test locally at: http://localhost:8080"
echo ""
echo "5. For production (Vercel):"
echo "   👉 Add VITE_GEMINI_API_KEY in Vercel dashboard"
echo "   👉 Add VITE_AI_PROVIDER=gemini"
echo "   👉 Redeploy your app"
echo ""
echo "📚 See VERCEL_ENV_SETUP.md for detailed instructions"
echo ""
echo "✨ Ready to test? Run: npm run dev"
