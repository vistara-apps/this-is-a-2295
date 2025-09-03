import React from 'react';
import { Filter, X } from 'lucide-react';

/**
 * ResourceFilter component for filtering resources
 * 
 * @param {Object} props
 * @param {Object} props.filters - Current filter values
 * @param {Function} props.onFilterChange - Callback for filter changes
 * @param {Array} props.topics - Available topics
 * @param {Array} props.types - Available resource types
 * @param {Array} props.difficulties - Available difficulty levels
 */
function ResourceFilter({ 
  filters, 
  onFilterChange, 
  topics = [], 
  types = [], 
  difficulties = [] 
}) {
  const handleFilterChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      topic: '',
      type: '',
      difficulty: '',
      searchTerm: filters.searchTerm || ''
    });
  };

  const hasActiveFilters = filters.topic || filters.type || filters.difficulty;

  return (
    <div className="glass-effect rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-white" />
          <h3 className="font-semibold text-white">Filters</h3>
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center space-x-1 text-sm text-white/70 hover:text-white"
          >
            <X className="h-4 w-4" />
            <span>Clear all</span>
          </button>
        )}
      </div>
      
      {/* Topic Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-white/70 mb-2">
          Topic
        </label>
        <select
          value={filters.topic || ''}
          onChange={(e) => handleFilterChange('topic', e.target.value)}
          className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:border-white/40 focus:outline-none"
        >
          <option value="">All Topics</option>
          {topics.map((topic, index) => (
            <option key={index} value={topic}>
              {topic}
            </option>
          ))}
        </select>
      </div>
      
      {/* Type Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-white/70 mb-2">
          Resource Type
        </label>
        <select
          value={filters.type || ''}
          onChange={(e) => handleFilterChange('type', e.target.value)}
          className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:border-white/40 focus:outline-none"
        >
          <option value="">All Types</option>
          {types.map((type, index) => (
            <option key={index} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
      </div>
      
      {/* Difficulty Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-white/70 mb-2">
          Difficulty
        </label>
        <select
          value={filters.difficulty || ''}
          onChange={(e) => handleFilterChange('difficulty', e.target.value)}
          className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:border-white/40 focus:outline-none"
        >
          <option value="">All Levels</option>
          {difficulties.map((difficulty, index) => (
            <option key={index} value={difficulty}>
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </option>
          ))}
        </select>
      </div>
      
      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="mt-4">
          <div className="text-sm font-medium text-white/70 mb-2">Active Filters:</div>
          <div className="flex flex-wrap gap-2">
            {filters.topic && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-white/10 rounded-full text-xs text-white">
                <span>Topic: {filters.topic}</span>
                <button
                  onClick={() => handleFilterChange('topic', '')}
                  className="text-white/70 hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            
            {filters.type && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-white/10 rounded-full text-xs text-white">
                <span>Type: {filters.type}</span>
                <button
                  onClick={() => handleFilterChange('type', '')}
                  className="text-white/70 hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            
            {filters.difficulty && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-white/10 rounded-full text-xs text-white">
                <span>Difficulty: {filters.difficulty}</span>
                <button
                  onClick={() => handleFilterChange('difficulty', '')}
                  className="text-white/70 hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ResourceFilter;

