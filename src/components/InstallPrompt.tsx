import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Smartphone, Monitor, Chrome, Apple, X } from 'lucide-react';

const InstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check if we should show the prompt
    const hasSeenPrompt = localStorage.getItem('installPromptSeen');
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;

    // Don't show if already installed or user has seen it
    if (isStandalone || hasSeenPrompt) {
      return;
    }

    // Listen for the beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show prompt after 3 seconds of being on the dashboard
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // For browsers that don't support beforeinstallprompt (like Safari)
    // Show manual instructions after 5 seconds
    const timeout = setTimeout(() => {
      if (!deferredPrompt) {
        const userAgent = navigator.userAgent.toLowerCase();
        // Only show on mobile Safari
        if (userAgent.includes('safari') && !userAgent.includes('chrome') && 'ontouchstart' in window) {
          setShowPrompt(true);
        }
      }
    }, 5000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(timeout);
    };
  }, [deferredPrompt]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      }
      
      setDeferredPrompt(null);
    }
    
    // Mark that user has seen the prompt
    localStorage.setItem('installPromptSeen', 'true');
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('installPromptSeen', 'true');
    setShowPrompt(false);
  };

  const getInstructions = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
      return {
        icon: <Apple className="w-8 h-8" />,
        title: 'Install Zentry',
        steps: [
          'Tap the Share button (⎙) at the bottom',
          'Scroll down and tap "Add to Home Screen"',
          'Tap "Add" to confirm'
        ]
      };
    } else if (userAgent.includes('chrome') || userAgent.includes('edg')) {
      const isMobile = 'ontouchstart' in window;
      return {
        icon: isMobile ? <Smartphone className="w-8 h-8" /> : <Chrome className="w-8 h-8" />,
        title: 'Install Zentry',
        steps: isMobile ? [
          'Tap the ⋮ menu (top right)',
          'Tap "Add to Home screen"',
          'Tap "Install"'
        ] : [
          'Click the ⋮ menu (top right)',
          'Click "Install Zentry"',
          'Click "Install" to confirm'
        ]
      };
    } else {
      return {
        icon: <Monitor className="w-8 h-8" />,
        title: 'Install Zentry',
        steps: [
          'Look for the install icon in your browser',
          'Or check your browser menu',
          'Select "Install" or "Add to Home screen"'
        ]
      };
    }
  };

  const instructions = getInstructions();

  if (!showPrompt) return null;

  return (
    <Dialog open={showPrompt} onOpenChange={setShowPrompt}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary">
                {instructions.icon}
              </div>
              <span>{instructions.title}</span>
            </DialogTitle>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleDismiss}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            Install Zentry for quick access and offline support
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <ol className="space-y-3">
            {instructions.steps.map((step, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {index + 1}
                </span>
                <span className="text-sm text-muted-foreground pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleDismiss} className="w-full sm:w-auto">
            Maybe Later
          </Button>
          {deferredPrompt && (
            <Button onClick={handleInstall} className="w-full sm:w-auto">
              Install Now
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InstallPrompt;
