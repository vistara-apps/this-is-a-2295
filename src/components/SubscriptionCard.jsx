import React from 'react';
import { Check, X } from 'lucide-react';

/**
 * SubscriptionCard component for displaying subscription tier information
 * 
 * @param {Object} props
 * @param {Object} props.tier - Subscription tier data
 * @param {string} props.currentTier - Current subscription tier
 * @param {Function} props.onSelect - Callback for selecting a tier
 * @param {boolean} props.isLoading - Whether the component is in loading state
 */
function SubscriptionCard({ tier, currentTier, onSelect, isLoading = false }) {
  const isCurrentTier = currentTier === tier.id;
  
  return (
    <div className={`glass-effect rounded-xl overflow-hidden ${
      isCurrentTier ? 'border-2 border-white' : 'border border-white/20'
    }`}>
      {/* Header */}
      <div className="p-5 border-b border-white/10">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">{tier.name}</h3>
          {isCurrentTier && (
            <span className="px-3 py-1 bg-white text-purple-600 rounded-full text-xs font-medium">
              Current Plan
            </span>
          )}
        </div>
        <p className="text-white/70 mt-1">{tier.description}</p>
      </div>

      {/* Pricing */}
      <div className="p-5 border-b border-white/10 text-center">
        <div className="text-3xl font-bold text-white">
          {tier.price === 0 ? 'Free' : `$${tier.price}`}
          {tier.interval && <span className="text-lg font-normal text-white/70">/{tier.interval}</span>}
        </div>
      </div>

      {/* Features */}
      <div className="p-5 border-b border-white/10">
        <h4 className="text-sm font-medium text-white/70 mb-3">Includes</h4>
        <ul className="space-y-2">
          {tier.features.map((feature, index) => (
            <li key={index} className="flex items-start space-x-2">
              <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
              <span className="text-white/90">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Limitations */}
      {tier.limitations && tier.limitations.length > 0 && (
        <div className="p-5 border-b border-white/10">
          <h4 className="text-sm font-medium text-white/70 mb-3">Limitations</h4>
          <ul className="space-y-2">
            {tier.limitations.map((limitation, index) => (
              <li key={index} className="flex items-start space-x-2">
                <X className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <span className="text-white/70">{limitation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action */}
      <div className="p-5">
        <button
          onClick={() => onSelect(tier.id)}
          disabled={isLoading || isCurrentTier}
          className={`w-full py-3 rounded-lg font-medium transition-colors ${
            isCurrentTier
              ? 'bg-white/20 text-white cursor-not-allowed'
              : 'bg-white text-purple-600 hover:bg-white/90'
          } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Processing...' : isCurrentTier ? 'Current Plan' : 'Select Plan'}
        </button>
      </div>
    </div>
  );
}

export default SubscriptionCard;

