import React from 'react';
import { Heart, MessageCircle, Clock, User } from 'lucide-react';
import TagPill from './TagPill';

function PostItem({ post, compact = false }) {
  const timeAgo = new Date(post.createdAt).toLocaleString();

  if (compact) {
    return (
      <div className="p-3 bg-white/5 rounded-lg border border-white/10">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{post.title}</p>
            <p className="text-xs text-white/60">{post.authorName}</p>
          </div>
          <div className="flex items-center space-x-2 text-xs text-white/60">
            <Heart className="h-3 w-3" />
            <span>{post.likes}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-effect rounded-xl p-6 animate-slide-up">
      <div className="flex items-start space-x-4">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="h-5 w-5 text-white" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <span className="font-medium text-white">{post.authorName}</span>
            <span className="text-white/60">•</span>
            <div className="flex items-center space-x-1 text-sm text-white/60">
              <Clock className="h-3 w-3" />
              <span>{timeAgo}</span>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold text-white mb-2">{post.title}</h3>
          <p className="text-white/80 mb-3">{post.content}</p>
          
          {post.tags && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <TagPill key={tag} text={tag} variant="topic" />
              ))}
            </div>
          )}
          
          <div className="flex items-center space-x-6">
            <button className="flex items-center space-x-2 text-white/70 hover:text-red-400 transition-colors">
              <Heart className="h-5 w-5" />
              <span>{post.likes}</span>
            </button>
            <button className="flex items-center space-x-2 text-white/70 hover:text-blue-400 transition-colors">
              <MessageCircle className="h-5 w-5" />
              <span>{post.comments}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostItem;