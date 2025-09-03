import { supabase, handleSupabaseError, TABLES } from '../lib/supabase';

/**
 * Authentication service for handling user authentication with Supabase
 */
export const authService = {
  /**
   * Sign up a new user
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @param {string} username - User's username
   * @returns {Promise<Object>} - User data or error
   */
  async signUp(email, password, username) {
    try {
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData?.user) {
        // Create user profile in the database
        const { data: userData, error: userError } = await supabase
          .from(TABLES.USERS)
          .insert([
            {
              id: authData.user.id,
              username,
              email,
              bio: '',
              interests: [],
              created_at: new Date().toISOString(),
              subscription_tier: 'free',
            },
          ])
          .select()
          .single();

        if (userError) throw userError;

        return {
          user: {
            userId: authData.user.id,
            username,
            email,
            bio: '',
            interests: [],
            communitiesJoined: [],
            subscription: 'free',
          },
        };
      }

      throw new Error('Failed to create user');
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  /**
   * Sign in an existing user
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise<Object>} - User data or error
   */
  async signIn(email, password) {
    try {
      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData?.user) {
        // Get user profile from the database
        const { data: userData, error: userError } = await supabase
          .from(TABLES.USERS)
          .select(`
            id,
            username,
            email,
            bio,
            interests,
            created_at,
            subscription_tier,
            communities:user_communities(community_id)
          `)
          .eq('id', authData.user.id)
          .single();

        if (userError) throw userError;

        // Get communities the user has joined
        const communitiesJoined = userData.communities?.map(c => c.community_id) || [];

        return {
          user: {
            userId: userData.id,
            username: userData.username,
            email: userData.email,
            bio: userData.bio || '',
            interests: userData.interests || [],
            communitiesJoined,
            subscription: userData.subscription_tier,
          },
        };
      }

      throw new Error('Failed to sign in');
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  /**
   * Sign out the current user
   * @returns {Promise<void>}
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  /**
   * Get the current user session
   * @returns {Promise<Object>} - User session or null
   */
  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  },

  /**
   * Get the current user profile
   * @returns {Promise<Object>} - User profile or null
   */
  async getCurrentUser() {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) return null;
      
      const { data: userData, error: userError } = await supabase
        .from(TABLES.USERS)
        .select(`
          id,
          username,
          email,
          bio,
          interests,
          created_at,
          subscription_tier,
          communities:user_communities(community_id)
        `)
        .eq('id', sessionData.session.user.id)
        .single();

      if (userError) throw userError;

      // Get communities the user has joined
      const communitiesJoined = userData.communities?.map(c => c.community_id) || [];

      return {
        userId: userData.id,
        username: userData.username,
        email: userData.email,
        bio: userData.bio || '',
        interests: userData.interests || [],
        communitiesJoined,
        subscription: userData.subscription_tier,
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} updates - Profile updates
   * @returns {Promise<Object>} - Updated user data
   */
  async updateProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  /**
   * Reset password
   * @param {string} email - User's email
   * @returns {Promise<void>}
   */
  async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  /**
   * Update password
   * @param {string} newPassword - New password
   * @returns {Promise<void>}
   */
  async updatePassword(newPassword) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) throw error;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },
};

