import { supabase, handleSupabaseError, TABLES } from '../lib/supabase';
import { aiService } from './aiService';

/**
 * Service for handling mentorship-related operations
 */
export const mentorshipService = {
  /**
   * Get mentorship profile for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Mentorship profile data
   */
  async getMentorshipProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('mentorship_profiles')
        .select(`
          id,
          user_id,
          is_mentor,
          is_mentee,
          mentor_topics,
          mentee_topics,
          experience_level,
          availability,
          bio,
          created_at,
          updated_at
        `)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        return null;
      }

      return {
        profileId: data.id,
        userId: data.user_id,
        isMentor: data.is_mentor,
        isMentee: data.is_mentee,
        mentorTopics: data.mentor_topics || [],
        menteeTopics: data.mentee_topics || [],
        experienceLevel: data.experience_level,
        availability: data.availability,
        bio: data.bio,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  /**
   * Create or update mentorship profile
   * @param {string} userId - User ID
   * @param {Object} profileData - Profile data
   * @returns {Promise<Object>} - Updated profile data
   */
  async updateMentorshipProfile(userId, profileData) {
    try {
      // Check if profile already exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('mentorship_profiles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (checkError) throw checkError;

      let result;

      if (existingProfile) {
        // Update existing profile
        const { data, error } = await supabase
          .from('mentorship_profiles')
          .update({
            is_mentor: profileData.isMentor,
            is_mentee: profileData.isMentee,
            mentor_topics: profileData.mentorTopics || [],
            mentee_topics: profileData.menteeTopics || [],
            experience_level: profileData.experienceLevel,
            availability: profileData.availability,
            bio: profileData.bio,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingProfile.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Create new profile
        const { data, error } = await supabase
          .from('mentorship_profiles')
          .insert([
            {
              user_id: userId,
              is_mentor: profileData.isMentor,
              is_mentee: profileData.isMentee,
              mentor_topics: profileData.mentorTopics || [],
              mentee_topics: profileData.menteeTopics || [],
              experience_level: profileData.experienceLevel,
              availability: profileData.availability,
              bio: profileData.bio
            }
          ])
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      return {
        profileId: result.id,
        userId: result.user_id,
        isMentor: result.is_mentor,
        isMentee: result.is_mentee,
        mentorTopics: result.mentor_topics || [],
        menteeTopics: result.mentee_topics || [],
        experienceLevel: result.experience_level,
        availability: result.availability,
        bio: result.bio,
        createdAt: result.created_at,
        updatedAt: result.updated_at
      };
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  /**
   * Find mentors based on topics
   * @param {Array} topics - Topics of interest
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (1-based)
   * @param {number} options.limit - Number of mentors per page
   * @returns {Promise<Object>} - Mentors data with pagination info
   */
  async findMentors(topics, { page = 1, limit = 10 } = {}) {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from('mentorship_profiles')
        .select(`
          id,
          user_id,
          mentor_topics,
          experience_level,
          availability,
          bio,
          user:users!user_id(
            username,
            bio
          )
        `, { count: 'exact' })
        .eq('is_mentor', true);

      // Filter by topics if provided
      if (topics && topics.length > 0) {
        // Find mentors where at least one topic matches
        const topicConditions = topics.map(topic => `mentor_topics.cs.{${topic}}`);
        query = query.or(topicConditions.join(','));
      }

      // Apply pagination
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        mentors: data.map(mentor => ({
          profileId: mentor.id,
          userId: mentor.user_id,
          username: mentor.user.username,
          userBio: mentor.user.bio,
          mentorTopics: mentor.mentor_topics || [],
          experienceLevel: mentor.experience_level,
          availability: mentor.availability,
          bio: mentor.bio
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
   * Find mentees based on topics
   * @param {Array} topics - Topics to mentor in
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (1-based)
   * @param {number} options.limit - Number of mentees per page
   * @returns {Promise<Object>} - Mentees data with pagination info
   */
  async findMentees(topics, { page = 1, limit = 10 } = {}) {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from('mentorship_profiles')
        .select(`
          id,
          user_id,
          mentee_topics,
          experience_level,
          availability,
          bio,
          user:users!user_id(
            username,
            bio
          )
        `, { count: 'exact' })
        .eq('is_mentee', true);

      // Filter by topics if provided
      if (topics && topics.length > 0) {
        // Find mentees where at least one topic matches
        const topicConditions = topics.map(topic => `mentee_topics.cs.{${topic}}`);
        query = query.or(topicConditions.join(','));
      }

      // Apply pagination
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        mentees: data.map(mentee => ({
          profileId: mentee.id,
          userId: mentee.user_id,
          username: mentee.user.username,
          userBio: mentee.user.bio,
          menteeTopics: mentee.mentee_topics || [],
          experienceLevel: mentee.experience_level,
          availability: mentee.availability,
          bio: mentee.bio
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
   * Create a mentorship request
   * @param {Object} requestData - Request data
   * @returns {Promise<Object>} - Created request data
   */
  async createMentorshipRequest(requestData) {
    try {
      const { data, error } = await supabase
        .from('mentorship_requests')
        .insert([
          {
            requester_id: requestData.requesterId,
            recipient_id: requestData.recipientId,
            topics: requestData.topics || [],
            message: requestData.message,
            status: 'pending'
          }
        ])
        .select()
        .single();

      if (error) throw error;

      return {
        requestId: data.id,
        requesterId: data.requester_id,
        recipientId: data.recipient_id,
        topics: data.topics || [],
        message: data.message,
        status: data.status,
        createdAt: data.created_at
      };
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  /**
   * Update mentorship request status
   * @param {string} requestId - Request ID
   * @param {string} status - New status (accepted, rejected, completed)
   * @returns {Promise<Object>} - Updated request data
   */
  async updateRequestStatus(requestId, status) {
    try {
      const { data, error } = await supabase
        .from('mentorship_requests')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .select()
        .single();

      if (error) throw error;

      // If request was accepted, create a mentorship relationship
      if (status === 'accepted') {
        await supabase
          .from('mentorships')
          .insert([
            {
              mentor_id: data.recipient_id,
              mentee_id: data.requester_id,
              topics: data.topics,
              request_id: data.id,
              status: 'active'
            }
          ]);
      }

      return {
        requestId: data.id,
        requesterId: data.requester_id,
        recipientId: data.recipient_id,
        topics: data.topics || [],
        message: data.message,
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  /**
   * Get mentorship requests for a user
   * @param {string} userId - User ID
   * @param {string} type - Request type (sent, received, all)
   * @returns {Promise<Array>} - List of requests
   */
  async getMentorshipRequests(userId, type = 'all') {
    try {
      let query = supabase
        .from('mentorship_requests')
        .select(`
          id,
          requester_id,
          recipient_id,
          topics,
          message,
          status,
          created_at,
          updated_at,
          requester:users!requester_id(username),
          recipient:users!recipient_id(username)
        `);

      if (type === 'sent') {
        query = query.eq('requester_id', userId);
      } else if (type === 'received') {
        query = query.eq('recipient_id', userId);
      } else {
        query = query.or(`requester_id.eq.${userId},recipient_id.eq.${userId}`);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      return data.map(request => ({
        requestId: request.id,
        requesterId: request.requester_id,
        requesterName: request.requester.username,
        recipientId: request.recipient_id,
        recipientName: request.recipient.username,
        topics: request.topics || [],
        message: request.message,
        status: request.status,
        createdAt: request.created_at,
        updatedAt: request.updated_at
      }));
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  /**
   * Get active mentorships for a user
   * @param {string} userId - User ID
   * @param {string} role - User role (mentor, mentee, all)
   * @returns {Promise<Array>} - List of mentorships
   */
  async getActiveMentorships(userId, role = 'all') {
    try {
      let query = supabase
        .from('mentorships')
        .select(`
          id,
          mentor_id,
          mentee_id,
          topics,
          status,
          created_at,
          updated_at,
          mentor:users!mentor_id(username),
          mentee:users!mentee_id(username)
        `)
        .eq('status', 'active');

      if (role === 'mentor') {
        query = query.eq('mentor_id', userId);
      } else if (role === 'mentee') {
        query = query.eq('mentee_id', userId);
      } else {
        query = query.or(`mentor_id.eq.${userId},mentee_id.eq.${userId}`);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data.map(mentorship => ({
        mentorshipId: mentorship.id,
        mentorId: mentorship.mentor_id,
        mentorName: mentorship.mentor.username,
        menteeId: mentorship.mentee_id,
        menteeName: mentorship.mentee.username,
        topics: mentorship.topics || [],
        status: mentorship.status,
        createdAt: mentorship.created_at,
        updatedAt: mentorship.updated_at
      }));
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  /**
   * Get AI-suggested mentorship matches
   * @param {string} userId - User ID
   * @param {string} role - User role (mentor, mentee)
   * @returns {Promise<Array>} - List of suggested matches
   */
  async getSuggestedMatches(userId, role) {
    try {
      // Get user profile
      const { data: userData, error: userError } = await supabase
        .from(TABLES.USERS)
        .select(`
          id,
          username,
          bio,
          interests
        `)
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      // Get mentorship profile
      const mentorshipProfile = await this.getMentorshipProfile(userId);

      // Prepare user profile for AI
      const userProfile = {
        interests: userData.interests || [],
        bio: userData.bio || '',
        skills: role === 'mentor' ? mentorshipProfile?.mentorTopics || [] : [],
        goals: role === 'mentee' ? mentorshipProfile?.menteeTopics || [] : []
      };

      // Get AI-suggested matches
      const matches = await aiService.generateMentorshipMatches(userProfile);

      return matches;
    } catch (error) {
      console.error('Error getting suggested matches:', error);
      throw new Error('Failed to get suggested matches. Please try again later.');
    }
  }
};

