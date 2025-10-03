import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Brain, Lock, Zap, Calendar, StickyNote } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Landing = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);

  // No redirect here - let App.tsx RootRedirect handle it

  const features = [
    { icon: <CheckCircle2 className="w-6 h-6" />, title: 'Task Management', desc: 'Organize with priorities & progress tracking' },
    { icon: <StickyNote className="w-6 h-6" />, title: 'Smart Notes', desc: 'Auto-save with rich formatting' },
    { icon: <Calendar className="w-6 h-6" />, title: 'Visual Schedule', desc: 'Time-block your day effortlessly' },
    { icon: <Brain className="w-6 h-6" />, title: 'AI Assistant', desc: 'ChatGPT integration for instant help' },
    { icon: <Lock className="w-6 h-6" />, title: 'Privacy First', desc: 'All data stored locally' },
    { icon: <Zap className="w-6 h-6" />, title: 'Lightning Fast', desc: 'Works offline, syncs instantly' },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-block mb-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/50">
              <span className="text-4xl font-bold text-white">Z</span>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-slide-up">
            Welcome to Zentry
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-slide-up">
            Your personal productivity suite with tasks, notes, scheduling, and AI assistance - all in one beautiful app
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
              onClick={() => navigate('/auth')}
            >
              Get Started
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-6 rounded-2xl glass border-2"
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="glass rounded-3xl p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 animate-scale-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4 text-white">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* App Preview */}
        <div className="glass rounded-3xl p-8 text-center animate-fade-in">
          <h2 className="text-3xl font-bold mb-4">Beautiful, Fast, Private</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Zentry combines powerful productivity tools with a stunning glassmorphic interface. 
            Everything is stored locally on your device, with optional cloud backup.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <span className="px-4 py-2 bg-primary/10 rounded-full text-primary font-medium">Offline First</span>
            <span className="px-4 py-2 bg-secondary/10 rounded-full text-secondary font-medium">PWA Ready</span>
            <span className="px-4 py-2 bg-accent/10 rounded-full text-accent font-medium">Zero Setup</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
