/**
 * Service for handling payment-related operations with Stripe
 * 
 * Note: In a production environment, Stripe API calls should be made from a secure backend.
 * This service is designed to communicate with a backend API that handles the actual Stripe operations.
 */
export const paymentService = {
  /**
   * Get API base URL
   * @returns {string} - API base URL
   */
  getApiUrl() {
    return import.meta.env.VITE_API_URL || 'https://api.nichespark.com';
  },

  /**
   * Create a checkout session for subscription
   * @param {Object} params - Checkout parameters
   * @param {string} params.userId - User ID
   * @param {string} params.tier - Subscription tier (premium, pro)
   * @param {string} params.email - User email
   * @returns {Promise<Object>} - Checkout session data
   */
  async createCheckoutSession(params) {
    try {
      const response = await fetch(`${this.getApiUrl()}/api/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create checkout session');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Payment service error:', error);
      throw new Error('Failed to create checkout session. Please try again later.');
    }
  },

  /**
   * Create a customer portal session
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Portal session data
   */
  async createPortalSession(userId) {
    try {
      const response = await fetch(`${this.getApiUrl()}/api/portal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create portal session');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Payment service error:', error);
      throw new Error('Failed to create portal session. Please try again later.');
    }
  },

  /**
   * Get subscription details
   * @param {string} subscriptionId - Stripe subscription ID
   * @returns {Promise<Object>} - Subscription details
   */
  async getSubscriptionDetails(subscriptionId) {
    try {
      const response = await fetch(`${this.getApiUrl()}/api/subscriptions/${subscriptionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get subscription details');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Payment service error:', error);
      throw new Error('Failed to get subscription details. Please try again later.');
    }
  },

  /**
   * Cancel subscription
   * @param {string} subscriptionId - Stripe subscription ID
   * @param {boolean} cancelAtPeriodEnd - Whether to cancel at period end
   * @returns {Promise<Object>} - Cancellation result
   */
  async cancelSubscription(subscriptionId, cancelAtPeriodEnd = true) {
    try {
      const response = await fetch(`${this.getApiUrl()}/api/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cancelAtPeriodEnd }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to cancel subscription');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Payment service error:', error);
      throw new Error('Failed to cancel subscription. Please try again later.');
    }
  },

  /**
   * Get subscription prices
   * @returns {Promise<Array>} - List of subscription prices
   */
  async getSubscriptionPrices() {
    try {
      const response = await fetch(`${this.getApiUrl()}/api/prices`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get subscription prices');
      }

      const data = await response.json();
      return data.prices;
    } catch (error) {
      console.error('Payment service error:', error);
      
      // Return mock prices for development
      return [
        {
          id: 'price_premium',
          product: 'prod_premium',
          nickname: 'Premium',
          unit_amount: 500, // $5.00
          currency: 'usd',
          recurring: {
            interval: 'month'
          }
        },
        {
          id: 'price_pro',
          product: 'prod_pro',
          nickname: 'Pro',
          unit_amount: 1500, // $15.00
          currency: 'usd',
          recurring: {
            interval: 'month'
          }
        }
      ];
    }
  },

  /**
   * Get payment methods for a customer
   * @param {string} customerId - Stripe customer ID
   * @returns {Promise<Array>} - List of payment methods
   */
  async getPaymentMethods(customerId) {
    try {
      const response = await fetch(`${this.getApiUrl()}/api/customers/${customerId}/payment-methods`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get payment methods');
      }

      const data = await response.json();
      return data.paymentMethods;
    } catch (error) {
      console.error('Payment service error:', error);
      throw new Error('Failed to get payment methods. Please try again later.');
    }
  },

  /**
   * Format currency amount
   * @param {number} amount - Amount in cents
   * @param {string} currency - Currency code
   * @returns {string} - Formatted currency amount
   */
  formatCurrency(amount, currency = 'usd') {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    });
    
    return formatter.format(amount / 100);
  }
};

