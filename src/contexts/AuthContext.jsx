import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, handleSupabaseError } from '../lib/supabase';
import { subscriptionService } from '../services/subscriptionService';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check for active session
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (session) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (userError) throw userError;
          
          // Get subscription info
          const subscriptionData = await subscriptionService.getUserSubscription(session.user.id);
          
          setUser({
            userId: userData.id,
            email: userData.email,
            username: userData.username,
            bio: userData.bio,
            interests: userData.interests || [],
            subscription: subscriptionData.tier,
            createdAt: userData.created_at,
            updatedAt: userData.updated_at
          });
        }
      } catch (error) {
        console.error('Session check error:', error);
        setError(handleSupabaseError(error));
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          try {
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (userError) throw userError;
            
            // Get subscription info
            const subscriptionData = await subscriptionService.getUserSubscription(session.user.id);
            
            setUser({
              userId: userData.id,
              email: userData.email,
              username: userData.username,
              bio: userData.bio,
              interests: userData.interests || [],
              subscription: subscriptionData.tier,
              createdAt: userData.created_at,
              updatedAt: userData.updated_at
            });
          } catch (error) {
            console.error('Auth state change error:', error);
            setError(handleSupabaseError(error));
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signUp = async ({ email, password, username }) => {
    try {
      setLoading(true);
      setError(null);
      
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password
      });
      
      if (authError) throw authError;
      
      if (authData.user) {
        // Create user profile
        const { data: userData, error: userError } = await supabase
          .from('users')
          .insert([
            {
              id: authData.user.id,
              email,
              username,
              subscription_tier: 'free'
            }
          ])
          .select()
          .single();
        
        if (userError) throw userError;
        
        setUser({
          userId: userData.id,
          email: userData.email,
          username: userData.username,
          bio: userData.bio,
          interests: userData.interests || [],
          subscription: 'free',
          createdAt: userData.created_at,
          updatedAt: userData.updated_at
        });
      }
      
      return { success: true };
    } catch (error) {
      console.error('Sign up error:', error);
      setError(handleSupabaseError(error));
      return { success: false, error: handleSupabaseError(error) };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async ({ email, password }) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error('Sign in error:', error);
      setError(handleSupabaseError(error));
      return { success: false, error: handleSupabaseError(error) };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      setUser(null);
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      setError(handleSupabaseError(error));
      return { success: false, error: handleSupabaseError(error) };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error('Reset password error:', error);
      setError(handleSupabaseError(error));
      return { success: false, error: handleSupabaseError(error) };
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (password) => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.updateUser({
        password
      });
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error('Update password error:', error);
      setError(handleSupabaseError(error));
      return { success: false, error: handleSupabaseError(error) };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.userId)
        .select()
        .single();
      
      if (error) throw error;
      
      setUser({
        ...user,
        ...updates,
        username: data.username,
        bio: data.bio,
        interests: data.interests || []
      });
      
      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error);
      setError(handleSupabaseError(error));
      return { success: false, error: handleSupabaseError(error) };
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (updates) => {
    if (user) {
      setUser({
        ...user,
        ...updates
      });
    }
  };

  const value = {
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

