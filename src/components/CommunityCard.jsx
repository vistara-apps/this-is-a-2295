import React from 'react';
import { Link } from 'react-router-dom';
import { Users, MessageSquare, Hash, TrendingUp } from 'lucide-react';
import TagPill from './TagPill';

function CommunityCard({ community, compact = false }) {
  if (compact) {
    return (
      <Link
        to={`/community/${community.communityId}`}
        className="block p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-medium text-white mb-1">{community.name}</h3>
            <p className="text-sm text-white/70 mb-2 line-clamp-2">
              {community.description}
            </p>
            <div className="flex items-center space-x-4 text-xs text-white/60">
              <div className="flex items-center space-x-1">
                <Users className="h-3 w-3" />
                <span>{community.memberCount}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageSquare className="h-3 w-3" />
                <span>{community.posts}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="glass-effect rounded-xl p-6 animate-slide-up">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <Hash className="h-5 w-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">{community.name}</h3>
          </div>
          <p className="text-white/70 mb-3">{community.description}</p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {community.tags?.map((tag) => (
              <TagPill key={tag} text={tag} variant="topic" />
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6 text-sm text-white/70">
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>{community.memberCount} members</span>
          </div>
          <div className="flex items-center space-x-1">
            <MessageSquare className="h-4 w-4" />
            <span>{community.posts} posts</span>
          </div>
          <div className="flex items-center space-x-1">
            <TrendingUp className="h-4 w-4" />
            <span>Active</span>
          </div>
        </div>
        
        <Link
          to={`/community/${community.communityId}`}
          className="px-4 py-2 bg-white text-purple-600 rounded-lg font-medium hover:bg-white/90 transition-colors"
        >
          View
        </Link>
      </div>
    </div>
  );
}

export default CommunityCard;