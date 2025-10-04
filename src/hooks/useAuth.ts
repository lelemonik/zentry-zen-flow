import { useState, useEffect } from 'react';
import { authStorage, clearAllUserData, clearUserDataOnLogout } from '@/lib/storage';
import { supabaseAuth, onAuthStateChange } from '@/lib/supabaseAuth';

export const useAuth = () => {
  // Start with false - will be set properly after checkAuth completes
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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
        setIsAuthenticated(false);
        setUser(null);
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
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.warn('Supabase connection issue:', error);
      setIsAuthenticated(false);
      setUser(null);
    }
    setIsLoading(false);
  };

  const logout = async () => {
    try {
      await supabaseAuth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
    // Clear user data on logout
    clearUserDataOnLogout();
    setIsAuthenticated(false);
    setUser(null);
  };

  const deleteAccount = async () => {
    try {
      await supabaseAuth.deleteAccount();
      // Clear all user data from localStorage
      clearAllUserData();
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Delete account error:', error);
      throw error;
    }
  };

  return {
    isAuthenticated,
    user,
    isLoading,
    logout,
    deleteAccount,
    checkAuth,
  };
};
