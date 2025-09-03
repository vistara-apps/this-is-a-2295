import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Users, 
  MessageSquare, 
  Plus, 
  Heart,
  Share,
  MoreHorizontal,
  User
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import PostItem from '../components/PostItem';
import TagPill from '../components/TagPill';

function Community() {
  const { id } = useParams();
  const { communities, getCommunityPosts, createPost, joinCommunity } = useData();
  const { user } = useAuth();
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    tags: ''
  });

  const community = communities.find(c => c.communityId === id);
  const posts = getCommunityPosts(id);
  const isMember = community?.members.includes(user?.userId);

  if (!community) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold text-white mb-4">Community not found</h1>
        <Link
          to="/communities"
          className="text-white/70 hover:text-white inline-flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Communities</span>
        </Link>
      </div>
    );
  }

  const handleJoinCommunity = () => {
    joinCommunity(community.communityId, user.userId);
  };

  const handleCreatePost = (e) => {
    e.preventDefault();
    const postData = {
      ...newPost,
      communityId: community.communityId,
      authorId: user.userId,
      authorName: user.username,
      tags: newPost.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    };
    
    createPost(postData);
    setNewPost({ title: '', content: '', tags: '' });
    setShowCreatePost(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Link
          to="/communities"
          className="p-2 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white">{community.name}</h1>
          <p className="text-white/70 mt-1">{community.description}</p>
        </div>
      </div>

      {/* Community Info */}
      <div className="glass-effect rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-white/70">
              <Users className="h-5 w-5" />
              <span>{community.memberCount} members</span>
            </div>
            <div className="flex items-center space-x-2 text-white/70">
              <MessageSquare className="h-5 w-5" />
              <span>{community.posts} posts</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {!isMember ? (
              <button
                onClick={handleJoinCommunity}
                className="px-4 py-2 bg-white text-purple-600 rounded-lg font-medium hover:bg-white/90 transition-colors"
              >
                Join Community
              </button>
            ) : (
              <span className="text-green-400 font-medium">✓ Joined</span>
            )}
            <button className="p-2 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
              <Share className="h-5 w-5" />
            </button>
            <button className="p-2 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>
        </div>

        {community.tags && (
          <div className="flex flex-wrap gap-2 mt-4">
            {community.tags.map((tag) => (
              <TagPill key={tag} text={tag} variant="community" />
            ))}
          </div>
        )}
      </div>

      {/* Create Post */}
      {isMember && (
        <div className="glass-effect rounded-xl p-6">
          {!showCreatePost ? (
            <button
              onClick={() => setShowCreatePost(true)}
              className="w-full flex items-center space-x-3 p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors text-left"
            >
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <span className="text-white/70">Share your thoughts with the community...</span>
            </button>
          ) : (
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <span className="font-medium text-white">{user.username}</span>
              </div>
              
              <input
                type="text"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                placeholder="Post title..."
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:border-white/40 focus:outline-none"
                required
              />
              
              <textarea
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                placeholder="What's on your mind?"
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:border-white/40 focus:outline-none h-24 resize-none"
                required
              />
              
              <input
                type="text"
                value={newPost.tags}
                onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                placeholder="Tags (comma-separated)"
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:border-white/40 focus:outline-none"
              />
              
              <div className="flex items-center space-x-3">
                <button
                  type="submit"
                  className="px-4 py-2 bg-white text-purple-600 rounded-lg font-medium hover:bg-white/90 transition-colors"
                >
                  Post
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreatePost(false)}
                  className="px-4 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Posts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Recent Posts</h2>
          <div className="flex items-center space-x-2 text-sm">
            <button className="text-white/70 hover:text-white">Latest</button>
            <span className="text-white/40">•</span>
            <button className="text-white/70 hover:text-white">Popular</button>
          </div>
        </div>

        {posts.length > 0 ? (
          posts.map((post) => (
            <PostItem key={post.postId} post={post} />
          ))
        ) : (
          <div className="text-center py-12 glass-effect rounded-xl">
            <MessageSquare className="h-16 w-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No posts yet</h3>
            <p className="text-white/70 mb-4">
              Be the first to start a conversation in this community!
            </p>
            {isMember && (
              <button
                onClick={() => setShowCreatePost(true)}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-white text-purple-600 rounded-lg font-medium hover:bg-white/90 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Create First Post</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Community;