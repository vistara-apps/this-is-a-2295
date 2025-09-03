import React, { useState, useEffect } from 'react';
import { 
  Search, 
  BookOpen, 
  PlusCircle, 
  Bookmark, 
  Sparkles,
  Loader,
  ExternalLink,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { resourceService } from '../services/resourceService';
import ResourceCard from '../components/ResourceCard';
import ResourceFilter from '../components/ResourceFilter';
import { subscriptionService } from '../services/subscriptionService';

function Resources() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [resources, setResources] = useState([]);
  const [bookmarkedResources, setBookmarkedResources] = useState([]);
  const [recommendedResources, setRecommendedResources] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    topic: '',
    type: '',
    difficulty: '',
    searchTerm: ''
  });
  const [loading, setLoading] = useState(true);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [upvotedIds, setUpvotedIds] = useState(new Set());
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [resourceFormData, setResourceFormData] = useState({
    title: '',
    description: '',
    url: '',
    type: 'article',
    topics: [],
    difficulty: 'beginner',
    timeCommitment: ''
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Resource types and difficulty levels
  const resourceTypes = resourceService.getResourceTypes();
  const difficultyLevels = resourceService.getDifficultyLevels();

  // Fetch resources
  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        
        if (activeTab === 'all') {
          // Fetch all resources with filters
          const { resources: resourcesList, totalCount } = await resourceService.getResources({
            page,
            limit: 9,
            topic: filters.topic,
            type: filters.type,
            difficulty: filters.difficulty,
            searchTerm: filters.searchTerm || searchTerm
          });
          
          setResources(resourcesList);
          setTotalPages(Math.ceil(totalCount / 9));
        } else if (activeTab === 'bookmarked') {
          // Fetch bookmarked resources
          const { resources: bookmarkedList } = await resourceService.getBookmarkedResources(user.userId, { page, limit: 9 });
          setBookmarkedResources(bookmarkedList);
        } else if (activeTab === 'recommended') {
          // Fetch recommended resources
          if (!recommendedResources) {
            const recommendations = await resourceService.getRecommendedResources(user.userId);
            setRecommendedResources(recommendations);
          }
        }
        
        // Get bookmarked and upvoted resource IDs
        if (resources.length > 0) {
          const bookmarkedPromises = resources.map(resource => 
            resourceService.hasBookmarked(resource.resourceId, user.userId)
          );
          
          const upvotedPromises = resources.map(resource => 
            resourceService.hasUpvoted(resource.resourceId, user.userId)
          );
          
          const bookmarkedResults = await Promise.all(bookmarkedPromises);
          const upvotedResults = await Promise.all(upvotedPromises);
          
          const bookmarkedSet = new Set();
          const upvotedSet = new Set();
          
          resources.forEach((resource, index) => {
            if (bookmarkedResults[index]) {
              bookmarkedSet.add(resource.resourceId);
            }
            
            if (upvotedResults[index]) {
              upvotedSet.add(resource.resourceId);
            }
          });
          
          setBookmarkedIds(bookmarkedSet);
          setUpvotedIds(upvotedSet);
        }
      } catch (error) {
        console.error('Error fetching resources:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchResources();
    }
  }, [activeTab, user, page, filters, searchTerm]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, searchTerm }));
    setPage(1);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleBookmark = async (resourceId) => {
    try {
      if (bookmarkedIds.has(resourceId)) {
        await resourceService.removeBookmark(resourceId, user.userId);
        setBookmarkedIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(resourceId);
          return newSet;
        });
      } else {
        await resourceService.bookmarkResource(resourceId, user.userId);
        setBookmarkedIds(prev => new Set([...prev, resourceId]));
      }
      
      // Refresh bookmarked resources if on bookmarked tab
      if (activeTab === 'bookmarked') {
        const { resources: bookmarkedList } = await resourceService.getBookmarkedResources(user.userId, { page, limit: 9 });
        setBookmarkedResources(bookmarkedList);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const handleUpvote = async (resourceId) => {
    try {
      if (upvotedIds.has(resourceId)) {
        await resourceService.removeUpvote(resourceId, user.userId);
        setUpvotedIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(resourceId);
          return newSet;
        });
      } else {
        await resourceService.upvoteResource(resourceId, user.userId);
        setUpvotedIds(prev => new Set([...prev, resourceId]));
      }
      
      // Update resource upvote count in the UI
      const updatedResources = resources.map(resource => {
        if (resource.resourceId === resourceId) {
          return {
            ...resource,
            upvotes: upvotedIds.has(resourceId) 
              ? Math.max(0, resource.upvotes - 1) 
              : resource.upvotes + 1
          };
        }
        return resource;
      });
      
      setResources(updatedResources);
    } catch (error) {
      console.error('Error toggling upvote:', error);
    }
  };

  const handleResourceSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const newResource = await resourceService.createResource({
        ...resourceFormData,
        createdBy: user.userId
      });
      
      // Add new resource to the list
      setResources(prev => [newResource, ...prev]);
      
      // Reset form
      setResourceFormData({
        title: '',
        description: '',
        url: '',
        type: 'article',
        topics: [],
        difficulty: 'beginner',
        timeCommitment: ''
      });
      
      setShowResourceForm(false);
    } catch (error) {
      console.error('Error creating resource:', error);
    }
  };

  const handleTopicChange = (e) => {
    const topics = e.target.value.split(',').map(topic => topic.trim()).filter(Boolean);
    setResourceFormData(prev => ({ ...prev, topics }));
  };

  // Check if user has access to resource creation
  const canCreateResources = subscriptionService.hasAccess(
    user?.subscription || 'free',
    'resources_premium'
  );

  // Get resources to display based on active tab
  const getDisplayResources = () => {
    if (activeTab === 'all') {
      return resources;
    } else if (activeTab === 'bookmarked') {
      return bookmarkedResources;
    } else if (activeTab === 'recommended') {
      return [];
    }
    return [];
  };

  const displayResources = getDisplayResources();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Learning Resources</h1>
          <p className="text-white/70 mt-1">Discover resources to build your skills</p>
        </div>
        
        <button
          onClick={() => setShowResourceForm(true)}
          disabled={!canCreateResources}
          className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg font-medium ${
            canCreateResources
              ? 'bg-white text-purple-600 hover:bg-white/90'
              : 'bg-white/20 text-white/60 cursor-not-allowed'
          } transition-colors`}
        >
          <PlusCircle className="h-5 w-5" />
          <span>Add Resource</span>
        </button>
      </div>

      {/* Resource Form Modal */}
      {showResourceForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="glass-effect rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Add Learning Resource</h2>
              <button
                onClick={() => setShowResourceForm(false)}
                className="p-1 text-white/60 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleResourceSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={resourceFormData.title}
                  onChange={(e) => setResourceFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:border-white/40 focus:outline-none"
                  placeholder="e.g., Introduction to Machine Learning"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Description
                </label>
                <textarea
                  value={resourceFormData.description}
                  onChange={(e) => setResourceFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:border-white/40 focus:outline-none h-24 resize-none"
                  placeholder="Briefly describe the resource..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  URL
                </label>
                <input
                  type="url"
                  value={resourceFormData.url}
                  onChange={(e) => setResourceFormData(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:border-white/40 focus:outline-none"
                  placeholder="https://example.com/resource"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    Type
                  </label>
                  <select
                    value={resourceFormData.type}
                    onChange={(e) => setResourceFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-white/40 focus:outline-none"
                    required
                  >
                    {resourceTypes.map((type, index) => (
                      <option key={index} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={resourceFormData.difficulty}
                    onChange={(e) => setResourceFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-white/40 focus:outline-none"
                    required
                  >
                    {difficultyLevels.map((level, index) => (
                      <option key={index} value={level}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Topics (comma-separated)
                </label>
                <input
                  type="text"
                  value={resourceFormData.topics.join(', ')}
                  onChange={handleTopicChange}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:border-white/40 focus:outline-none"
                  placeholder="e.g., Machine Learning, Python, Data Science"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Time Commitment
                </label>
                <input
                  type="text"
                  value={resourceFormData.timeCommitment}
                  onChange={(e) => setResourceFormData(prev => ({ ...prev, timeCommitment: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:border-white/40 focus:outline-none"
                  placeholder="e.g., 2 hours, 4 weeks, 10-15 minutes"
                />
              </div>
              
              <div className="flex space-x-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-white text-purple-600 py-2 rounded-lg font-medium hover:bg-white/90 transition-colors"
                >
                  Add Resource
                </button>
                <button
                  type="button"
                  onClick={() => setShowResourceForm(false)}
                  className="flex-1 bg-white/10 text-white py-2 rounded-lg font-medium hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabs and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-3 font-medium text-sm border-b-2 ${
              activeTab === 'all'
                ? 'border-white text-white'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            All Resources
          </button>
          <button
            onClick={() => setActiveTab('bookmarked')}
            className={`px-4 py-3 font-medium text-sm border-b-2 ${
              activeTab === 'bookmarked'
                ? 'border-white text-white'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Bookmark className="h-4 w-4" />
              <span>Bookmarked</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('recommended')}
            className={`px-4 py-3 font-medium text-sm border-b-2 ${
              activeTab === 'recommended'
                ? 'border-white text-white'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4" />
              <span>Recommended</span>
            </div>
          </button>
        </div>
        
        <div className="flex-1">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search resources..."
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:border-white/40 focus:outline-none"
            />
          </form>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <ResourceFilter
            filters={filters}
            onFilterChange={handleFilterChange}
            topics={[...new Set(resources.flatMap(r => r.topics || []))]}
            types={resourceTypes}
            difficulties={difficultyLevels}
          />
        </div>
        
        {/* Resources Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="text-center py-12">
              <Loader className="h-8 w-8 text-white/60 mx-auto animate-spin mb-4" />
              <p className="text-white/70">Loading resources...</p>
            </div>
          ) : activeTab === 'recommended' ? (
            <div>
              {recommendedResources ? (
                <div className="space-y-6">
                  {Object.entries(recommendedResources.resources).map(([category, categoryResources]) => (
                    <div key={category}>
                      <h2 className="text-xl font-semibold text-white mb-4">{category}</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {categoryResources.map((resource, index) => (
                          <div key={index} className="glass-effect rounded-xl p-4">
                            <h3 className="text-lg font-semibold text-white mb-2">{resource.title}</h3>
                            <p className="text-white/80 mb-3">{resource.description}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2 text-sm text-white/70">
                                <BookOpen className="h-4 w-4" />
                                <span>{resource.type}</span>
                              </div>
                              <a
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-1 text-sm text-white hover:text-white/80"
                              >
                                <ExternalLink className="h-4 w-4" />
                                <span>View</span>
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Sparkles className="h-16 w-16 text-white/40 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Generating recommendations...</h3>
                  <p className="text-white/70 mb-4">
                    We're personalizing resource recommendations based on your interests
                  </p>
                </div>
              )}
            </div>
          ) : displayResources.length > 0 ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {displayResources.map((resource) => (
                  <ResourceCard
                    key={resource.resourceId}
                    resource={resource}
                    isBookmarked={bookmarkedIds.has(resource.resourceId)}
                    isUpvoted={upvotedIds.has(resource.resourceId)}
                    onBookmark={handleBookmark}
                    onUpvote={handleUpvote}
                  />
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center space-x-2 mt-8">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <div className="flex items-center px-4 text-white">
                    Page {page} of {totalPages}
                  </div>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-white/40 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No resources found</h3>
              <p className="text-white/70 mb-4">
                {activeTab === 'all'
                  ? 'Try adjusting your search or filters'
                  : activeTab === 'bookmarked'
                  ? 'You haven\'t bookmarked any resources yet'
                  : 'No recommended resources available'}
              </p>
              {activeTab === 'bookmarked' && (
                <button
                  onClick={() => setActiveTab('all')}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-white text-purple-600 rounded-lg font-medium hover:bg-white/90 transition-colors"
                >
                  <Search className="h-5 w-5" />
                  <span>Browse Resources</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Resources;

