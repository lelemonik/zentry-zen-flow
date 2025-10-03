import { useState, useEffect } from 'react';
import { authStorage } from '@/lib/storage';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(authStorage.isAuthenticated());
  const [hasPin, setHasPin] = useState(!!authStorage.getPin());

  useEffect(() => {
    setIsAuthenticated(authStorage.isAuthenticated());
    setHasPin(!!authStorage.getPin());
  }, []);

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

  const logout = () => {
    authStorage.clearAuth();
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    hasPin,
    setupPin,
    verifyPin,
    logout,
  };
};
