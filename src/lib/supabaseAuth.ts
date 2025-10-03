import { supabase } from './supabase';
import { authStorage } from './storage';

// Password validation
export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  if (!/\d/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  if (!/[a-zA-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one letter' };
  }
  return { valid: true };
};

// Username validation
export const validateUsername = (username: string): { valid: boolean; message?: string } => {
  if (username.length < 3) {
    return { valid: false, message: 'Username must be at least 3 characters' };
  }
  if (username.length > 20) {
    return { valid: false, message: 'Username must be 20 characters or less' };
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { valid: false, message: 'Username can only contain letters, numbers, hyphens, and underscores' };
  }
  return { valid: true };
};

// Supabase Auth operations
export const supabaseAuth = {
  // Sign up with username and password
  signUp: async (username: string, password: string) => {
    // Validate username
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.valid) {
      throw new Error(usernameValidation.message);
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.message);
    }

    // Check if username already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('username', username.toLowerCase())
      .single();

    if (existingUser) {
      throw new Error('Username already taken');
    }

    // Create a synthetic email from username (Supabase requires email)
    const syntheticEmail = `${username.toLowerCase()}@zentry.local`;
    
    const { data, error } = await supabase.auth.signUp({
      email: syntheticEmail,
      password,
      options: {
        data: {
          username: username.toLowerCase(),
          display_name: username,
        },
        emailRedirectTo: undefined, // Disable email verification
      },
    });
    
    if (error) {
      console.error('Supabase signup error:', error);
      // Provide helpful error message
      if (error.message.includes('email') && error.message.includes('confirm')) {
        throw new Error('Email confirmation is enabled in Supabase. Please disable it in Auth > Providers > Email settings.');
      }
      throw error;
    }

    // Create profile with username
    if (data.user) {
      await supabase.from('profiles').upsert({
        user_id: data.user.id,
        username: username.toLowerCase(),
        name: username,
        email: syntheticEmail,
      });
    }

    return data;
  },

  // Sign in with username and password
  signIn: async (username: string, password: string) => {
    // Convert username to synthetic email
    const syntheticEmail = `${username.toLowerCase()}@zentry.local`;
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: syntheticEmail,
      password,
    });
    
    if (error) {
      // Provide user-friendly error message
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Invalid username or password');
      }
      throw error;
    }
    return data;
  },

  // Sign in with PIN (quick login)
  signInWithPin: async (pin: string) => {
    // Check if PIN matches local storage
    const storedPin = authStorage.getPin();
    if (storedPin === pin) {
      // PIN is correct, check if user has a Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        return { success: true, session };
      } else {
        // PIN-only mode (legacy)
        return { success: true, session: null, pinOnly: true };
      }
    }
    throw new Error('Invalid PIN');
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    authStorage.clearAuth();
  },

  // Get current user
  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // Get current session
  getSession: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  // Reset password
  resetPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) throw error;
  },

  // Update password
  updatePassword: async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
  },

  // Link PIN to authenticated account
  linkPinToAccount: async (pin: string) => {
    const user = await supabaseAuth.getCurrentUser();
    if (!user) throw new Error('Must be logged in to link PIN');
    
    // Store PIN locally
    authStorage.setPin(pin);
    
    // Store PIN association in user metadata
    const { error } = await supabase.auth.updateUser({
      data: { has_pin: true }
    });
    
    if (error) throw error;
  },

  // Check if user has email account
  hasEmailAccount: async (): Promise<boolean> => {
    const user = await supabaseAuth.getCurrentUser();
    return !!user;
  },

  // Get user ID (for database queries)
  getUserId: async (): Promise<string> => {
    // Try to get Supabase user first
    const user = await supabaseAuth.getCurrentUser();
    if (user) {
      return user.id;
    }
    
    // Fall back to PIN-based ID for legacy users
    const pin = authStorage.getPin();
    if (!pin) return 'anonymous';
    return 'user_' + btoa(pin).slice(0, 16);
  },

  // Delete account (permanently removes user and all data)
  deleteAccount: async () => {
    const user = await supabaseAuth.getCurrentUser();
    
    // Handle case where user has PIN but no Supabase account
    if (!user) {
      // Just clear local storage for PIN-only users
      localStorage.clear();
      authStorage.clearAuth();
      return;
    }

    const userId = user.id;

    try {
      // Try to delete using the SQL function (recommended method)
      const { error: rpcError } = await supabase.rpc('delete_user');
      
      if (rpcError) {
        console.warn('RPC delete failed, trying manual deletion:', rpcError);
        
        // Fallback: Manually delete user data
        const deletions = [
          supabase.from('tasks').delete().eq('user_id', userId),
          supabase.from('notes').delete().eq('user_id', userId),
          supabase.from('schedule').delete().eq('user_id', userId),
          supabase.from('profiles').delete().eq('id', userId),
        ];

        // Execute all deletions
        const results = await Promise.allSettled(deletions);
        
        // Log any errors but continue
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            console.warn(`Failed to delete from table ${index}:`, result.reason);
          }
        });

        // Sign out the user (auth deletion requires admin privileges)
        await supabaseAuth.signOut();
        
        // Clear all local data
        localStorage.clear();
        authStorage.clearAuth();
        
        throw new Error('Account data deleted. Auth user deletion requires the SQL function. Please run supabase-delete-user-function.sql in your Supabase SQL Editor.');
      }

      // Success - clear local storage
      localStorage.clear();
      authStorage.clearAuth();
      
    } catch (error) {
      // Even if deletion fails, clear local data
      localStorage.clear();
      authStorage.clearAuth();
      throw error;
    }
  },
};

// Auth state listener
export const onAuthStateChange = (callback: (session: any) => void) => {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
};
