import { supabase, handleSupabaseError, TABLES } from '../lib/supabase';

/**
 * Service for handling subscription-related operations
 */
export const subscriptionService = {
  /**
   * Get user subscription
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Subscription data
   */
  async getUserSubscription(userId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.USER_SUBSCRIPTIONS)
        .select(`
          id,
          user_id,
          subscription_tier,
          status,
          current_period_start,
          current_period_end,
          cancel_at_period_end,
          created_at,
          updated_at,
          stripe_customer_id,
          stripe_subscription_id
        `)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        return {
          tier: 'free',
          status: 'active',
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false
        };
      }

      return {
        subscriptionId: data.id,
        tier: data.subscription_tier,
        status: data.status,
        currentPeriodStart: data.current_period_start,
        currentPeriodEnd: data.current_period_end,
        cancelAtPeriodEnd: data.cancel_at_period_end,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        stripeCustomerId: data.stripe_customer_id,
        stripeSubscriptionId: data.stripe_subscription_id
      };
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  /**
   * Create or update user subscription
   * @param {string} userId - User ID
   * @param {Object} subscriptionData - Subscription data
   * @returns {Promise<Object>} - Updated subscription data
   */
  async updateSubscription(userId, subscriptionData) {
    try {
      // Check if user already has a subscription
      const { data: existingSubscription, error: checkError } = await supabase
        .from(TABLES.USER_SUBSCRIPTIONS)
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (checkError) throw checkError;

      let result;

      if (existingSubscription) {
        // Update existing subscription
        const { data, error } = await supabase
          .from(TABLES.USER_SUBSCRIPTIONS)
          .update({
            subscription_tier: subscriptionData.tier,
            status: subscriptionData.status,
            current_period_start: subscriptionData.currentPeriodStart,
            current_period_end: subscriptionData.currentPeriodEnd,
            cancel_at_period_end: subscriptionData.cancelAtPeriodEnd,
            updated_at: new Date().toISOString(),
            stripe_customer_id: subscriptionData.stripeCustomerId,
            stripe_subscription_id: subscriptionData.stripeSubscriptionId
          })
          .eq('id', existingSubscription.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Create new subscription
        const { data, error } = await supabase
          .from(TABLES.USER_SUBSCRIPTIONS)
          .insert([
            {
              user_id: userId,
              subscription_tier: subscriptionData.tier,
              status: subscriptionData.status,
              current_period_start: subscriptionData.currentPeriodStart,
              current_period_end: subscriptionData.currentPeriodEnd,
              cancel_at_period_end: subscriptionData.cancelAtPeriodEnd,
              stripe_customer_id: subscriptionData.stripeCustomerId,
              stripe_subscription_id: subscriptionData.stripeSubscriptionId
            }
          ])
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      // Update user's subscription tier
      await supabase
        .from(TABLES.USERS)
        .update({ subscription_tier: subscriptionData.tier })
        .eq('id', userId);

      return {
        subscriptionId: result.id,
        tier: result.subscription_tier,
        status: result.status,
        currentPeriodStart: result.current_period_start,
        currentPeriodEnd: result.current_period_end,
        cancelAtPeriodEnd: result.cancel_at_period_end,
        createdAt: result.created_at,
        updatedAt: result.updated_at,
        stripeCustomerId: result.stripe_customer_id,
        stripeSubscriptionId: result.stripe_subscription_id
      };
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  /**
   * Cancel subscription
   * @param {string} userId - User ID
   * @param {boolean} immediateCancel - Whether to cancel immediately or at period end
   * @returns {Promise<Object>} - Updated subscription data
   */
  async cancelSubscription(userId, immediateCancel = false) {
    try {
      const { data, error } = await supabase
        .from(TABLES.USER_SUBSCRIPTIONS)
        .update({
          status: immediateCancel ? 'canceled' : 'active',
          cancel_at_period_end: !immediateCancel,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      // If immediate cancel, update user's subscription tier to free
      if (immediateCancel) {
        await supabase
          .from(TABLES.USERS)
          .update({ subscription_tier: 'free' })
          .eq('id', userId);
      }

      return {
        subscriptionId: data.id,
        tier: data.subscription_tier,
        status: data.status,
        currentPeriodStart: data.current_period_start,
        currentPeriodEnd: data.current_period_end,
        cancelAtPeriodEnd: data.cancel_at_period_end,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        stripeCustomerId: data.stripe_customer_id,
        stripeSubscriptionId: data.stripe_subscription_id
      };
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  /**
   * Get subscription tiers
   * @returns {Promise<Array>} - List of subscription tiers
   */
  async getSubscriptionTiers() {
    // This could be fetched from the database in the future
    // For now, return hardcoded tiers based on the PRD
    return [
      {
        id: 'free',
        name: 'Free',
        description: 'Basic access to communities and features',
        price: 0,
        features: [
          'Join up to 5 communities',
          'Create posts and comments',
          'Access to basic resources'
        ],
        limitations: [
          'Limited AI features',
          'No mentorship access',
          'Basic resource access only'
        ]
      },
      {
        id: 'premium',
        name: 'Premium',
        description: 'Enhanced access with more features',
        price: 5,
        interval: 'month',
        features: [
          'Join unlimited communities',
          'Create and moderate communities',
          'Enhanced AI features',
          'Access to premium resources',
          'Basic mentorship features'
        ],
        limitations: [
          'Limited AI business building tools',
          'Basic mentorship features only'
        ]
      },
      {
        id: 'pro',
        name: 'Pro',
        description: 'Full access to all features and tools',
        price: 15,
        interval: 'month',
        features: [
          'All Premium features',
          'Full access to AI business building tools',
          'Advanced mentorship features',
          'Priority support',
          'Access to exclusive workshops and events',
          'Advanced analytics and insights'
        ],
        limitations: []
      }
    ];
  },

  /**
   * Check if user has access to a feature
   * @param {string} tier - User's subscription tier
   * @param {string} feature - Feature to check
   * @returns {boolean} - True if user has access
   */
  hasAccess(tier, feature) {
    const tierLevel = {
      'free': 0,
      'premium': 1,
      'pro': 2
    };

    const featureRequirements = {
      'create_community': 1, // premium or higher
      'join_unlimited_communities': 1, // premium or higher
      'ai_basic': 0, // free or higher
      'ai_enhanced': 1, // premium or higher
      'ai_advanced': 2, // pro only
      'mentorship_basic': 1, // premium or higher
      'mentorship_advanced': 2, // pro only
      'resources_basic': 0, // free or higher
      'resources_premium': 1, // premium or higher
      'resources_advanced': 2, // pro only
      'analytics': 2, // pro only
      'workshops': 2 // pro only
    };

    const userLevel = tierLevel[tier] || 0;
    const requiredLevel = featureRequirements[feature] || 0;

    return userLevel >= requiredLevel;
  }
};

