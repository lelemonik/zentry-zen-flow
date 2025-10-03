import { useState, useEffect } from 'react';
import { authStorage } from '@/lib/storage';
import { supabaseAuth, onAuthStateChange } from '@/lib/supabaseAuth';

export const useAuth = () => {
  // Start with false - will be set properly after checkAuth completes
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasPin, setHasPin] = useState(!!authStorage.getPin());
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check initial auth state
    checkAuth();
    
    // Listen for auth changes
    const { data: authListener } = onAuthStateChange((session) => {
      if (session) {
        setIsAuthenticated(true);
        setUser(session.user);
      } else {
        // Check PIN-only auth
        const authenticated = authStorage.isAuthenticated();
        const pin = authStorage.getPin();
        // Only set authenticated if both flag AND PIN exist
        setIsAuthenticated(authenticated && !!pin);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      // Check if user has Supabase session
      const session = await supabaseAuth.getSession();
      if (session) {
        setIsAuthenticated(true);
        setUser(session.user);
        setHasPin(!!authStorage.getPin());
        setIsLoading(false);
        return;
      }
    } catch (error) {
      // If Supabase fails (connection issue), fall back to PIN/local auth
      console.warn('Supabase connection issue, using local auth:', error);
    }
    
    // Fall back to PIN-only authentication
    // Only set authenticated if BOTH flag AND PIN exist
    const authenticated = authStorage.isAuthenticated();
    const pin = authStorage.getPin();
    setIsAuthenticated(authenticated && !!pin);
    setHasPin(!!pin);
    setIsLoading(false);
  };

  const setupPin = (pin: string) => {
    authStorage.setPin(pin);
    authStorage.setAuthenticated(true);
    setHasPin(true);
    setIsAuthenticated(true);
  };

  const verifyPin = (pin: string): boolean => {
    const storedPin = authStorage.getPin();
    if (storedPin === pin) {
      authStorage.setAuthenticated(true);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = async () => {
    try {
      await supabaseAuth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
    authStorage.clearAuth();
    setIsAuthenticated(false);
    setUser(null);
  };

  const deleteAccount = async () => {
    try {
      await supabaseAuth.deleteAccount();
      setIsAuthenticated(false);
      setUser(null);
      setHasPin(false);
    } catch (error) {
      console.error('Delete account error:', error);
      throw error;
    }
  };

  return {
    isAuthenticated,
    hasPin,
    user,
    isLoading,
    setupPin,
    verifyPin,
    logout,
    deleteAccount,
    checkAuth,
  };
};
