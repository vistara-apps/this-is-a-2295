import { supabase, handleSupabaseError, TABLES } from '../lib/supabase';
import { aiService } from './aiService';

/**
 * Service for handling resource-related operations
 */
export const resourceService = {
  /**
   * Get resources with filtering and pagination
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (1-based)
   * @param {number} options.limit - Number of resources per page
   * @param {string} options.topic - Filter by topic
   * @param {string} options.type - Filter by resource type
   * @param {string} options.difficulty - Filter by difficulty level
   * @param {string} options.searchTerm - Search term for filtering
   * @returns {Promise<Object>} - Resources data with pagination info
   */
  async getResources({ page = 1, limit = 10, topic, type, difficulty, searchTerm } = {}) {
    try {
      let query = supabase
        .from(TABLES.RESOURCES)
        .select(`
          id,
          title,
          description,
          url,
          type,
          topics,
          difficulty,
          time_commitment,
          created_by,
          created_at,
          updated_at,
          upvotes,
          creator:users!created_by(username)
        `, { count: 'exact' });

      // Apply filters
      if (topic) {
        query = query.contains('topics', [topic]);
      }
      
      if (type) {
        query = query.eq('type', type);
      }
      
      if (difficulty) {
        query = query.eq('difficulty', difficulty);
      }
      
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      // Apply sorting
      query = query.order('upvotes', { ascending: false });

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        resources: data.map(resource => ({
          resourceId: resource.id,
          title: resource.title,
          description: resource.description,
          url: resource.url,
          type: resource.type,
          topics: resource.topics || [],
          difficulty: resource.difficulty,
          timeCommitment: resource.time_commitment,
          createdBy: resource.created_by,
          creatorName: resource.creator?.username,
          createdAt: resource.created_at,
          updatedAt: resource.updated_at,
          upvotes: resource.upvotes
        })),
        totalCount: count,
        page,
        limit
      };
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  /**
   * Get a single resource by ID
   * @param {string} resourceId - Resource ID
   * @returns {Promise<Object>} - Resource data
   */
  async getResourceById(resourceId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.RESOURCES)
        .select(`
          id,
          title,
          description,
          url,
          type,
          topics,
          difficulty,
          time_commitment,
          created_by,
          created_at,
          updated_at,
          upvotes,
          creator:users!created_by(username)
        `)
        .eq('id', resourceId)
        .single();

      if (error) throw error;

      return {
        resourceId: data.id,
        title: data.title,
        description: data.description,
        url: data.url,
        type: data.type,
        topics: data.topics || [],
        difficulty: data.difficulty,
        timeCommitment: data.time_commitment,
        createdBy: data.created_by,
        creatorName: data.creator?.username,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        upvotes: data.upvotes
      };
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  /**
   * Create a new resource
   * @param {Object} resourceData - Resource data
   * @returns {Promise<Object>} - Created resource data
   */
  async createResource(resourceData) {
    try {
      const { data, error } = await supabase
        .from(TABLES.RESOURCES)
        .insert([
          {
            title: resourceData.title,
            description: resourceData.description,
            url: resourceData.url,
            type: resourceData.type,
            topics: resourceData.topics || [],
            difficulty: resourceData.difficulty,
            time_commitment: resourceData.timeCommitment,
            created_by: resourceData.createdBy,
            upvotes: 0
          }
        ])
        .select()
        .single();

      if (error) throw error;

      return {
        resourceId: data.id,
        title: data.title,
        description: data.description,
        url: data.url,
        type: data.type,
        topics: data.topics || [],
        difficulty: data.difficulty,
        timeCommitment: data.time_commitment,
        createdBy: data.created_by,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        upvotes: data.upvotes
      };
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  /**
   * Update a resource
   * @param {string} resourceId - Resource ID
   * @param {Object} updates - Resource updates
   * @returns {Promise<Object>} - Updated resource data
   */
  async updateResource(resourceId, updates) {
    try {
      const { data, error } = await supabase
        .from(TABLES.RESOURCES)
        .update(updates)
        .eq('id', resourceId)
        .select()
        .single();

      if (error) throw error;

      return {
        resourceId: data.id,
        title: data.title,
        description: data.description,
        url: data.url,
        type: data.type,
        topics: data.topics || [],
        difficulty: data.difficulty,
        timeCommitment: data.time_commitment,
        createdBy: data.created_by,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        upvotes: data.upvotes
      };
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  /**
   * Delete a resource
   * @param {string} resourceId - Resource ID
   * @returns {Promise<void>}
   */
  async deleteResource(resourceId) {
    try {
      const { error } = await supabase
        .from(TABLES.RESOURCES)
        .delete()
        .eq('id', resourceId);

      if (error) throw error;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  /**
   * Upvote a resource
   * @param {string} resourceId - Resource ID
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  async upvoteResource(resourceId, userId) {
    try {
      // Check if user already upvoted
      const { data: existingUpvote, error: checkError } = await supabase
        .from('resource_upvotes')
        .select()
        .eq('resource_id', resourceId)
        .eq('user_id', userId)
        .maybeSingle();

      if (checkError) throw checkError;

      // If not already upvoted, add upvote
      if (!existingUpvote) {
        const { error: upvoteError } = await supabase
          .from('resource_upvotes')
          .insert([
            {
              resource_id: resourceId,
              user_id: userId,
              created_at: new Date().toISOString()
            }
          ]);

        if (upvoteError) throw upvoteError;

        // Increment upvote count
        const { error: updateError } = await supabase
          .from(TABLES.RESOURCES)
          .update({ upvotes: supabase.rpc('increment', { x: 1 }) })
          .eq('id', resourceId);

        if (updateError) throw updateError;
      }
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  /**
   * Remove upvote from a resource
   * @param {string} resourceId - Resource ID
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  async removeUpvote(resourceId, userId) {
    try {
      // Check if user upvoted
      const { data: existingUpvote, error: checkError } = await supabase
        .from('resource_upvotes')
        .select()
        .eq('resource_id', resourceId)
        .eq('user_id', userId)
        .maybeSingle();

      if (checkError) throw checkError;

      // If upvoted, remove upvote
      if (existingUpvote) {
        const { error: removeError } = await supabase
          .from('resource_upvotes')
          .delete()
          .eq('resource_id', resourceId)
          .eq('user_id', userId);

        if (removeError) throw removeError;

        // Decrement upvote count
        const { error: updateError } = await supabase
          .from(TABLES.RESOURCES)
          .update({ upvotes: supabase.rpc('decrement', { x: 1 }) })
          .eq('id', resourceId);

        if (updateError) throw updateError;
      }
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  /**
   * Check if a user has upvoted a resource
   * @param {string} resourceId - Resource ID
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} - True if user has upvoted
   */
  async hasUpvoted(resourceId, userId) {
    try {
      const { data, error } = await supabase
        .from('resource_upvotes')
        .select()
        .eq('resource_id', resourceId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      return !!data;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  /**
   * Bookmark a resource
   * @param {string} resourceId - Resource ID
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  async bookmarkResource(resourceId, userId) {
    try {
      // Check if already bookmarked
      const { data: existingBookmark, error: checkError } = await supabase
        .from('resource_bookmarks')
        .select()
        .eq('resource_id', resourceId)
        .eq('user_id', userId)
        .maybeSingle();

      if (checkError) throw checkError;

      // If not already bookmarked, add bookmark
      if (!existingBookmark) {
        const { error: bookmarkError } = await supabase
          .from('resource_bookmarks')
          .insert([
            {
              resource_id: resourceId,
              user_id: userId,
              created_at: new Date().toISOString()
            }
          ]);

        if (bookmarkError) throw bookmarkError;
      }
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  /**
   * Remove bookmark from a resource
   * @param {string} resourceId - Resource ID
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  async removeBookmark(resourceId, userId) {
    try {
      const { error } = await supabase
        .from('resource_bookmarks')
        .delete()
        .eq('resource_id', resourceId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  /**
   * Get bookmarked resources for a user
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (1-based)
   * @param {number} options.limit - Number of resources per page
   * @returns {Promise<Object>} - Bookmarked resources with pagination info
   */
  async getBookmarkedResources(userId, { page = 1, limit = 10 } = {}) {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await supabase
        .from('resource_bookmarks')
        .select(`
          resource_id,
          created_at,
          resource:resources(
            id,
            title,
            description,
            url,
            type,
            topics,
            difficulty,
            time_commitment,
            created_by,
            created_at,
            updated_at,
            upvotes,
            creator:users!created_by(username)
          )
        `, { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      return {
        resources: data.map(bookmark => ({
          resourceId: bookmark.resource.id,
          title: bookmark.resource.title,
          description: bookmark.resource.description,
          url: bookmark.resource.url,
          type: bookmark.resource.type,
          topics: bookmark.resource.topics || [],
          difficulty: bookmark.resource.difficulty,
          timeCommitment: bookmark.resource.time_commitment,
          createdBy: bookmark.resource.created_by,
          creatorName: bookmark.resource.creator?.username,
          createdAt: bookmark.resource.created_at,
          updatedAt: bookmark.resource.updated_at,
          upvotes: bookmark.resource.upvotes,
          bookmarkedAt: bookmark.created_at
        })),
        totalCount: count,
        page,
        limit
      };
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  /**
   * Check if a user has bookmarked a resource
   * @param {string} resourceId - Resource ID
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} - True if user has bookmarked
   */
  async hasBookmarked(resourceId, userId) {
    try {
      const { data, error } = await supabase
        .from('resource_bookmarks')
        .select()
        .eq('resource_id', resourceId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      return !!data;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  /**
   * Get AI-recommended resources based on user interests
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Recommended resources
   */
  async getRecommendedResources(userId) {
    try {
      // Get user interests
      const { data: userData, error: userError } = await supabase
        .from(TABLES.USERS)
        .select('interests')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      const interests = userData.interests || [];
      
      if (interests.length === 0) {
        return {
          resources: [],
          message: 'Add interests to your profile to get personalized recommendations'
        };
      }

      // Get AI recommendations
      const recommendations = await aiService.generateResourceRecommendations(interests);
      
      return {
        resources: recommendations,
        message: 'Recommendations based on your interests'
      };
    } catch (error) {
      console.error('Error getting recommended resources:', error);
      throw new Error('Failed to get resource recommendations. Please try again later.');
    }
  },

  /**
   * Get resource types
   * @returns {Array} - List of resource types
   */
  getResourceTypes() {
    return [
      'course',
      'book',
      'article',
      'video',
      'podcast',
      'tutorial',
      'tool',
      'community',
      'other'
    ];
  },

  /**
   * Get difficulty levels
   * @returns {Array} - List of difficulty levels
   */
  getDifficultyLevels() {
    return [
      'beginner',
      'intermediate',
      'advanced'
    ];
  }
};

