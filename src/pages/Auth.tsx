import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Lock, ArrowLeft, User, KeyRound, AlertCircle, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabaseAuth, validatePassword, validateUsername } from '@/lib/supabaseAuth';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { hasPin, setupPin, verifyPin, isAuthenticated } = useAuth();
  
  // PIN state
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isSettingUpPin, setIsSettingUpPin] = useState(!hasPin);
  
  // Username/Password state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  
  // Post-signup PIN setup
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [signupUsername, setSignupUsername] = useState('');
  
  // View modes: 'pin-login' | 'pin-setup' | 'signup'
  const [viewMode, setViewMode] = useState<'pin-login' | 'pin-setup' | 'signup'>(
    hasPin ? 'pin-login' : 'signup'
  );
  
  // Password requirement checks
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    hasNumber: false,
    hasLetter: false,
  });
  
  // Password match check
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  // Redirect to dashboard if already authenticated (but not setting up PIN)
  useEffect(() => {
    // Only redirect if authenticated, not in PIN setup mode, and has a PIN
    // This prevents redirect during signup before PIN is created
    if (isAuthenticated && viewMode !== 'pin-setup' && hasPin) {
      const timer = setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, viewMode, hasPin, navigate]);

  // PIN Login/Setup
  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (viewMode === 'pin-setup') {
      // Setting up new PIN
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

      await setupPin(pin);
      toast({
        title: 'Success!',
        description: `Welcome, ${signupUsername}! Your account is ready.`,
      });
      navigate('/dashboard');
    } else {
      // Logging in with existing PIN
      if (!hasPin) {
        // No PIN set up yet - redirect to signup
        toast({
          title: 'No account found',
          description: 'Please create an account first',
          variant: 'destructive',
        });
        setViewMode('signup');
        setPin('');
        return;
      }
      
      if (verifyPin(pin)) {
        toast({
          title: 'Welcome back!',
          description: 'Login successful',
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

  // Validate inputs on change
  const handlePasswordChange = (value: string) => {
    setPassword(value);
    
    // Update password requirement checks
    const checks = {
      length: value.length >= 8,
      hasNumber: /\d/.test(value),
      hasLetter: /[a-zA-Z]/.test(value),
    };
    setPasswordChecks(checks);
    
    if (isSignUp && value) {
      const validation = validatePassword(value);
      setPasswordError(validation.valid ? '' : validation.message || '');
    } else {
      setPasswordError('');
    }
  };

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    if (isSignUp && value) {
      const validation = validateUsername(value);
      setUsernameError(validation.valid ? '' : validation.message || '');
    } else {
      setUsernameError('');
    }
  };

  // Username/Password Signup
  const handleUsernameSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate username
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.valid) {
      toast({
        title: 'Invalid username',
        description: usernameValidation.message,
        variant: 'destructive',
      });
      return;
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      toast({
        title: 'Invalid password',
        description: passwordValidation.message,
        variant: 'destructive',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure both passwords are the same',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    // Set username and switch to PIN setup view BEFORE signup
    // This prevents race condition with authentication redirect
    setSignupUsername(username);
    
    try {
      await supabaseAuth.signUp(username, password);
      
      // Navigate to PIN setup (state already set above)
      setViewMode('pin-setup');
      toast({
        title: 'Account created!',
        description: `Welcome, ${username}! Now create your PIN.`,
      });
    } catch (error: any) {
      const isFetchError = error.message?.includes('fetch') || error.message?.includes('network');
      toast({
        title: 'Signup failed',
        description: isFetchError 
          ? 'Cannot connect to server. Your Supabase project may be paused. Check the dashboard or use the app offline.'
          : error.message || 'Please try again',
        variant: 'destructive',
        duration: 7000, // Show longer for fetch errors
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Username/Password Login
  const handleUsernameLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    try {
      await supabaseAuth.signIn(username, password);
      
      // Check if user has a PIN set up
      if (!hasPin) {
        // Offer to set up PIN for quick login
        toast({
          title: 'Welcome back!',
          description: `Logged in as ${username}. Would you like to set up a quick PIN?`,
        });
        setSignupUsername(username);
        setShowPinSetup(true);
      } else {
        toast({
          title: 'Welcome back!',
          description: `Logged in as ${username}`,
        });
        navigate('/dashboard');
      }
    } catch (error: any) {
      const isFetchError = error.message?.includes('fetch') || error.message?.includes('network');
      const userDoesntExist = error.message?.includes('doesn\'t exist');
      
      toast({
        title: userDoesntExist ? 'User not found' : 'Login failed',
        description: isFetchError
          ? 'Cannot connect to server. Your Supabase project may be paused. Check the dashboard.'
          : error.message || 'Invalid username or password',
        variant: 'destructive',
        duration: userDoesntExist ? 5000 : 7000,
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
              {viewMode === 'pin-setup' 
                ? 'Create your PIN'
                : viewMode === 'pin-login'
                  ? 'Enter your PIN'
                  : 'Create your account'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {viewMode === 'pin-setup' ? (
              // PIN Setup after signup
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <div className="mx-auto mb-3 w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <KeyRound className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg">Create Your PIN</h3>
                  <p className="text-sm text-muted-foreground">
                    {signupUsername ? `Welcome, ${signupUsername}!` : ''} Enter a 4-8 digit PIN for quick access.
                  </p>
                </div>

                <form onSubmit={handlePinSubmit} className="space-y-4">
                  <div>
                    <Input
                      type="password"
                      placeholder="Enter 4-8 digit PIN"
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                      className="text-center text-2xl tracking-widest"
                      maxLength={8}
                      autoFocus
                    />
                  </div>

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

                  <Button type="submit" className="w-full" size="lg">
                    <KeyRound className="w-4 h-4 mr-2" />
                    Create PIN
                  </Button>
                </form>
              </div>
            ) : viewMode === 'pin-login' ? (
              // PIN Login - Existing users
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="font-semibold text-lg">Welcome Back!</h3>
                  <p className="text-sm text-muted-foreground">
                    Enter your PIN to continue
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

                  <Button type="submit" className="w-full" size="lg">
                    <KeyRound className="w-4 h-4 mr-2" />
                    Unlock
                  </Button>

                  <div className="text-center">
                    <Button
                      type="button"
                      variant="link"
                      onClick={() => setViewMode('signup')}
                      className="text-sm"
                    >
                      Don't have an account? Sign up
                    </Button>
                  </div>
                </form>
              </div>
            ) : (
              // Signup - New users only
              <div className="space-y-4 mt-4">
                <div className="text-center mb-4">
                  <h3 className="font-semibold text-lg">Create Account</h3>
                  <p className="text-sm text-muted-foreground">
                    Create your account to get started
                  </p>
                </div>

                <form onSubmit={handleUsernameSignup} className="space-y-4">
                  <div>
                    <Input
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => handleUsernameChange(e.target.value)}
                      required
                      maxLength={20}
                      autoComplete="username"
                    />
                    {usernameError && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{usernameError}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div>
                    <Input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      required
                      minLength={8}
                      autoComplete="new-password"
                    />
                    {passwordError && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{passwordError}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {/* Password Requirements Checklist */}
                  {password && (
                    <div className="space-y-2 text-sm">
                      <p className="font-medium text-muted-foreground">Password Requirements:</p>
                      <div className="space-y-1">
                        <div className={`flex items-center gap-2 ${passwordChecks.length ? 'text-green-600' : 'text-muted-foreground'}`}>
                          {passwordChecks.length ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                          <span>At least 8 characters</span>
                        </div>
                        <div className={`flex items-center gap-2 ${passwordChecks.hasNumber ? 'text-green-600' : 'text-muted-foreground'}`}>
                          {passwordChecks.hasNumber ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                          <span>Contains a number</span>
                        </div>
                        <div className={`flex items-center gap-2 ${passwordChecks.hasLetter ? 'text-green-600' : 'text-muted-foreground'}`}>
                          {passwordChecks.hasLetter ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                          <span>Contains a letter</span>
                        </div>
                      </div>
                    </div>
                  )}
                      
                  <div>
                    <div className="relative">
                      <Input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={8}
                        autoComplete="new-password"
                        className={confirmPassword ? (passwordsMatch ? 'border-green-500 focus-visible:ring-green-500' : 'border-red-500 focus-visible:ring-red-500') : ''}
                      />
                      {confirmPassword && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {passwordsMatch ? (
                            <Check className="w-5 h-5 text-green-600" />
                          ) : (
                            <X className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                      )}
                    </div>
                    {confirmPassword && passwordsMatch && (
                      <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                        <Check className="w-4 h-4" />
                        Passwords match!
                      </p>
                    )}
                    {confirmPassword && !passwordsMatch && (
                      <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                        <X className="w-4 h-4" />
                        Passwords do not match
                      </p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={isLoading || !!passwordError || !!usernameError}>
                    <User className="w-4 h-4 mr-2" />
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>

                  <div className="text-center">
                    <Button
                      type="button"
                      variant="link"
                      onClick={() => setViewMode('pin-login')}
                      className="text-sm"
                    >
                      Already have an account? Login with PIN
                    </Button>
                  </div>

                </form>

                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    After signup, you'll create a PIN for quick access
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Helpful info banner */}
        <Alert className="mt-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-xs text-blue-800 dark:text-blue-300">
            <strong>Having connection issues?</strong>
            <br />
            Your Supabase project may be paused. Visit{' '}
            <a 
              href="https://supabase.com/dashboard/project/vnixcafcspbqhuytciog" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline font-semibold hover:text-blue-600"
            >
              the dashboard
            </a>
            {' '}to restore it, or click "Back to Home" to use the app offline.
          </AlertDescription>
        </Alert>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          <p>🔒 Your data is encrypted and secure</p>
          <p className="mt-1">☁️ Cloud sync • 💾 Offline support</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
