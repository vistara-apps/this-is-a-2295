import React from 'react';
import { 
  ExternalLink, 
  ThumbsUp, 
  Bookmark, 
  Clock, 
  BarChart, 
  User,
  BookOpen,
  Video,
  Headphones,
  FileText,
  Tool,
  Users,
  Laptop,
  HelpCircle
} from 'lucide-react';

/**
 * ResourceCard component for displaying resource information
 * 
 * @param {Object} props
 * @param {Object} props.resource - Resource data
 * @param {boolean} props.isBookmarked - Whether the resource is bookmarked
 * @param {boolean} props.isUpvoted - Whether the resource is upvoted
 * @param {Function} props.onBookmark - Callback for bookmarking
 * @param {Function} props.onUpvote - Callback for upvoting
 */
function ResourceCard({ 
  resource, 
  isBookmarked = false, 
  isUpvoted = false, 
  onBookmark, 
  onUpvote 
}) {
  // Get icon based on resource type
  const getTypeIcon = () => {
    switch (resource.type?.toLowerCase()) {
      case 'course':
        return <Laptop className="h-5 w-5" />;
      case 'book':
        return <BookOpen className="h-5 w-5" />;
      case 'article':
        return <FileText className="h-5 w-5" />;
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'podcast':
        return <Headphones className="h-5 w-5" />;
      case 'tutorial':
        return <Laptop className="h-5 w-5" />;
      case 'tool':
        return <Tool className="h-5 w-5" />;
      case 'community':
        return <Users className="h-5 w-5" />;
      default:
        return <HelpCircle className="h-5 w-5" />;
    }
  };

  // Get difficulty color
  const getDifficultyColor = () => {
    switch (resource.difficulty?.toLowerCase()) {
      case 'beginner':
        return 'bg-green-500/20 text-green-300';
      case 'intermediate':
        return 'bg-yellow-500/20 text-yellow-300';
      case 'advanced':
        return 'bg-red-500/20 text-red-300';
      default:
        return 'bg-white/10 text-white/70';
    }
  };

  return (
    <div className="glass-effect rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-white/10">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-white">{resource.title}</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onUpvote(resource.resourceId)}
              className={`p-2 rounded-full ${
                isUpvoted 
                  ? 'bg-white/20 text-white' 
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              <ThumbsUp className="h-5 w-5" />
            </button>
            <button
              onClick={() => onBookmark(resource.resourceId)}
              className={`p-2 rounded-full ${
                isBookmarked 
                  ? 'bg-white/20 text-white' 
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Bookmark className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 border-b border-white/10">
        <p className="text-white/80 mb-4">{resource.description}</p>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {resource.topics?.map((topic, index) => (
            <span 
              key={index}
              className="px-3 py-1 bg-white/10 rounded-full text-sm text-white"
            >
              {topic}
            </span>
          ))}
        </div>
        
        {/* Metadata */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2 text-sm text-white/70">
            {getTypeIcon()}
            <span className="capitalize">{resource.type || 'Resource'}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-white/70">
            <BarChart className="h-5 w-5" />
            <span className={`px-2 py-0.5 rounded-full text-xs ${getDifficultyColor()}`}>
              {resource.difficulty || 'All Levels'}
            </span>
          </div>
          
          {resource.timeCommitment && (
            <div className="flex items-center space-x-2 text-sm text-white/70">
              <Clock className="h-5 w-5" />
              <span>{resource.timeCommitment}</span>
            </div>
          )}
          
          <div className="flex items-center space-x-2 text-sm text-white/70">
            <User className="h-5 w-5" />
            <span>{resource.creatorName || 'Unknown'}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-5 flex justify-between items-center">
        <div className="flex items-center space-x-2 text-sm text-white/70">
          <ThumbsUp className="h-4 w-4" />
          <span>{resource.upvotes || 0} upvotes</span>
        </div>
        
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 px-4 py-2 bg-white text-purple-600 rounded-lg font-medium hover:bg-white/90 transition-colors"
        >
          <ExternalLink className="h-5 w-5" />
          <span>View Resource</span>
        </a>
      </div>
    </div>
  );
}

export default ResourceCard;

