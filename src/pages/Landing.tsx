import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Brain, Lock, Zap, Calendar, StickyNote, Download, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const Landing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  // No redirect here - let App.tsx RootRedirect handle it

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      toast({
        title: 'Already Installed',
        description: 'The app is already installed or not installable on this device.',
      });
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      toast({
        title: 'App Installed!',
        description: '🎉 Zentry has been installed successfully!',
      });
    }

    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const features = [
    { icon: <CheckCircle2 className="w-6 h-6" />, title: 'Task Management', desc: 'Organize with priorities & progress tracking' },
    { icon: <StickyNote className="w-6 h-6" />, title: 'Smart Notes', desc: 'Auto-save with rich formatting' },
    { icon: <Calendar className="w-6 h-6" />, title: 'Visual Schedule', desc: 'Time-block your day effortlessly' },
    { icon: <Brain className="w-6 h-6" />, title: 'AI Assistant', desc: 'ChatGPT integration for instant help' },
    { icon: <Lock className="w-6 h-6" />, title: 'Privacy First', desc: 'All data stored locally' },
    { icon: <Zap className="w-6 h-6" />, title: 'Lightning Fast', desc: 'Works offline, syncs instantly' },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 overflow-hidden">
      <div className="w-full max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-16 animate-fade-in">
          <div className="inline-block mb-4 md:mb-6">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/50">
              <span className="text-3xl md:text-4xl font-bold text-white">Z</span>
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-slide-up leading-tight">
            Welcome to Zentry
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto animate-slide-up px-4">
            Your personal productivity suite with tasks, notes, scheduling, and AI assistance - all in one beautiful app
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105 w-full sm:w-auto"
              onClick={() => navigate('/auth')}
            >
              Get Started
            </Button>
            {isInstallable && (
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-6 rounded-2xl glass border-2 w-full sm:w-auto"
                onClick={handleInstallClick}
              >
                <Download className="w-5 h-5 mr-2" />
                Install App
              </Button>
            )}
            {!isInstallable && (
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-6 rounded-2xl glass border-2 w-full sm:w-auto"
              >
                <Smartphone className="w-5 h-5 mr-2" />
                Available as PWA
              </Button>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-12 md:mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="glass rounded-2xl md:rounded-3xl p-5 md:p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 animate-scale-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-3 md:mb-4 text-white">
                {feature.icon}
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm md:text-base text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* App Preview */}
        <div className="glass rounded-2xl md:rounded-3xl p-6 md:p-8 text-center animate-fade-in">
          <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">Beautiful, Fast, Private</h2>
          <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6 max-w-2xl mx-auto px-2">
            Zentry combines powerful productivity tools with a stunning glassmorphic interface. 
            Everything is stored locally on your device, with optional cloud backup.
          </p>
          <div className="flex flex-wrap justify-center gap-2 md:gap-4 text-xs md:text-sm">
            <span className="px-3 md:px-4 py-1.5 md:py-2 bg-primary/10 rounded-full text-primary font-medium">Offline First</span>
            <span className="px-3 md:px-4 py-1.5 md:py-2 bg-secondary/10 rounded-full text-secondary font-medium">PWA Ready</span>
            <span className="px-3 md:px-4 py-1.5 md:py-2 bg-accent/10 rounded-full text-accent font-medium">Zero Setup</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
