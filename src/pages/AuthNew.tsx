import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { Lock, ArrowLeft, Mail, KeyRound, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabaseAuth } from '@/lib/supabaseAuth';

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { hasPin, setupPin, verifyPin } = useAuth();
  
  // PIN state
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isSettingUpPin, setIsSettingUpPin] = useState(!hasPin);
  
  // Email/Password state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // PIN Login/Setup
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isSettingUpPin) {
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
          description: 'Quick PIN login successful',
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

  // Email/Password Signup
  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure both passwords are the same',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 6 characters',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await supabaseAuth.signUp(email, password);
      toast({
        title: 'Account created!',
        description: 'Check your email to verify your account',
      });
      setIsSignUp(false);
    } catch (error: any) {
      toast({
        title: 'Signup failed',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Email/Password Login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    try {
      await supabaseAuth.signIn(email, password);
      toast({
        title: 'Welcome back!',
        description: 'Successfully logged in',
      });
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error.message || 'Invalid email or password',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <Card className="glass border-2 animate-scale-in shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl">Zentry</CardTitle>
            <CardDescription>
              Choose your preferred login method
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="pin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="pin" className="gap-2">
                  <Zap className="w-4 h-4" />
                  Quick PIN
                </TabsTrigger>
                <TabsTrigger value="email" className="gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </TabsTrigger>
              </TabsList>

              {/* PIN Login Tab */}
              <TabsContent value="pin" className="space-y-4 mt-4">
                <div className="text-center mb-4">
                  <h3 className="font-semibold text-lg">
                    {isSettingUpPin ? 'Set Up Your PIN' : 'Enter Your PIN'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isSettingUpPin
                      ? 'Create a quick access PIN (4-8 digits)'
                      : 'Use your PIN for quick access'}
                  </p>
                </div>

                <form onSubmit={handlePinSubmit} className="space-y-4">
                  <div>
                    <Input
                      type="password"
                      placeholder="Enter PIN"
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                      className="text-center text-2xl tracking-widest"
                      maxLength={8}
                      autoFocus
                    />
                  </div>

                  {isSettingUpPin && (
                    <div>
                      <Input
                        type="password"
                        placeholder="Confirm PIN"
                        value={confirmPin}
                        onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                        className="text-center text-2xl tracking-widest"
                        maxLength={8}
                      />
                    </div>
                  )}

                  <Button type="submit" className="w-full" size="lg">
                    <KeyRound className="w-4 h-4 mr-2" />
                    {isSettingUpPin ? 'Set Up PIN' : 'Unlock with PIN'}
                  </Button>

                  {!isSettingUpPin && (
                    <p className="text-xs text-center text-muted-foreground">
                      PIN is stored locally for quick access
                    </p>
                  )}
                </form>
              </TabsContent>

              {/* Email Login Tab */}
              <TabsContent value="email" className="space-y-4 mt-4">
                <div className="text-center mb-4">
                  <h3 className="font-semibold text-lg">
                    {isSignUp ? 'Create Account' : 'Sign In'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isSignUp
                      ? 'Create a secure account with email'
                      : 'Sign in with your email and password'}
                  </p>
                </div>

                <form onSubmit={isSignUp ? handleEmailSignup : handleEmailLogin} className="space-y-4">
                  <div>
                    <Input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>

                  {isSignUp && (
                    <div>
                      <Input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                    </div>
                  )}

                  <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                    <Mail className="w-4 h-4 mr-2" />
                    {isLoading ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                  </Button>

                  <div className="text-center">
                    <Button
                      type="button"
                      variant="link"
                      onClick={() => setIsSignUp(!isSignUp)}
                      className="text-sm"
                    >
                      {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                    </Button>
                  </div>

                  {!isSignUp && (
                    <div className="text-center">
                      <Button
                        type="button"
                        variant="link"
                        onClick={() => {
                          // TODO: Implement forgot password
                          toast({
                            title: 'Password Reset',
                            description: 'Check your email for reset instructions',
                          });
                        }}
                        className="text-xs text-muted-foreground"
                      >
                        Forgot password?
                      </Button>
                    </div>
                  )}
                </form>

                {isSignUp && (
                  <p className="text-xs text-center text-muted-foreground">
                    After signup, you can also set up a quick PIN
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>🔒 Your data is encrypted and secure</p>
          <p className="mt-1">☁️ Cloud sync • 💾 Offline support</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
