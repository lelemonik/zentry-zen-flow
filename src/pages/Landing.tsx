import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Calendar, StickyNote, Download } from 'lucide-react';
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
      icon: <CheckCircle2 className="w-6 h-6" />, 
      title: 'Tasks', 
      description: 'Organize and track your to-dos' 
    },
    { 
      icon: <StickyNote className="w-6 h-6" />, 
      title: 'Notes', 
      description: 'Capture ideas and thoughts' 
    },
    { 
      icon: <Calendar className="w-6 h-6" />, 
      title: 'Schedule', 
      description: 'Plan your day efficiently' 
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

          {/* Features */}
          <div className="pt-8">
            <p className="text-sm text-muted-foreground mb-6 uppercase tracking-wider">Features</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 hover:from-primary/10 hover:to-secondary/10 transition-all hover:scale-105 border border-border/50"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary shadow-lg">
                    {feature.icon}
                  </div>
                  <div className="text-center space-y-1">
                    <h3 className="text-sm font-semibold">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
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
