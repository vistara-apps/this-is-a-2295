import OpenAI from 'openai';

/**
 * Service for handling AI-related operations using OpenAI
 */
export const aiService = {
  /**
   * Initialize OpenAI client
   * @returns {OpenAI} - OpenAI client instance
   */
  getClient() {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error('Missing OpenAI API key. Please check your .env file.');
      throw new Error('OpenAI API key is required');
    }
    
    return new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true // Note: In production, API calls should be proxied through a backend
    });
  },

  /**
   * Generate AI response for business idea feedback
   * @param {string} prompt - User prompt
   * @param {Array} history - Conversation history
   * @returns {Promise<string>} - AI response
   */
  async generateBusinessFeedback(prompt, history = []) {
    try {
      const openai = this.getClient();
      
      const messages = [
        {
          role: 'system',
          content: `You are an expert business advisor specializing in AI startups and academic entrepreneurship. 
          Your goal is to provide constructive feedback, market insights, and actionable advice to students 
          developing AI-driven business ideas. Be encouraging but realistic, focusing on practical next steps 
          and potential challenges. Provide specific, actionable advice rather than generic statements.`
        },
        ...history.map(msg => ({
          role: msg.isUser ? 'user' : 'assistant',
          content: msg.content
        })),
        { role: 'user', content: prompt }
      ];
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages,
        temperature: 0.7,
        max_tokens: 1000
      });
      
      return response.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate AI response. Please try again later.');
    }
  },

  /**
   * Generate market analysis for a business idea
   * @param {string} idea - Business idea description
   * @returns {Promise<Object>} - Market analysis data
   */
  async generateMarketAnalysis(idea) {
    try {
      const openai = this.getClient();
      
      const prompt = `Provide a comprehensive market analysis for the following business idea:
      
      "${idea}"
      
      Include the following sections:
      1. Target Market: Identify the primary customer segments and their characteristics.
      2. Market Size: Estimate the potential market size and growth rate.
      3. Competitors: Identify key competitors and their strengths/weaknesses.
      4. Differentiation: Suggest unique value propositions to stand out.
      5. Challenges: Highlight potential market challenges and barriers to entry.
      6. Opportunities: Identify market gaps and growth opportunities.
      
      Format the response as JSON with these sections as keys.`;
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a market research expert. Provide detailed, data-driven market analysis in JSON format.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 1500,
        response_format: { type: 'json_object' }
      });
      
      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate market analysis. Please try again later.');
    }
  },

  /**
   * Generate action plan for a business idea
   * @param {string} idea - Business idea description
   * @returns {Promise<Object>} - Action plan data
   */
  async generateActionPlan(idea) {
    try {
      const openai = this.getClient();
      
      const prompt = `Create a detailed action plan for implementing the following business idea:
      
      "${idea}"
      
      The action plan should include:
      1. Immediate Next Steps: 3-5 concrete actions to take within the next week.
      2. Short-term Goals: Key milestones for the next 1-3 months.
      3. Medium-term Goals: Key milestones for the next 3-12 months.
      4. Resource Requirements: Essential resources needed (skills, tools, funding).
      5. Key Performance Indicators: Metrics to track progress and success.
      
      Format the response as JSON with these sections as keys and array values.`;
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a startup advisor specializing in helping students launch businesses. Provide practical, actionable advice in JSON format.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 1500,
        response_format: { type: 'json_object' }
      });
      
      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate action plan. Please try again later.');
    }
  },

  /**
   * Generate resource recommendations based on user interests
   * @param {Array} interests - User interests
   * @param {string} level - User skill level (beginner, intermediate, advanced)
   * @returns {Promise<Array>} - Resource recommendations
   */
  async generateResourceRecommendations(interests, level = 'beginner') {
    try {
      const openai = this.getClient();
      
      const prompt = `Recommend learning resources for someone with the following interests: ${interests.join(', ')}.
      Their skill level is: ${level}.
      
      For each interest, provide 3-5 resources including:
      - Online courses
      - Books
      - Tutorials
      - Tools
      - Communities
      
      For each resource, include:
      - Title
      - Type (course, book, etc.)
      - URL (if applicable)
      - Brief description
      - Difficulty level
      - Estimated time commitment
      
      Format the response as JSON with interests as keys and arrays of resource objects as values.`;
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are an educational resource expert. Provide personalized learning resource recommendations in JSON format.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500,
        response_format: { type: 'json_object' }
      });
      
      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate resource recommendations. Please try again later.');
    }
  },

  /**
   * Generate mentorship matches based on user profile
   * @param {Object} userProfile - User profile data
   * @returns {Promise<Array>} - Potential mentor/mentee matches
   */
  async generateMentorshipMatches(userProfile) {
    try {
      const openai = this.getClient();
      
      const prompt = `Based on the following user profile, suggest potential mentor/mentee matches:
      
      User Profile:
      - Interests: ${userProfile.interests.join(', ')}
      - Bio: ${userProfile.bio}
      - Skills: ${userProfile.skills?.join(', ') || 'Not specified'}
      - Goals: ${userProfile.goals || 'Not specified'}
      
      For each potential match, provide:
      - Match type (mentor or mentee)
      - Compatibility score (0-100)
      - Compatibility reasons
      - Suggested topics to discuss
      - Potential benefits for both parties
      
      Format the response as JSON with an array of match objects.`;
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a mentorship coordinator with expertise in academic and career development. Provide thoughtful mentorship match recommendations in JSON format.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: 'json_object' }
      });
      
      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate mentorship matches. Please try again later.');
    }
  },

  /**
   * Generate community discussion topics
   * @param {string} communityTopic - Community topic
   * @param {Array} tags - Community tags
   * @returns {Promise<Array>} - Discussion topic suggestions
   */
  async generateDiscussionTopics(communityTopic, tags = []) {
    try {
      const openai = this.getClient();
      
      const prompt = `Generate engaging discussion topics for a student community focused on: ${communityTopic}
      Related tags: ${tags.join(', ')}
      
      For each topic, provide:
      - Title: An engaging question or statement
      - Description: Brief context to start the discussion
      - Type: Question, Debate, Case Study, or Resource Sharing
      - Potential learning outcomes
      
      Generate 5-10 diverse topics that would spark meaningful discussions.
      Format the response as JSON with an array of topic objects.`;
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a community engagement specialist for academic and professional communities. Generate thoughtful discussion topics in JSON format.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 1000,
        response_format: { type: 'json_object' }
      });
      
      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate discussion topics. Please try again later.');
    }
  }
};

