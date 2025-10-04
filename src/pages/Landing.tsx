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
      toast({
        title: 'Install Zentry',
        description: 'Use your browser menu to install this app on your device.',
        duration: 3000,
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
    { icon: <CheckCircle2 className="w-5 h-5" />, title: 'Tasks' },
    { icon: <StickyNote className="w-5 h-5" />, title: 'Notes' },
    { icon: <Calendar className="w-5 h-5" />, title: 'Schedule' },
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
            
            {isInstallable && (
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full text-lg py-6 rounded-xl glass border-2"
                onClick={handleInstallClick}
              >
                <Download className="w-5 h-5 mr-2" />
                Install App
              </Button>
            )}
          </div>

          {/* Features */}
          <div className="pt-4">
            <p className="text-sm text-muted-foreground mb-4">Includes</p>
            <div className="flex justify-center gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary">
                    {feature.icon}
                  </div>
                  <span className="text-xs font-medium">{feature.title}</span>
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
