import React, { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { 
  Brain, 
  Lightbulb, 
  Rocket, 
  Star, 
  Send, 
  Loader, 
  Lock,
  Crown,
  Zap
} from 'lucide-react';
import { usePaymentContext } from '../hooks/usePaymentContext';
import { useAuth } from '../contexts/AuthContext';

function AIHub() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [paidAccess, setPaidAccess] = useState(false);
  const { createSession } = usePaymentContext();
  const { user } = useAuth();

  const handlePayment = async () => {
    try {
      await createSession();
      setPaidAccess(true);
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  const handleAIGenerate = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    try {
      // Simulate AI response for demo
      setTimeout(() => {
        setResponse(`Based on your idea "${prompt}", here are some refined suggestions:

1. **Market Analysis**: Consider researching the target demographic and their pain points more deeply.

2. **Technical Implementation**: Think about the MVP features that would validate your core hypothesis.

3. **Business Model**: Explore subscription, freemium, or usage-based pricing models.

4. **Competition**: Analyze existing solutions and identify your unique value proposition.

5. **Next Steps**: 
   - Create a simple landing page to gauge interest
   - Build a basic prototype
   - Interview potential customers
   - Seek feedback from mentors in your niche

Would you like me to dive deeper into any of these areas?`);
        setLoading(false);
      }, 2000);
    } catch (error) {
      console.error('AI generation error:', error);
      setLoading(false);
    }
  };

  const promptSuggestions = [
    "I want to build an AI tool that helps students study more effectively...",
    "My startup idea involves using machine learning for healthcare diagnostics...",
    "I'm thinking about creating a platform that connects researchers...",
    "What if we used AI to automate customer service for small businesses..."
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Brain className="h-12 w-12 text-white" />
          <h1 className="text-4xl font-bold text-white">AI Business Hub</h1>
        </div>
        <p className="text-xl text-white/80">
          Transform your ideas into actionable startup plans with AI assistance
        </p>
      </div>

      {/* Subscription Status */}
      <div className="glass-effect rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Crown className="h-6 w-6 text-yellow-400" />
            <div>
              <h3 className="font-semibold text-white">Premium AI Features</h3>
              <p className="text-sm text-white/70">
                {user?.subscription === 'pro' || paidAccess
                  ? 'You have access to premium AI tools'
                  : 'Unlock advanced AI business building tools'
                }
              </p>
            </div>
          </div>
          {user?.subscription !== 'pro' && !paidAccess && (
            <div className="flex items-center space-x-4">
              <ConnectButton />
              <button
                onClick={handlePayment}
                className="px-4 py-2 bg-yellow-500 text-black rounded-lg font-medium hover:bg-yellow-400 transition-colors"
              >
                Unlock for $0.001
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-effect rounded-xl p-6 text-center">
          <Lightbulb className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Idea Refinement</h3>
          <p className="text-white/70 text-sm">
            Get AI-powered feedback and suggestions to improve your startup concepts
          </p>
        </div>
        
        <div className="glass-effect rounded-xl p-6 text-center">
          <Rocket className="h-12 w-12 text-blue-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Market Analysis</h3>
          <p className="text-white/70 text-sm">
            Receive insights about market opportunities and competitive landscape
          </p>
        </div>
        
        <div className="glass-effect rounded-xl p-6 text-center">
          <Star className="h-12 w-12 text-purple-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Action Plans</h3>
          <p className="text-white/70 text-sm">
            Get step-by-step roadmaps to turn your ideas into reality
          </p>
        </div>
      </div>

      {/* AI Chat Interface */}
      <div className="glass-effect rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
          <Zap className="h-5 w-5" />
          <span>AI Business Assistant</span>
        </h2>
        
        {user?.subscription !== 'pro' && !paidAccess ? (
          <div className="text-center py-12 border-2 border-dashed border-white/20 rounded-lg">
            <Lock className="h-16 w-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Premium Feature</h3>
            <p className="text-white/70 mb-4">
              Connect your wallet and make a micro-payment to access AI business tools
            </p>
            <div className="flex items-center justify-center space-x-4">
              <ConnectButton />
              <button
                onClick={handlePayment}
                className="px-6 py-3 bg-yellow-500 text-black rounded-lg font-medium hover:bg-yellow-400 transition-colors"
              >
                Unlock for $0.001
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Prompt Suggestions */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-white/90">Try these prompts:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {promptSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setPrompt(suggestion)}
                    className="text-left p-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Area */}
            <div className="space-y-4">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your startup idea or ask for business advice..."
                className="w-full h-24 px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:border-white/40 focus:outline-none resize-none"
              />
              
              <button
                onClick={handleAIGenerate}
                disabled={loading || !prompt.trim()}
                className="w-full flex items-center justify-center space-x-2 py-3 bg-white text-purple-600 rounded-lg font-medium hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span>Get AI Feedback</span>
                  </>
                )}
              </button>
            </div>

            {/* Response Area */}
            {response && (
              <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-lg">
                <h3 className="font-semibold text-white mb-3 flex items-center space-x-2">
                  <Brain className="h-5 w-5" />
                  <span>AI Response</span>
                </h3>
                <div className="text-white/80 whitespace-pre-line">
                  {response}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Success Stories */}
      <div className="glass-effect rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Success Stories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">JS</span>
              </div>
              <span className="font-medium text-white">Jessica Chen</span>
            </div>
            <p className="text-white/70 text-sm">
              "The AI helped me refine my edtech startup idea. Now we have 1000+ users!"
            </p>
          </div>
          
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">MR</span>
              </div>
              <span className="font-medium text-white">Marcus Rodriguez</span>
            </div>
            <p className="text-white/70 text-sm">
              "Got amazing market insights that helped secure our first round of funding."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIHub;