import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, TABLES } from '../lib/supabase';
import { useAuth } from './AuthContext';

const DataContext = createContext();

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

export function DataProvider({ children }) {
  const { user } = useAuth();
  const [communities, setCommunities] = useState([]);
  const [userCommunities, setUserCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch communities when user changes
  useEffect(() => {
    if (user) {
      fetchCommunities();
      fetchUserCommunities();
    } else {
      setCommunities([]);
      setUserCommunities([]);
      setLoading(false);
    }
  }, [user]);

  // Fetch all communities
  const fetchCommunities = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from(TABLES.COMMUNITIES)
        .select(`
          id,
          name,
          description,
          topic,
          created_by,
          created_at,
          updated_at,
          member_count
        `)
        .order('member_count', { ascending: false });
      
      if (error) throw error;
      
      setCommunities(data || []);
    } catch (error) {
      console.error('Error fetching communities:', error);
      setError('Failed to fetch communities. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch communities the user is a member of
  const fetchUserCommunities = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from(TABLES.COMMUNITY_MEMBERS)
        .select(`
          community_id,
          role,
          joined_at,
          community:communities(
            id,
            name,
            description,
            topic,
            created_by,
            created_at,
            updated_at,
            member_count
          )
        `)
        .eq('user_id', user.userId);
      
      if (error) throw error;
      
      const userCommunityData = data.map(item => ({
        ...item.community,
        role: item.role,
        joinedAt: item.joined_at
      }));
      
      setUserCommunities(userCommunityData || []);
    } catch (error) {
      console.error('Error fetching user communities:', error);
      setError('Failed to fetch your communities. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Get a community by ID
  const getCommunity = async (communityId) => {
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
          updated_at,
          member_count,
          creator:users!created_by(username)
        `)
        .eq('id', communityId)
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error fetching community:', error);
      throw new Error('Failed to fetch community. Please try again later.');
    }
  };

  // Check if user is a member of a community
  const isUserMember = async (communityId) => {
    try {
      const { data, error } = await supabase
        .from(TABLES.COMMUNITY_MEMBERS)
        .select('role')
        .eq('community_id', communityId)
        .eq('user_id', user.userId)
        .maybeSingle();
      
      if (error) throw error;
      
      return data ? { isMember: true, role: data.role } : { isMember: false, role: null };
    } catch (error) {
      console.error('Error checking membership:', error);
      throw new Error('Failed to check membership. Please try again later.');
    }
  };

  // Join a community
  const joinCommunity = async (communityId) => {
    try {
      // Check if user is already a member
      const { isMember } = await isUserMember(communityId);
      
      if (isMember) {
        return { success: true, message: 'You are already a member of this community.' };
      }
      
      // Add user to community
      const { error } = await supabase
        .from(TABLES.COMMUNITY_MEMBERS)
        .insert([
          {
            community_id: communityId,
            user_id: user.userId,
            role: 'member'
          }
        ]);
      
      if (error) throw error;
      
      // Update member count
      await supabase.rpc('increment_member_count', { community_id: communityId });
      
      // Refresh user communities
      fetchUserCommunities();
      
      return { success: true, message: 'Successfully joined the community.' };
    } catch (error) {
      console.error('Error joining community:', error);
      return { success: false, message: 'Failed to join community. Please try again later.' };
    }
  };

  // Leave a community
  const leaveCommunity = async (communityId) => {
    try {
      // Check if user is a member
      const { isMember } = await isUserMember(communityId);
      
      if (!isMember) {
        return { success: true, message: 'You are not a member of this community.' };
      }
      
      // Remove user from community
      const { error } = await supabase
        .from(TABLES.COMMUNITY_MEMBERS)
        .delete()
        .eq('community_id', communityId)
        .eq('user_id', user.userId);
      
      if (error) throw error;
      
      // Update member count
      await supabase.rpc('decrement_member_count', { community_id: communityId });
      
      // Refresh user communities
      fetchUserCommunities();
      
      return { success: true, message: 'Successfully left the community.' };
    } catch (error) {
      console.error('Error leaving community:', error);
      return { success: false, message: 'Failed to leave community. Please try again later.' };
    }
  };

  // Create a new community
  const createCommunity = async (communityData) => {
    try {
      // Create community
      const { data, error } = await supabase
        .from(TABLES.COMMUNITIES)
        .insert([
          {
            name: communityData.name,
            description: communityData.description,
            topic: communityData.topic,
            created_by: user.userId,
            member_count: 1
          }
        ])
        .select()
        .single();
      
      if (error) throw error;
      
      // Add creator as admin
      await supabase
        .from(TABLES.COMMUNITY_MEMBERS)
        .insert([
          {
            community_id: data.id,
            user_id: user.userId,
            role: 'admin'
          }
        ]);
      
      // Refresh communities
      fetchCommunities();
      fetchUserCommunities();
      
      return { success: true, communityId: data.id };
    } catch (error) {
      console.error('Error creating community:', error);
      return { success: false, message: 'Failed to create community. Please try again later.' };
    }
  };

  // Get posts for a community
  const getCommunityPosts = async (communityId, { page = 1, limit = 10 } = {}) => {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      const { data, error, count } = await supabase
        .from(TABLES.POSTS)
        .select(`
          id,
          title,
          content,
          created_at,
          updated_at,
          author_id,
          community_id,
          likes,
          comment_count,
          author:users!author_id(username)
        `, { count: 'exact' })
        .eq('community_id', communityId)
        .order('created_at', { ascending: false })
        .range(from, to);
      
      if (error) throw error;
      
      return {
        posts: data || [],
        totalCount: count,
        page,
        limit
      };
    } catch (error) {
      console.error('Error fetching community posts:', error);
      throw new Error('Failed to fetch posts. Please try again later.');
    }
  };

  // Create a post
  const createPost = async (postData) => {
    try {
      const { data, error } = await supabase
        .from(TABLES.POSTS)
        .insert([
          {
            title: postData.title,
            content: postData.content,
            author_id: user.userId,
            community_id: postData.communityId
          }
        ])
        .select()
        .single();
      
      if (error) throw error;
      
      return { success: true, postId: data.id };
    } catch (error) {
      console.error('Error creating post:', error);
      return { success: false, message: 'Failed to create post. Please try again later.' };
    }
  };

  // Get comments for a post
  const getPostComments = async (postId) => {
    try {
      const { data, error } = await supabase
        .from(TABLES.COMMENTS)
        .select(`
          id,
          content,
          created_at,
          updated_at,
          author_id,
          post_id,
          parent_id,
          likes,
          author:users!author_id(username)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching post comments:', error);
      throw new Error('Failed to fetch comments. Please try again later.');
    }
  };

  // Create a comment
  const createComment = async (commentData) => {
    try {
      const { data, error } = await supabase
        .from(TABLES.COMMENTS)
        .insert([
          {
            content: commentData.content,
            author_id: user.userId,
            post_id: commentData.postId,
            parent_id: commentData.parentId || null
          }
        ])
        .select()
        .single();
      
      if (error) throw error;
      
      // Increment comment count on post
      await supabase.rpc('increment_comment_count', { post_id: commentData.postId });
      
      return { success: true, commentId: data.id };
    } catch (error) {
      console.error('Error creating comment:', error);
      return { success: false, message: 'Failed to create comment. Please try again later.' };
    }
  };

  // Like a post
  const likePost = async (postId) => {
    try {
      // Check if already liked
      const { data: existingLike, error: checkError } = await supabase
        .from(TABLES.POST_LIKES)
        .select()
        .eq('post_id', postId)
        .eq('user_id', user.userId)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      if (existingLike) {
        // Unlike
        const { error: unlikeError } = await supabase
          .from(TABLES.POST_LIKES)
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.userId);
        
        if (unlikeError) throw unlikeError;
        
        // Decrement like count
        await supabase.rpc('decrement_post_likes', { post_id: postId });
        
        return { success: true, liked: false };
      } else {
        // Like
        const { error: likeError } = await supabase
          .from(TABLES.POST_LIKES)
          .insert([
            {
              post_id: postId,
              user_id: user.userId
            }
          ]);
        
        if (likeError) throw likeError;
        
        // Increment like count
        await supabase.rpc('increment_post_likes', { post_id: postId });
        
        return { success: true, liked: true };
      }
    } catch (error) {
      console.error('Error liking post:', error);
      return { success: false, message: 'Failed to like post. Please try again later.' };
    }
  };

  // Check if user has liked a post
  const hasLikedPost = async (postId) => {
    try {
      const { data, error } = await supabase
        .from(TABLES.POST_LIKES)
        .select()
        .eq('post_id', postId)
        .eq('user_id', user.userId)
        .maybeSingle();
      
      if (error) throw error;
      
      return !!data;
    } catch (error) {
      console.error('Error checking post like:', error);
      return false;
    }
  };

  const value = {
    communities,
    userCommunities,
    loading,
    error,
    fetchCommunities,
    fetchUserCommunities,
    getCommunity,
    isUserMember,
    joinCommunity,
    leaveCommunity,
    createCommunity,
    getCommunityPosts,
    createPost,
    getPostComments,
    createComment,
    likePost,
    hasLikedPost
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

