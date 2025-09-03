import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader, Brain, Sparkles, Download, Copy, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { aiService } from '../services/aiService';
import { subscriptionService } from '../services/subscriptionService';
import AIPromptSuggestions from './AIPromptSuggestions';

/**
 * AIChat component for AI-powered chat interface
 * 
 * @param {Object} props
 * @param {string} props.category - Category of AI assistance
 * @param {Function} props.onSaveResponse - Callback for saving a response
 */
function AIChat({ category = 'business', onSaveResponse }) {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  const chatEndRef = useRef(null);

  // Check if user has access to advanced AI features
  const hasAdvancedAccess = user?.subscription === 'pro';
  const hasBasicAccess = user?.subscription === 'premium' || user?.subscription === 'pro';

  // Scroll to bottom of chat when conversation updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  // Reset copied state after 2 seconds
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!prompt.trim()) return;
    
    // Check if user has access to this feature
    const featureAccess = category === 'business' 
      ? (hasAdvancedAccess ? 'ai_advanced' : 'ai_basic')
      : 'ai_basic';
      
    if (!subscriptionService.hasAccess(user?.subscription || 'free', featureAccess)) {
      setError('You need to upgrade your subscription to access this feature.');
      return;
    }
    
    const userMessage = { content: prompt, isUser: true };
    setConversation(prev => [...prev, userMessage]);
    setPrompt('');
    setLoading(true);
    setError(null);
    
    try {
      // Get AI response
      const response = await aiService.generateBusinessFeedback(
        prompt, 
        conversation.map(msg => ({ content: msg.content, isUser: msg.isUser }))
      );
      
      const aiMessage = { content: response, isUser: false };
      setConversation(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('AI generation error:', err);
      setError('Failed to generate AI response. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handlePromptSelect = (selectedPrompt) => {
    setPrompt(selectedPrompt);
  };

  const handleCopyResponse = (content) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
  };

  const handleSaveResponse = (content) => {
    if (onSaveResponse) {
      onSaveResponse(content);
    }
  };

  const handleClearChat = () => {
    setConversation([]);
  };

  return (
    <div className="glass-effect rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-white/10 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Brain className="h-6 w-6 text-white" />
          <h2 className="text-xl font-semibold text-white">AI Assistant</h2>
        </div>
        <button
          onClick={handleClearChat}
          className="px-3 py-1 text-sm bg-white/10 hover:bg-white/20 text-white rounded-md"
        >
          Clear Chat
        </button>
      </div>

      {/* Chat Area */}
      <div className="h-96 overflow-y-auto p-5 space-y-4">
        {conversation.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <Sparkles className="h-12 w-12 text-white/40 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">AI Assistant</h3>
            <p className="text-white/70 mb-6 max-w-md">
              Ask questions about your business idea, get market insights, or request an action plan.
            </p>
            <AIPromptSuggestions 
              onSelectPrompt={handlePromptSelect} 
              category={category} 
            />
          </div>
        ) : (
          <>
            {conversation.map((message, index) => (
              <div 
                key={index} 
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-3/4 rounded-lg p-4 ${
                    message.isUser 
                      ? 'bg-white/10 text-white' 
                      : 'bg-white/20 text-white'
                  }`}
                >
                  {message.isUser ? (
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-white">
                          {user?.username?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-white mb-1">You</div>
                        <div className="text-white/90 whitespace-pre-line">{message.content}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500/30 flex items-center justify-center flex-shrink-0">
                        <Brain className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-medium text-white">AI Assistant</div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleCopyResponse(message.content)}
                              className="p-1 text-white/60 hover:text-white"
                              title="Copy to clipboard"
                            >
                              {copied ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleSaveResponse(message.content)}
                              className="p-1 text-white/60 hover:text-white"
                              title="Save response"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <div className="text-white/90 whitespace-pre-line">{message.content}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="max-w-3/4 bg-white/20 rounded-lg p-4 text-white">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500/30 flex items-center justify-center flex-shrink-0">
                      <Brain className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-white mb-1">AI Assistant</div>
                      <div className="flex items-center space-x-2 text-white/90">
                        <Loader className="h-4 w-4 animate-spin" />
                        <span>Thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-white">
                {error}
              </div>
            )}
            <div ref={chatEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-5 border-t border-white/10">
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask a question or describe your business idea..."
            className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:border-white/40 focus:outline-none"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!prompt.trim() || loading}
            className="px-4 py-3 bg-white text-purple-600 rounded-lg font-medium hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </form>
        
        {!hasBasicAccess && (
          <div className="mt-3 text-sm text-white/70 text-center">
            <span>Upgrade to Premium or Pro for enhanced AI features</span>
          </div>
        )}
        
        {hasBasicAccess && !hasAdvancedAccess && category === 'business' && (
          <div className="mt-3 text-sm text-white/70 text-center">
            <span>Upgrade to Pro for advanced business building tools</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default AIChat;

