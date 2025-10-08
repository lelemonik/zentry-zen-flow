import { useState, useEffect, useRef } from 'react';
import AppLayout from '@/components/Layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send, Sparkles, WifiOff, Wifi } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const Chat = () => {
  const aiProvider = import.meta.env.VITE_AI_PROVIDER || 'gemini';
  const aiName = aiProvider === 'gemini' ? 'Google Gemini' : 'ChatGPT';
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hello! I'm your AI assistant powered by ${aiName}. How can I help you today?`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Check if online
    if (!isOnline) {
      toast({
        title: 'No internet connection',
        description: 'AI Chat requires an internet connection to work.',
        variant: 'destructive',
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    const userInput = input;
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      let response: Response;
      
      if (aiProvider === 'gemini') {
        // Call Google Gemini API
        const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
        
        response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: userInput
                    }
                  ]
                }
              ]
            }),
          }
        );
      } else {
        // Call OpenAI ChatGPT API
        response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY || ''}`,
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: 'You are a helpful AI assistant for Zentry, a productivity app. Help users with their tasks, notes, schedules, and general productivity questions. Be friendly, concise, and helpful.'
              },
              ...messages.map(msg => ({
                role: msg.role,
                content: msg.content
              })),
              {
                role: 'user',
                content: userInput
              }
            ],
            max_tokens: 500,
            temperature: 0.6,
          }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error Details:', { 
          status: response.status, 
          statusText: response.statusText,
          errorData,
          provider: aiProvider,
          url: response.url
        });
        
        // Handle specific error codes
        if (response.status === 429) {
          throw new Error('RATE_LIMIT');
        } else if (response.status === 401 || response.status === 403) {
          throw new Error('INVALID_KEY');
        } else if (response.status === 402) {
          throw new Error('QUOTA_EXCEEDED');
        } else if (response.status === 404) {
          throw new Error('NOT_FOUND');
        } else {
          throw new Error(`API error: ${response.status}`);
        }
      }

      const data = await response.json();
      
      // Extract response based on provider
      let aiResponse: string;
      if (aiProvider === 'gemini') {
        aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I couldn\'t generate a response.';
      } else {
        aiResponse = data.choices?.[0]?.message?.content || 'Sorry, I couldn\'t generate a response.';
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('ChatGPT API Error:', error);
      
      // Determine error message based on error type
      let errorMessage = '';
      let toastTitle = 'AI Service Error';
      
      if (error instanceof Error) {
        if (error.message === 'RATE_LIMIT') {
          errorMessage = `⏱️ **Rate Limit Reached**\n\nYou've sent too many requests too quickly. OpenAI has rate limits:\n\n**Free Tier:**\n• 3 requests per minute\n• 200 requests per day\n\n**What to do:**\n1. Wait 60 seconds before trying again\n2. Or upgrade your OpenAI account for higher limits\n3. Check your usage at: platform.openai.com/usage\n\nPlease try again in a minute!`;
          toastTitle = 'Rate Limit Exceeded';
        } else if (error.message === 'INVALID_KEY') {
          errorMessage = `🔑 **Invalid API Key**\n\nYour OpenAI API key appears to be invalid or expired.\n\n**Steps to fix:**\n1. Go to platform.openai.com/api-keys\n2. Generate a new API key\n3. Update your .env.local file\n4. Restart the dev server\n\nContact support if the issue persists.`;
          toastTitle = 'Invalid API Key';
        } else if (error.message === 'QUOTA_EXCEEDED') {
          errorMessage = `💳 **Quota Exceeded**\n\nYou've used up your ${aiProvider === 'gemini' ? 'Gemini' : 'OpenAI'} credits or quota.\n\n**Solutions:**\n1. Check your usage in the API dashboard\n2. Wait for your quota to reset\n3. Upgrade to a paid plan for more usage`;
          toastTitle = 'Quota Exceeded';
        } else if (error.message === 'NOT_FOUND') {
          errorMessage = `❌ **API Not Found (404)**\n\nThe ${aiProvider === 'gemini' ? 'Gemini' : 'OpenAI'} API endpoint returned a 404 error.\n\n**For Gemini API:**\n1. Check if the API is enabled at: console.cloud.google.com/apis/library/generativelanguage.googleapis.com\n2. Verify your API key is correct\n3. Make sure you're using a valid model name\n4. Wait a few minutes if you just enabled the API\n\n**Common Issues:**\n• API key might be for wrong project\n• Model name might be incorrect\n• API not fully activated yet`;
          toastTitle = 'API Not Found';
        } else {
          errorMessage = `I apologize, but I'm having trouble connecting to the ${aiProvider === 'gemini' ? 'Gemini' : 'OpenAI'} AI service right now. This could be because:\n\n1. The API key is not configured properly\n2. There's a network issue\n3. The AI service is temporarily unavailable\n\nPlease check your configuration or try again later. Error: ${error.message}`;
        }
      } else {
        errorMessage = `I apologize, but an unexpected error occurred. Please try again later.`;
      }
      
      // Fallback response when API fails
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
      
      toast({
        title: toastTitle,
        description: error instanceof Error && error.message === 'RATE_LIMIT' 
          ? 'Please wait 60 seconds before trying again' 
          : 'Unable to connect to ChatGPT. Check the chat for details.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)]">
        <div className="flex flex-col h-full">
          <div className="mb-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  AI Assistant
                </h1>
                <p className="text-muted-foreground mt-1">Chat with AI powered by Gemini</p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                {isOnline ? (
                  <>
                    <Wifi className="w-4 h-4 text-green-500" />
                    <span className="text-green-500 font-medium">Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 text-destructive" />
                    <span className="text-destructive font-medium">Offline</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Offline Alert */}
          {!isOnline && (
            <Alert className="mb-4 border-destructive/50 bg-destructive/10">
              <WifiOff className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-destructive">
                You're currently offline. AI Chat requires an internet connection to work.
              </AlertDescription>
            </Alert>
          )}

          <Card className="glass flex-1 flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Chat with {aiProvider === 'gemini' ? 'Gemini Pro' : 'GPT-3.5 Turbo'}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-primary to-secondary text-white'
                          : 'glass'
                      }`}
                    >
                      {message.role === 'assistant' && (
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="w-4 h-4 text-primary" />
                          <span className="text-xs font-medium text-primary">AI Assistant</span>
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-white/70' : 'text-muted-foreground'}`}>
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="glass max-w-[80%] p-4 rounded-2xl">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-sm text-muted-foreground">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <Input
                  placeholder={isOnline ? "Type your message..." : "Connect to internet to chat..."}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading || !isOnline}
                  className="flex-1"
                />
                <Button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim() || !isOnline}
                  className="gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send
                </Button>
              </div>

              <p className="text-xs text-muted-foreground mt-2 text-center">
                {isOnline 
                  ? `🤖 Powered by ${aiProvider === 'gemini' ? 'Google Gemini Pro' : 'OpenAI GPT-3.5 Turbo'} • Your conversations are private`
                  : '⚠️ Internet connection required for AI features'
                }
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Chat;
