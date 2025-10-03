import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Lock, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { hasPin, setupPin, verifyPin } = useAuth();
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isSettingUp, setIsSettingUp] = useState(!hasPin);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isSettingUp) {
      if (pin.length < 4) {
        toast({
          title: 'PIN too short',
          description: 'Please enter at least 4 digits',
          variant: 'destructive',
        });
        return;
      }

      if (pin !== confirmPin) {
        toast({
          title: 'PINs do not match',
          description: 'Please make sure both PINs are the same',
          variant: 'destructive',
        });
        return;
      }

      setupPin(pin);
      toast({
        title: 'Success!',
        description: 'Your PIN has been set up',
      });
      navigate('/dashboard');
    } else {
      if (verifyPin(pin)) {
        toast({
          title: 'Welcome back!',
          description: 'Authentication successful',
        });
        navigate('/dashboard');
      } else {
        toast({
          title: 'Incorrect PIN',
          description: 'Please try again',
          variant: 'destructive',
        });
        setPin('');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <Card className="glass border-2 animate-scale-in">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">
              {isSettingUp ? 'Set Up Your PIN' : 'Enter Your PIN'}
            </CardTitle>
            <CardDescription>
              {isSettingUp
                ? 'Create a PIN to secure your data'
                : 'Enter your PIN to access Zentry'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder="Enter PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="text-center text-2xl tracking-widest"
                  maxLength={8}
                  autoFocus
                />
              </div>

              {isSettingUp && (
                <div>
                  <Input
                    type="password"
                    placeholder="Confirm PIN"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value)}
                    className="text-center text-2xl tracking-widest"
                    maxLength={8}
                  />
                </div>
              )}

              <Button type="submit" className="w-full" size="lg">
                {isSettingUp ? 'Set Up PIN' : 'Unlock'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
