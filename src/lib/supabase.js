import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Table names
export const TABLES = {
  USERS: 'users',
  COMMUNITIES: 'communities',
  COMMUNITY_MEMBERS: 'community_members',
  POSTS: 'posts',
  COMMENTS: 'comments',
  POST_LIKES: 'post_likes',
  COMMENT_LIKES: 'comment_likes',
  USER_SUBSCRIPTIONS: 'user_subscriptions',
  RESOURCES: 'resources',
  RESOURCE_UPVOTES: 'resource_upvotes',
  RESOURCE_BOOKMARKS: 'resource_bookmarks',
  MENTORSHIP_PROFILES: 'mentorship_profiles',
  MENTORSHIP_REQUESTS: 'mentorship_requests',
  MENTORSHIPS: 'mentorships',
  NOTIFICATIONS: 'notifications'
};

/**
 * Handle Supabase errors
 * @param {Error} error - Error object
 * @returns {string} - Error message
 */
export const handleSupabaseError = (error) => {
  console.error('Supabase error:', error);
  
  if (error.message) {
    return error.message;
  }
  
  if (error.error_description) {
    return error.error_description;
  }
  
  return 'An unexpected error occurred. Please try again later.';
};

/**
 * Get user profile by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - User profile data
 */
export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    throw new Error(handleSupabaseError(error));
  }
};

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} updates - Profile updates
 * @returns {Promise<Object>} - Updated profile data
 */
export const updateUserProfile = async (userId, updates) => {
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
};

/**
 * Upload file to Supabase storage
 * @param {string} bucket - Storage bucket
 * @param {string} path - File path
 * @param {File} file - File to upload
 * @returns {Promise<Object>} - Upload result
 */
export const uploadFile = async (bucket, path, file) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    throw new Error(handleSupabaseError(error));
  }
};

/**
 * Get public URL for a file
 * @param {string} bucket - Storage bucket
 * @param {string} path - File path
 * @returns {string} - Public URL
 */
export const getPublicUrl = (bucket, path) => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

export default supabase;

