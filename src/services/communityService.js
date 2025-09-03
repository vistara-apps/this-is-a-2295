import { supabase, handleSupabaseError, TABLES } from '../lib/supabase';

/**
 * Service for handling community-related operations
 */
export const communityService = {
  /**
   * Get all communities
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (1-based)
   * @param {number} options.limit - Number of communities per page
   * @param {string} options.searchTerm - Search term for filtering
   * @param {string} options.filter - Filter type (all, trending, etc.)
   * @returns {Promise<Array>} - List of communities
   */
  async getCommunities({ page = 1, limit = 10, searchTerm = '', filter = 'all' } = {}) {
    try {
      let query = supabase
        .from(TABLES.COMMUNITIES)
        .select(`
          id,
          name,
          description,
          topic,
          created_by,
          created_at,
          tags,
          member_count,
          post_count,
          creator:users!created_by(username)
        `);

      // Apply search filter if provided
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      // Apply specific filters
      if (filter === 'trending') {
        query = query.order('member_count', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        communities: data.map(community => ({
          communityId: community.id,
          name: community.name,
          description: community.description,
          topic: community.topic,
          createdBy: community.created_by,
          creatorName: community.creator?.username,
          memberCount: community.member_count,
          posts: community.post_count,
          tags: community.tags || [],
          createdAt: community.created_at
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
   * Get a single community by ID
   * @param {string} communityId - Community ID
   * @returns {Promise<Object>} - Community data
   */
  async getCommunityById(communityId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.COMMUNITIES)
        .select(`
          id,
          name,
          description,
          topic,
          created_by,
          created_at,
          tags,
          member_count,
          post_count,
          creator:users!created_by(username)
        `)
        .eq('id', communityId)
        .single();

      if (error) throw error;

      return {
        communityId: data.id,
        name: data.name,
        description: data.description,
        topic: data.topic,
        createdBy: data.created_by,
        creatorName: data.creator?.username,
        memberCount: data.member_count,
        posts: data.post_count,
        tags: data.tags || [],
        createdAt: data.created_at
      };
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  /**
   * Create a new community
   * @param {Object} communityData - Community data
   * @returns {Promise<Object>} - Created community data
   */
  async createCommunity(communityData) {
    try {
      const { data, error } = await supabase
        .from(TABLES.COMMUNITIES)
        .insert([
          {
            name: communityData.name,
            description: communityData.description,
            topic: communityData.topic,
            created_by: communityData.createdBy,
            tags: communityData.tags || [],
            member_count: 1, // Creator is the first member
            post_count: 0
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Add creator as a member
      await supabase
        .from('user_communities')
        .insert([
          {
            user_id: communityData.createdBy,
            community_id: data.id,
            role: 'admin', // Creator is admin
            joined_at: new Date().toISOString()
          }
        ]);

      return {
        communityId: data.id,
        name: data.name,
        description: data.description,
        topic: data.topic,
        createdBy: data.created_by,
        memberCount: data.member_count,
        posts: data.post_count,
        tags: data.tags || [],
        createdAt: data.created_at
      };
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  /**
   * Join a community
   * @param {string} communityId - Community ID
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  async joinCommunity(communityId, userId) {
    try {
      // Check if user is already a member
      const { data: existingMember, error: checkError } = await supabase
        .from('user_communities')
        .select()
        .eq('user_id', userId)
        .eq('community_id', communityId)
        .maybeSingle();

      if (checkError) throw checkError;

      // If not already a member, add user to community
      if (!existingMember) {
        const { error: joinError } = await supabase
          .from('user_communities')
          .insert([
            {
              user_id: userId,
              community_id: communityId,
              role: 'member',
              joined_at: new Date().toISOString()
            }
          ]);

        if (joinError) throw joinError;

        // Increment member count
        const { error: updateError } = await supabase
          .from(TABLES.COMMUNITIES)
          .update({ member_count: supabase.rpc('increment', { x: 1 }) })
          .eq('id', communityId);

        if (updateError) throw updateError;
      }
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  /**
   * Leave a community
   * @param {string} communityId - Community ID
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  async leaveCommunity(communityId, userId) {
    try {
      // Check if user is a member
      const { data: existingMember, error: checkError } = await supabase
        .from('user_communities')
        .select()
        .eq('user_id', userId)
        .eq('community_id', communityId)
        .maybeSingle();

      if (checkError) throw checkError;

      // If user is a member, remove from community
      if (existingMember) {
        const { error: leaveError } = await supabase
          .from('user_communities')
          .delete()
          .eq('user_id', userId)
          .eq('community_id', communityId);

        if (leaveError) throw leaveError;

        // Decrement member count
        const { error: updateError } = await supabase
          .from(TABLES.COMMUNITIES)
          .update({ member_count: supabase.rpc('decrement', { x: 1 }) })
          .eq('id', communityId);

        if (updateError) throw updateError;
      }
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  /**
   * Get communities joined by a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - List of communities
   */
  async getUserCommunities(userId) {
    try {
      const { data, error } = await supabase
        .from('user_communities')
        .select(`
          community:communities(
            id,
            name,
            description,
            topic,
            created_by,
            created_at,
            tags,
            member_count,
            post_count
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;

      return data.map(item => ({
        communityId: item.community.id,
        name: item.community.name,
        description: item.community.description,
        topic: item.community.topic,
        createdBy: item.community.created_by,
        memberCount: item.community.member_count,
        posts: item.community.post_count,
        tags: item.community.tags || [],
        createdAt: item.community.created_at
      }));
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  /**
   * Check if a user is a member of a community
   * @param {string} communityId - Community ID
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} - True if user is a member
   */
  async isMember(communityId, userId) {
    try {
      const { data, error } = await supabase
        .from('user_communities')
        .select()
        .eq('user_id', userId)
        .eq('community_id', communityId)
        .maybeSingle();

      if (error) throw error;

      return !!data;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  /**
   * Update a community
   * @param {string} communityId - Community ID
   * @param {Object} updates - Community updates
   * @returns {Promise<Object>} - Updated community data
   */
  async updateCommunity(communityId, updates) {
    try {
      const { data, error } = await supabase
        .from(TABLES.COMMUNITIES)
        .update(updates)
        .eq('id', communityId)
        .select()
        .single();

      if (error) throw error;

      return {
        communityId: data.id,
        name: data.name,
        description: data.description,
        topic: data.topic,
        createdBy: data.created_by,
        memberCount: data.member_count,
        posts: data.post_count,
        tags: data.tags || [],
        createdAt: data.created_at
      };
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  /**
   * Get community members
   * @param {string} communityId - Community ID
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (1-based)
   * @param {number} options.limit - Number of members per page
   * @returns {Promise<Array>} - List of members
   */
  async getCommunityMembers(communityId, { page = 1, limit = 20 } = {}) {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await supabase
        .from('user_communities')
        .select(`
          user_id,
          role,
          joined_at,
          user:users(
            id,
            username,
            bio
          )
        `, { count: 'exact' })
        .eq('community_id', communityId)
        .range(from, to);

      if (error) throw error;

      return {
        members: data.map(member => ({
          userId: member.user_id,
          username: member.user.username,
          bio: member.user.bio,
          role: member.role,
          joinedAt: member.joined_at
        })),
        totalCount: count,
        page,
        limit
      };
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }
};

