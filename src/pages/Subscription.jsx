import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Loader,
  Settings,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { subscriptionService } from '../services/subscriptionService';
import { paymentService } from '../services/paymentService';
import SubscriptionCard from '../components/SubscriptionCard';

function Subscription() {
  const { user, updateUser } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch subscription data
  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        setLoading(true);
        
        // Get subscription tiers
        const tiersData = await subscriptionService.getSubscriptionTiers();
        setTiers(tiersData);
        
        // Get user subscription
        if (user) {
          const subscriptionData = await subscriptionService.getUserSubscription(user.userId);
          setSubscription(subscriptionData);
        }
      } catch (error) {
        console.error('Error fetching subscription data:', error);
        setError('Failed to load subscription information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionData();
  }, [user]);

  const handleSelectTier = async (tierId) => {
    try {
      setCheckoutLoading(true);
      setError(null);
      
      if (tierId === 'free') {
        // Downgrade to free tier
        if (subscription && subscription.tier !== 'free') {
          await subscriptionService.cancelSubscription(user.userId, true);
          
          // Update local subscription state
          setSubscription({
            ...subscription,
            tier: 'free',
            status: 'active'
          });
          
          // Update user context
          updateUser({ subscription: 'free' });
          
          setSuccess('Successfully downgraded to Free tier.');
        }
      } else {
        // Create checkout session for paid tier
        const checkoutSession = await paymentService.createCheckoutSession({
          userId: user.userId,
          tier: tierId,
          email: user.email
        });
        
        // Redirect to checkout page
        window.location.href = checkoutSession.url;
      }
    } catch (error) {
      console.error('Error selecting tier:', error);
      setError('Failed to process subscription change. Please try again later.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setCheckoutLoading(true);
      
      const portalSession = await paymentService.createPortalSession(user.userId);
      
      // Redirect to customer portal
      window.location.href = portalSession.url;
    } catch (error) {
      console.error('Error opening customer portal:', error);
      setError('Failed to open subscription management portal. Please try again later.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Subscription</h1>
        <p className="text-white/70 mt-1">Manage your NicheSpark subscription</p>
      </div>

      {/* Current Subscription */}
      {loading ? (
        <div className="glass-effect rounded-xl p-8 text-center">
          <Loader className="h-8 w-8 text-white/60 mx-auto animate-spin mb-4" />
          <p className="text-white/70">Loading subscription information...</p>
        </div>
      ) : subscription ? (
        <div className="glass-effect rounded-xl p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <h2 className="text-xl font-semibold text-white">Current Plan: {subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1)}</h2>
                {subscription.status === 'active' ? (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                ) : subscription.status === 'canceled' ? (
                  <AlertCircle className="h-5 w-5 text-red-400" />
                ) : (
                  <Clock className="h-5 w-5 text-yellow-400" />
                )}
              </div>
              
              <div className="text-white/70">
                {subscription.status === 'active' && subscription.tier !== 'free' && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {subscription.cancelAtPeriodEnd
                        ? `Access until ${formatDate(subscription.currentPeriodEnd)}`
                        : `Renews on ${formatDate(subscription.currentPeriodEnd)}`}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {subscription.tier !== 'free' && (
              <button
                onClick={handleManageSubscription}
                disabled={checkoutLoading}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-white text-purple-600 rounded-lg font-medium hover:bg-white/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {checkoutLoading ? (
                  <Loader className="h-5 w-5 animate-spin" />
                ) : (
                  <Settings className="h-5 w-5" />
                )}
                <span>Manage Subscription</span>
              </button>
            )}
          </div>
        </div>
      ) : null}

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-white">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        </div>
      )}
      
      {success && (
        <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 text-white">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <p>{success}</p>
          </div>
        </div>
      )}

      {/* Subscription Tiers */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-6">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <SubscriptionCard
              key={tier.id}
              tier={tier}
              currentTier={subscription?.tier || 'free'}
              onSelect={handleSelectTier}
              isLoading={checkoutLoading}
            />
          ))}
        </div>
      </div>

      {/* Feature Comparison */}
      <div className="glass-effect rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Feature Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-white/70">Feature</th>
                <th className="text-center py-3 px-4 text-white">Free</th>
                <th className="text-center py-3 px-4 text-white">Premium</th>
                <th className="text-center py-3 px-4 text-white">Pro</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/10">
                <td className="py-3 px-4 text-white">Join Communities</td>
                <td className="text-center py-3 px-4 text-white/70">Up to 5</td>
                <td className="text-center py-3 px-4 text-white/70">Unlimited</td>
                <td className="text-center py-3 px-4 text-white/70">Unlimited</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-3 px-4 text-white">Create Communities</td>
                <td className="text-center py-3 px-4 text-white/70">
                  <AlertCircle className="h-5 w-5 text-red-400 mx-auto" />
                </td>
                <td className="text-center py-3 px-4 text-white/70">
                  <CheckCircle className="h-5 w-5 text-green-400 mx-auto" />
                </td>
                <td className="text-center py-3 px-4 text-white/70">
                  <CheckCircle className="h-5 w-5 text-green-400 mx-auto" />
                </td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-3 px-4 text-white">AI Business Tools</td>
                <td className="text-center py-3 px-4 text-white/70">Basic</td>
                <td className="text-center py-3 px-4 text-white/70">Enhanced</td>
                <td className="text-center py-3 px-4 text-white/70">Advanced</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-3 px-4 text-white">Mentorship Features</td>
                <td className="text-center py-3 px-4 text-white/70">
                  <AlertCircle className="h-5 w-5 text-red-400 mx-auto" />
                </td>
                <td className="text-center py-3 px-4 text-white/70">Basic</td>
                <td className="text-center py-3 px-4 text-white/70">Advanced</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-3 px-4 text-white">Learning Resources</td>
                <td className="text-center py-3 px-4 text-white/70">Access Only</td>
                <td className="text-center py-3 px-4 text-white/70">
                  <div className="flex items-center justify-center space-x-1">
                    <span>Access & Contribute</span>
                  </div>
                </td>
                <td className="text-center py-3 px-4 text-white/70">
                  <div className="flex items-center justify-center space-x-1">
                    <span>Full Access</span>
                  </div>
                </td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-3 px-4 text-white">Analytics & Insights</td>
                <td className="text-center py-3 px-4 text-white/70">
                  <AlertCircle className="h-5 w-5 text-red-400 mx-auto" />
                </td>
                <td className="text-center py-3 px-4 text-white/70">
                  <AlertCircle className="h-5 w-5 text-red-400 mx-auto" />
                </td>
                <td className="text-center py-3 px-4 text-white/70">
                  <CheckCircle className="h-5 w-5 text-green-400 mx-auto" />
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-white">Exclusive Workshops</td>
                <td className="text-center py-3 px-4 text-white/70">
                  <AlertCircle className="h-5 w-5 text-red-400 mx-auto" />
                </td>
                <td className="text-center py-3 px-4 text-white/70">
                  <AlertCircle className="h-5 w-5 text-red-400 mx-auto" />
                </td>
                <td className="text-center py-3 px-4 text-white/70">
                  <CheckCircle className="h-5 w-5 text-green-400 mx-auto" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ */}
      <div className="glass-effect rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-white mb-2">How do I upgrade my subscription?</h3>
            <p className="text-white/70">
              Select the plan you want to upgrade to and click the "Select Plan" button. You'll be redirected to our secure payment page to complete your purchase.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium text-white mb-2">Can I downgrade my subscription?</h3>
            <p className="text-white/70">
              Yes, you can downgrade your subscription at any time. Your current plan benefits will remain active until the end of your billing period.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium text-white mb-2">How do I cancel my subscription?</h3>
            <p className="text-white/70">
              You can cancel your subscription by clicking the "Manage Subscription" button and selecting the cancel option. Your subscription will remain active until the end of your current billing period.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium text-white mb-2">What payment methods do you accept?</h3>
            <p className="text-white/70">
              We accept all major credit cards, including Visa, Mastercard, American Express, and Discover.
            </p>
          </div>
        </div>
      </div>

      {/* Need Help */}
      <div className="glass-effect rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Need Help?</h2>
            <p className="text-white/70">
              If you have any questions about your subscription, please contact our support team.
            </p>
          </div>
          <a
            href="mailto:support@nichespark.com"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-white text-purple-600 rounded-lg font-medium hover:bg-white/90 transition-colors"
          >
            <span>Contact Support</span>
            <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default Subscription;

