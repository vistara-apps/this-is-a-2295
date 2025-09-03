import { supabase, handleSupabaseError, TABLES } from '../lib/supabase';

/**
 * Service for handling post-related operations
 */
export const postService = {
  /**
   * Get posts for a community
   * @param {string} communityId - Community ID
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (1-based)
   * @param {number} options.limit - Number of posts per page
   * @param {string} options.sortBy - Sort field (created_at, likes, comments)
   * @param {boolean} options.sortDesc - Sort direction (true for descending)
   * @returns {Promise<Object>} - Posts data with pagination info
   */
  async getCommunityPosts(communityId, { page = 1, limit = 10, sortBy = 'created_at', sortDesc = true } = {}) {
    try {
      let query = supabase
        .from(TABLES.POSTS)
        .select(`
          id,
          community_id,
          author_id,
          title,
          content,
          created_at,
          like_count,
          comment_count,
          tags,
          author:users!author_id(username)
        `)
        .eq('community_id', communityId);

      // Apply sorting
      const order = sortDesc ? { ascending: false } : { ascending: true };
      query = query.order(sortBy, order);

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        posts: data.map(post => ({
          postId: post.id,
          communityId: post.community_id,
          authorId: post.author_id,
          authorName: post.author?.username,
          title: post.title,
          content: post.content,
          createdAt: post.created_at,
          likes: post.like_count,
          comments: post.comment_count,
          tags: post.tags || []
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
   * Get a single post by ID
   * @param {string} postId - Post ID
   * @returns {Promise<Object>} - Post data
   */
  async getPostById(postId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.POSTS)
        .select(`
          id,
          community_id,
          author_id,
          title,
          content,
          created_at,
          like_count,
          comment_count,
          tags,
          author:users!author_id(username)
        `)
        .eq('id', postId)
        .single();

      if (error) throw error;

      return {
        postId: data.id,
        communityId: data.community_id,
        authorId: data.author_id,
        authorName: data.author?.username,
        title: data.title,
        content: data.content,
        createdAt: data.created_at,
        likes: data.like_count,
        comments: data.comment_count,
        tags: data.tags || []
      };
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  /**
   * Create a new post
   * @param {Object} postData - Post data
   * @returns {Promise<Object>} - Created post data
   */
  async createPost(postData) {
    try {
      const { data, error } = await supabase
        .from(TABLES.POSTS)
        .insert([
          {
            community_id: postData.communityId,
            author_id: postData.authorId,
            title: postData.title,
            content: postData.content,
            tags: postData.tags || [],
            like_count: 0,
            comment_count: 0
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Increment post count in community
      await supabase
        .from(TABLES.COMMUNITIES)
        .update({ post_count: supabase.rpc('increment', { x: 1 }) })
        .eq('id', postData.communityId);

      return {
        postId: data.id,
        communityId: data.community_id,
        authorId: data.author_id,
        title: data.title,
        content: data.content,
        createdAt: data.created_at,
        likes: data.like_count,
        comments: data.comment_count,
        tags: data.tags || []
      };
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  /**
   * Update a post
   * @param {string} postId - Post ID
   * @param {Object} updates - Post updates
   * @returns {Promise<Object>} - Updated post data
   */
  async updatePost(postId, updates) {
    try {
      const { data, error } = await supabase
        .from(TABLES.POSTS)
        .update(updates)
        .eq('id', postId)
        .select()
        .single();

      if (error) throw error;

      return {
        postId: data.id,
        communityId: data.community_id,
        authorId: data.author_id,
        title: data.title,
        content: data.content,
        createdAt: data.created_at,
        likes: data.like_count,
        comments: data.comment_count,
        tags: data.tags || []
      };
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  /**
   * Delete a post
   * @param {string} postId - Post ID
   * @param {string} communityId - Community ID
   * @returns {Promise<void>}
   */
  async deletePost(postId, communityId) {
    try {
      const { error } = await supabase
        .from(TABLES.POSTS)
        .delete()
        .eq('id', postId);

      if (error) throw error;

      // Decrement post count in community
      await supabase
        .from(TABLES.COMMUNITIES)
        .update({ post_count: supabase.rpc('decrement', { x: 1 }) })
        .eq('id', communityId);
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  /**
   * Like a post
   * @param {string} postId - Post ID
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  async likePost(postId, userId) {
    try {
      // Check if user already liked the post
      const { data: existingLike, error: checkError } = await supabase
        .from('post_likes')
        .select()
        .eq('post_id', postId)
        .eq('user_id', userId)
        .maybeSingle();

      if (checkError) throw checkError;

      // If not already liked, add like
      if (!existingLike) {
        const { error: likeError } = await supabase
          .from('post_likes')
          .insert([
            {
              post_id: postId,
              user_id: userId,
              created_at: new Date().toISOString()
            }
          ]);

        if (likeError) throw likeError;

        // Increment like count
        const { error: updateError } = await supabase
          .from(TABLES.POSTS)
          .update({ like_count: supabase.rpc('increment', { x: 1 }) })
          .eq('id', postId);

        if (updateError) throw updateError;
      }
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  /**
   * Unlike a post
   * @param {string} postId - Post ID
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  async unlikePost(postId, userId) {
    try {
      // Check if user liked the post
      const { data: existingLike, error: checkError } = await supabase
        .from('post_likes')
        .select()
        .eq('post_id', postId)
        .eq('user_id', userId)
        .maybeSingle();

      if (checkError) throw checkError;

      // If liked, remove like
      if (existingLike) {
        const { error: unlikeError } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId);

        if (unlikeError) throw unlikeError;

        // Decrement like count
        const { error: updateError } = await supabase
          .from(TABLES.POSTS)
          .update({ like_count: supabase.rpc('decrement', { x: 1 }) })
          .eq('id', postId);

        if (updateError) throw updateError;
      }
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  /**
   * Check if a user has liked a post
   * @param {string} postId - Post ID
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} - True if user has liked the post
   */
  async hasLiked(postId, userId) {
    try {
      const { data, error } = await supabase
        .from('post_likes')
        .select()
        .eq('post_id', postId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      return !!data;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  /**
   * Get comments for a post
   * @param {string} postId - Post ID
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (1-based)
   * @param {number} options.limit - Number of comments per page
   * @returns {Promise<Object>} - Comments data with pagination info
   */
  async getPostComments(postId, { page = 1, limit = 20 } = {}) {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await supabase
        .from(TABLES.COMMENTS)
        .select(`
          id,
          post_id,
          author_id,
          content,
          created_at,
          parent_id,
          author:users!author_id(username)
        `, { count: 'exact' })
        .eq('post_id', postId)
        .order('created_at', { ascending: true })
        .range(from, to);

      if (error) throw error;

      return {
        comments: data.map(comment => ({
          commentId: comment.id,
          postId: comment.post_id,
          authorId: comment.author_id,
          authorName: comment.author?.username,
          content: comment.content,
          createdAt: comment.created_at,
          parentId: comment.parent_id
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
   * Create a new comment
   * @param {Object} commentData - Comment data
   * @returns {Promise<Object>} - Created comment data
   */
  async createComment(commentData) {
    try {
      const { data, error } = await supabase
        .from(TABLES.COMMENTS)
        .insert([
          {
            post_id: commentData.postId,
            author_id: commentData.authorId,
            content: commentData.content,
            parent_id: commentData.parentId || null
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Increment comment count in post
      await supabase
        .from(TABLES.POSTS)
        .update({ comment_count: supabase.rpc('increment', { x: 1 }) })
        .eq('id', commentData.postId);

      return {
        commentId: data.id,
        postId: data.post_id,
        authorId: data.author_id,
        content: data.content,
        createdAt: data.created_at,
        parentId: data.parent_id
      };
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  /**
   * Update a comment
   * @param {string} commentId - Comment ID
   * @param {Object} updates - Comment updates
   * @returns {Promise<Object>} - Updated comment data
   */
  async updateComment(commentId, updates) {
    try {
      const { data, error } = await supabase
        .from(TABLES.COMMENTS)
        .update(updates)
        .eq('id', commentId)
        .select()
        .single();

      if (error) throw error;

      return {
        commentId: data.id,
        postId: data.post_id,
        authorId: data.author_id,
        content: data.content,
        createdAt: data.created_at,
        parentId: data.parent_id
      };
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  /**
   * Delete a comment
   * @param {string} commentId - Comment ID
   * @param {string} postId - Post ID
   * @returns {Promise<void>}
   */
  async deleteComment(commentId, postId) {
    try {
      const { error } = await supabase
        .from(TABLES.COMMENTS)
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      // Decrement comment count in post
      await supabase
        .from(TABLES.POSTS)
        .update({ comment_count: supabase.rpc('decrement', { x: 1 }) })
        .eq('id', postId);
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }
};

