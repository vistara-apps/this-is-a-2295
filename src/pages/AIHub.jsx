import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  BarChart, 
  Lightbulb, 
  Target, 
  Rocket,
  Download,
  Share,
  Loader,
  PlusCircle,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { aiService } from '../services/aiService';
import { subscriptionService } from '../services/subscriptionService';
import AIChat from '../components/AIChat';
import AIPromptSuggestions from '../components/AIPromptSuggestions';

function AIHub() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('business');
  const [businessIdea, setBusinessIdea] = useState('');
  const [marketAnalysis, setMarketAnalysis] = useState(null);
  const [actionPlan, setActionPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savedResponses, setSavedResponses] = useState([]);
  const [showSavedResponseForm, setShowSavedResponseForm] = useState(false);
  const [responseTitle, setResponseTitle] = useState('');
  const [responseToSave, setResponseToSave] = useState('');

  // Check if user has access to advanced AI features
  const hasAdvancedAccess = user?.subscription === 'pro';
  const hasBasicAccess = user?.subscription === 'premium' || user?.subscription === 'pro';

  const handleGenerateAnalysis = async () => {
    if (!businessIdea.trim()) return;
    
    // Check if user has access to this feature
    if (!subscriptionService.hasAccess(user?.subscription || 'free', 'ai_enhanced')) {
      setError('You need to upgrade to Premium or Pro to access this feature.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const analysis = await aiService.generateMarketAnalysis(businessIdea);
      setMarketAnalysis(analysis);
    } catch (err) {
      console.error('AI generation error:', err);
      setError('Failed to generate market analysis. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateActionPlan = async () => {
    if (!businessIdea.trim()) return;
    
    // Check if user has access to this feature
    if (!subscriptionService.hasAccess(user?.subscription || 'free', 'ai_advanced')) {
      setError('You need to upgrade to Pro to access this feature.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const plan = await aiService.generateActionPlan(businessIdea);
      setActionPlan(plan);
    } catch (err) {
      console.error('AI generation error:', err);
      setError('Failed to generate action plan. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveResponse = (content) => {
    setResponseToSave(content);
    setResponseTitle('');
    setShowSavedResponseForm(true);
  };

  const handleSaveResponseSubmit = (e) => {
    e.preventDefault();
    
    if (!responseTitle.trim()) return;
    
    const newResponse = {
      id: Date.now().toString(),
      title: responseTitle,
      content: responseToSave,
      date: new Date().toISOString()
    };
    
    setSavedResponses(prev => [newResponse, ...prev]);
    setShowSavedResponseForm(false);
  };

  const handleDeleteSavedResponse = (id) => {
    setSavedResponses(prev => prev.filter(response => response.id !== id));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">AI Business Hub</h1>
        <p className="text-white/70 mt-1">Get AI-powered insights and assistance for your startup ideas</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        <button
          onClick={() => setActiveTab('business')}
          className={`px-4 py-3 font-medium text-sm border-b-2 ${
            activeTab === 'business'
              ? 'border-white text-white'
              : 'border-transparent text-white/60 hover:text-white'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>Business Assistant</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('analysis')}
          className={`px-4 py-3 font-medium text-sm border-b-2 ${
            activeTab === 'analysis'
              ? 'border-white text-white'
              : 'border-transparent text-white/60 hover:text-white'
          }`}
        >
          <div className="flex items-center space-x-2">
            <BarChart className="h-5 w-5" />
            <span>Market Analysis</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('action')}
          className={`px-4 py-3 font-medium text-sm border-b-2 ${
            activeTab === 'action'
              ? 'border-white text-white'
              : 'border-transparent text-white/60 hover:text-white'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Action Plan</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`px-4 py-3 font-medium text-sm border-b-2 ${
            activeTab === 'saved'
              ? 'border-white text-white'
              : 'border-transparent text-white/60 hover:text-white'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Saved Responses</span>
          </div>
        </button>
      </div>

      {/* Business Assistant Tab */}
      {activeTab === 'business' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AIChat 
              category="business" 
              onSaveResponse={handleSaveResponse} 
            />
          </div>
          <div className="lg:col-span-1">
            <div className="glass-effect rounded-xl p-5">
              <h2 className="text-xl font-semibold text-white mb-4">How It Works</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-white">Describe Your Idea</h3>
                    <p className="text-white/70 text-sm">
                      Share your business concept or startup idea with our AI assistant.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-white">Get Feedback</h3>
                    <p className="text-white/70 text-sm">
                      Receive constructive feedback, suggestions, and insights to refine your idea.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-white">Explore Further</h3>
                    <p className="text-white/70 text-sm">
                      Use the Market Analysis and Action Plan tabs for deeper insights.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Market Analysis Tab */}
      {activeTab === 'analysis' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="glass-effect rounded-xl p-5 space-y-4">
              <h2 className="text-xl font-semibold text-white mb-2">Market Analysis</h2>
              <p className="text-white/70">
                Get a comprehensive market analysis for your business idea, including target market, competitors, and opportunities.
              </p>
              
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Your Business Idea
                </label>
                <textarea
                  value={businessIdea}
                  onChange={(e) => setBusinessIdea(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:border-white/40 focus:outline-none h-32 resize-none"
                  placeholder="Describe your business idea in detail..."
                />
              </div>
              
              <button
                onClick={handleGenerateAnalysis}
                disabled={!businessIdea.trim() || loading || !hasBasicAccess}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  hasBasicAccess
                    ? 'bg-white text-purple-600 hover:bg-white/90'
                    : 'bg-white/20 text-white/60 cursor-not-allowed'
                } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader className="h-5 w-5 animate-spin" />
                    <span>Generating...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <BarChart className="h-5 w-5" />
                    <span>Generate Analysis</span>
                  </div>
                )}
              </button>
              
              {!hasBasicAccess && (
                <div className="text-sm text-white/70 text-center">
                  <span>Upgrade to Premium or Pro to access this feature</span>
                </div>
              )}
              
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-white">
                  {error}
                </div>
              )}
            </div>
          </div>
          
          <div className="lg:col-span-2">
            {marketAnalysis ? (
              <div className="glass-effect rounded-xl p-5 space-y-6">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-semibold text-white">Analysis Results</h2>
                  <button
                    onClick={() => handleSaveResponse(JSON.stringify(marketAnalysis, null, 2))}
                    className="p-2 text-white/70 hover:text-white"
                  >
                    <Download className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">Target Market</h3>
                    <p className="text-white/90 whitespace-pre-line">{marketAnalysis.targetMarket}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">Market Size</h3>
                    <p className="text-white/90 whitespace-pre-line">{marketAnalysis.marketSize}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">Competitors</h3>
                    <p className="text-white/90 whitespace-pre-line">{marketAnalysis.competitors}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">Differentiation</h3>
                    <p className="text-white/90 whitespace-pre-line">{marketAnalysis.differentiation}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">Challenges</h3>
                    <p className="text-white/90 whitespace-pre-line">{marketAnalysis.challenges}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">Opportunities</h3>
                    <p className="text-white/90 whitespace-pre-line">{marketAnalysis.opportunities}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-effect rounded-xl p-8 text-center h-full flex flex-col items-center justify-center">
                <BarChart className="h-16 w-16 text-white/40 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Market Analysis</h3>
                <p className="text-white/70 mb-4 max-w-md">
                  Enter your business idea and generate a comprehensive market analysis to understand your target market, competitors, and opportunities.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Plan Tab */}
      {activeTab === 'action' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="glass-effect rounded-xl p-5 space-y-4">
              <h2 className="text-xl font-semibold text-white mb-2">Action Plan</h2>
              <p className="text-white/70">
                Get a detailed action plan with concrete steps to implement your business idea.
              </p>
              
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Your Business Idea
                </label>
                <textarea
                  value={businessIdea}
                  onChange={(e) => setBusinessIdea(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:border-white/40 focus:outline-none h-32 resize-none"
                  placeholder="Describe your business idea in detail..."
                />
              </div>
              
              <button
                onClick={handleGenerateActionPlan}
                disabled={!businessIdea.trim() || loading || !hasAdvancedAccess}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  hasAdvancedAccess
                    ? 'bg-white text-purple-600 hover:bg-white/90'
                    : 'bg-white/20 text-white/60 cursor-not-allowed'
                } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader className="h-5 w-5 animate-spin" />
                    <span>Generating...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>Generate Plan</span>
                  </div>
                )}
              </button>
              
              {!hasAdvancedAccess && (
                <div className="text-sm text-white/70 text-center">
                  <span>Upgrade to Pro to access this feature</span>
                </div>
              )}
              
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-white">
                  {error}
                </div>
              )}
            </div>
          </div>
          
          <div className="lg:col-span-2">
            {actionPlan ? (
              <div className="glass-effect rounded-xl p-5 space-y-6">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-semibold text-white">Action Plan</h2>
                  <button
                    onClick={() => handleSaveResponse(JSON.stringify(actionPlan, null, 2))}
                    className="p-2 text-white/70 hover:text-white"
                  >
                    <Download className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-white mb-3">Immediate Next Steps</h3>
                    <ul className="space-y-2">
                      {actionPlan.immediateNextSteps.map((step, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-sm">{index + 1}</span>
                          </div>
                          <p className="text-white/90">{step}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-white mb-3">Short-term Goals (1-3 months)</h3>
                    <ul className="space-y-2">
                      {actionPlan.shortTermGoals.map((goal, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-sm">{index + 1}</span>
                          </div>
                          <p className="text-white/90">{goal}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-white mb-3">Medium-term Goals (3-12 months)</h3>
                    <ul className="space-y-2">
                      {actionPlan.mediumTermGoals.map((goal, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-sm">{index + 1}</span>
                          </div>
                          <p className="text-white/90">{goal}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-white mb-3">Resource Requirements</h3>
                    <ul className="space-y-2">
                      {actionPlan.resourceRequirements.map((resource, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-sm">{index + 1}</span>
                          </div>
                          <p className="text-white/90">{resource}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-white mb-3">Key Performance Indicators</h3>
                    <ul className="space-y-2">
                      {actionPlan.keyPerformanceIndicators.map((kpi, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-sm">{index + 1}</span>
                          </div>
                          <p className="text-white/90">{kpi}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-effect rounded-xl p-8 text-center h-full flex flex-col items-center justify-center">
                <Target className="h-16 w-16 text-white/40 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Action Plan</h3>
                <p className="text-white/70 mb-4 max-w-md">
                  Enter your business idea and generate a detailed action plan with concrete steps to implement your idea.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Saved Responses Tab */}
      {activeTab === 'saved' && (
        <div>
          {savedResponses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedResponses.map((response) => (
                <div key={response.id} className="glass-effect rounded-xl overflow-hidden">
                  <div className="p-5 border-b border-white/10">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold text-white">{response.title}</h3>
                      <button
                        onClick={() => handleDeleteSavedResponse(response.id)}
                        className="p-1 text-white/60 hover:text-white"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="text-sm text-white/70 mt-1">
                      {formatDate(response.date)}
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="max-h-40 overflow-y-auto text-white/90 mb-4">
                      {response.content.length > 300
                        ? `${response.content.substring(0, 300)}...`
                        : response.content}
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(response.content);
                        }}
                        className="px-3 py-1 text-sm bg-white/10 hover:bg-white/20 text-white rounded-md"
                      >
                        <div className="flex items-center space-x-1">
                          <Share className="h-4 w-4" />
                          <span>Copy</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-effect rounded-xl p-8 text-center">
              <Download className="h-16 w-16 text-white/40 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No saved responses</h3>
              <p className="text-white/70 mb-4">
                You haven't saved any AI responses yet. Use the "Save" button when viewing responses to save them here.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Save Response Form Modal */}
      {showSavedResponseForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="glass-effect rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Save Response</h2>
              <button
                onClick={() => setShowSavedResponseForm(false)}
                className="p-1 text-white/60 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSaveResponseSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={responseTitle}
                  onChange={(e) => setResponseTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:border-white/40 focus:outline-none"
                  placeholder="Enter a title for this response"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Content Preview
                </label>
                <div className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white/90 h-32 overflow-y-auto">
                  {responseToSave.length > 300
                    ? `${responseToSave.substring(0, 300)}...`
                    : responseToSave}
                </div>
              </div>
              
              <div className="flex space-x-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-white text-purple-600 py-2 rounded-lg font-medium hover:bg-white/90 transition-colors"
                >
                  Save Response
                </button>
                <button
                  type="button"
                  onClick={() => setShowSavedResponseForm(false)}
                  className="flex-1 bg-white/10 text-white py-2 rounded-lg font-medium hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AIHub;

