import { Button } from '@/components/ui/button';
import { CheckCircle2, Calendar, StickyNote, Smartphone, Monitor, Chrome, Apple } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  const installInstructions = [
    {
      icon: <Chrome className="w-6 h-6" />,
      platform: 'Chrome / Edge (Desktop)',
      steps: [
        'Click the ⋮ or ⋯ menu (top right)',
        'Select "Install Zentry" or "Apps"',
        'Click "Install"'
      ]
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      platform: 'Chrome / Edge (Mobile)',
      steps: [
        'Tap the ⋮ menu',
        'Tap "Add to Home screen"',
        'Tap "Install" or "Add"'
      ]
    },
    {
      icon: <Apple className="w-6 h-6" />,
      platform: 'Safari (iOS)',
      steps: [
        'Tap the Share button (⎙)',
        'Scroll down',
        'Tap "Add to Home Screen"'
      ]
    },
    {
      icon: <Monitor className="w-6 h-6" />,
      platform: 'Other Browsers',
      steps: [
        'Look for install icon in address bar',
        'Or check browser menu',
        'Select "Install" or "Add to Home screen"'
      ]
    }
  ];

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
          {/* Main CTA Button */}
          <div>
            <Button 
              size="lg" 
              className="w-full text-lg py-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
              onClick={() => navigate('/auth')}
            >
              Get Started
            </Button>
          </div>

          {/* Installation Instructions */}
          <div className="pt-8">
            <h2 className="text-lg font-semibold mb-6 flex items-center justify-center gap-2">
              <Smartphone className="w-5 h-5" />
              Install as App
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {installInstructions.map((instruction, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-border/50 hover:from-primary/10 hover:to-secondary/10 transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary">
                      {instruction.icon}
                    </div>
                    <h3 className="text-sm font-semibold text-left">{instruction.platform}</h3>
                  </div>
                  <ol className="text-left space-y-2">
                    {instruction.steps.map((step, stepIndex) => (
                      <li key={stepIndex} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="text-primary font-semibold min-w-[16px]">{stepIndex + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
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
