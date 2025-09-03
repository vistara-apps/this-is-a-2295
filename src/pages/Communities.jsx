import React, { useState } from 'react';
import { Plus, Search, Filter, Users, TrendingUp } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import CommunityCard from '../components/CommunityCard';

function Communities() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const { communities, createCommunity, joinCommunity } = useData();
  const { user } = useAuth();

  const [newCommunity, setNewCommunity] = useState({
    name: '',
    description: '',
    topic: '',
    tags: ''
  });

  const filteredCommunities = communities.filter(community => {
    const matchesSearch = community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         community.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'joined') {
      return matchesSearch && community.members.includes(user?.userId);
    }
    if (filter === 'trending') {
      return matchesSearch && community.memberCount > 100;
    }
    return matchesSearch;
  });

  const handleCreateCommunity = (e) => {
    e.preventDefault();
    const communityData = {
      ...newCommunity,
      createdBy: user.userId,
      tags: newCommunity.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    };
    
    createCommunity(communityData);
    setNewCommunity({ name: '', description: '', topic: '', tags: '' });
    setShowCreateForm(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Communities</h1>
          <p className="text-white/70 mt-1">Discover and join niche academic communities</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-white text-purple-600 rounded-lg font-medium hover:bg-white/90 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Create Community</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search communities..."
            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:border-white/40 focus:outline-none"
          />
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-white text-purple-600' 
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('joined')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'joined' 
                ? 'bg-white text-purple-600' 
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Joined
          </button>
          <button
            onClick={() => setFilter('trending')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'trending' 
                ? 'bg-white text-purple-600' 
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Trending
          </button>
        </div>
      </div>

      {/* Create Community Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="glass-effect rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Create New Community</h2>
            <form onSubmit={handleCreateCommunity} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Community Name
                </label>
                <input
                  type="text"
                  value={newCommunity.name}
                  onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:border-white/40 focus:outline-none"
                  placeholder="e.g., Quantum Computing"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Description
                </label>
                <textarea
                  value={newCommunity.description}
                  onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:border-white/40 focus:outline-none h-20 resize-none"
                  placeholder="Describe your community..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Topic Category
                </label>
                <input
                  type="text"
                  value={newCommunity.topic}
                  onChange={(e) => setNewCommunity({ ...newCommunity, topic: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:border-white/40 focus:outline-none"
                  placeholder="e.g., Computer Science, Biology"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={newCommunity.tags}
                  onChange={(e) => setNewCommunity({ ...newCommunity, tags: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:border-white/40 focus:outline-none"
                  placeholder="e.g., quantum, physics, research"
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-white text-purple-600 py-2 rounded-lg font-medium hover:bg-white/90 transition-colors"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 bg-white/10 text-white py-2 rounded-lg font-medium hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Communities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCommunities.map((community) => (
          <CommunityCard key={community.communityId} community={community} />
        ))}
      </div>

      {filteredCommunities.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-white/40 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No communities found</h3>
          <p className="text-white/70 mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'Be the first to create a community!'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-white text-purple-600 rounded-lg font-medium hover:bg-white/90 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Create Community</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default Communities;