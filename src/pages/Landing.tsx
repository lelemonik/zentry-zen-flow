import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Calendar, StickyNote, Download, MessageSquare, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Landing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

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
      // Check if already installed
      if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true) {
        toast({
          title: 'Already Installed',
          description: 'Zentry is already installed on your device!',
          duration: 3000,
        });
        return;
      }

      // Show browser-specific instructions
      const userAgent = navigator.userAgent.toLowerCase();
      let instructions = 'Use your browser menu to install this app.';
      
      if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
        instructions = 'Click the ⋮ menu (top right) → "Install Zentry" or "Add to Home screen"';
      } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
        instructions = 'Tap the Share button → "Add to Home Screen"';
      } else if (userAgent.includes('firefox')) {
        instructions = 'Tap the ⋮ menu → "Install" or "Add to Home Screen"';
      } else if (userAgent.includes('edg')) {
        instructions = 'Click the ⋯ menu → "Apps" → "Install Zentry"';
      }

      toast({
        title: 'Install Zentry',
        description: instructions,
        duration: 5000,
      });
      return;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        toast({
          title: 'App Installed!',
          description: '🎉 Zentry has been installed successfully!',
        });
      } else {
        toast({
          title: 'Installation Cancelled',
          description: 'You can install Zentry anytime from your browser menu.',
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Installation error:', error);
      toast({
        title: 'Installation Error',
        description: 'Please try installing from your browser menu.',
        variant: 'destructive',
        duration: 3000,
      });
    }

    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const features = [
    { 
      icon: <MessageSquare className="w-6 h-6" />, 
      title: 'AI Chat', 
      description: 'Get instant help and insights powered by AI',
      gradient: 'from-pastel-purple/30 to-pastel-pink/30',
      iconGradient: 'from-pastel-purple to-pastel-pink',
      badge: 'NEW'
    },
    { 
      icon: <CheckCircle2 className="w-6 h-6" />, 
      title: 'Smart Tasks', 
      description: 'Organize and track your to-dos with AI assistance',
      gradient: 'from-pastel-steel/30 to-pastel-blue/30',
      iconGradient: 'from-pastel-steel to-pastel-blue'
    },
    { 
      icon: <StickyNote className="w-6 h-6" />, 
      title: 'Quick Notes', 
      description: 'Capture ideas and thoughts instantly',
      gradient: 'from-pastel-yellow/30 to-pastel-pink/30',
      iconGradient: 'from-pastel-yellow to-pastel-pink'
    },
    { 
      icon: <Calendar className="w-6 h-6" />, 
      title: 'Schedule', 
      description: 'Plan your day with a beautiful calendar',
      gradient: 'from-pastel-teal/30 to-pastel-blue/30',
      iconGradient: 'from-pastel-teal to-pastel-blue'
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full py-6 px-4">
        <div className="container mx-auto flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <span className="text-xl font-bold text-white">Z</span>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Zentry
          </h1>
        </div>
      </header>

      {/* Main Content - Centered */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md text-center space-y-8">
          {/* Main CTA Buttons */}
          <div className="space-y-4">
            <Button 
              size="lg" 
              className="w-full text-lg py-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
              onClick={() => navigate('/auth')}
            >
              Get Started
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full text-lg py-6 rounded-xl glass border-2 hover:scale-105 transition-all"
              onClick={handleInstallClick}
            >
              <Download className="w-5 h-5 mr-2" />
              Install App
            </Button>
          </div>

          {/* Tagline */}
          <div className="text-center">
            <p className="text-sm md:text-base text-muted-foreground font-medium">
              Your all-in-one productivity hub
            </p>
          </div>

          {/* Features */}
          <div className="pt-12">
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
              <p className="text-base font-semibold text-foreground uppercase tracking-wider">
                Features
              </p>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group relative flex flex-col items-center gap-4 p-6 rounded-3xl glass hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 border-2 border-border/50 hover:border-primary/30 overflow-hidden"
                >
                  {/* Badge for new features */}
                  {feature.badge && (
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-gradient-to-r from-pastel-purple to-pastel-pink text-white text-[10px] font-bold uppercase tracking-wide shadow-lg">
                      {feature.badge}
                    </div>
                  )}
                  
                  {/* Background glow effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient || 'from-primary/5 to-secondary/5'} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl`} />
                  
                  {/* Icon */}
                  <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.iconGradient || 'from-primary to-secondary'} flex items-center justify-center text-white shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300`}>
                    {feature.icon}
                  </div>
                  
                  {/* Content */}
                  <div className="relative text-center space-y-2">
                    <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 px-4 border-t">
        <div className="container mx-auto text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Developed with ❤️ by <span className="font-semibold text-foreground">Gayle</span>
          </p>
          <p className="text-xs text-muted-foreground">
            © 2025 Zentry. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
