import React, { useState } from 'react';
import { 
  User, 
  Edit3, 
  Settings, 
  Crown, 
  CreditCard,
  Bell,
  Shield,
  Users,
  Brain,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import TagPill from '../components/TagPill';

function Profile() {
  const { user, updateUser } = useAuth();
  const { communities, posts } = useData();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    bio: user?.bio || '',
    interests: user?.interests?.join(', ') || ''
  });

  const userCommunities = communities.filter(c => c.members.includes(user?.userId));
  const userPosts = posts.filter(p => p.authorId === user?.userId);

  const handleSave = () => {
    updateUser({
      bio: editData.bio,
      interests: editData.interests.split(',').map(i => i.trim()).filter(i => i)
    });
    setIsEditing(false);
  };

  const subscriptionTiers = {
    free: { name: 'Free', color: 'bg-gray-500', features: ['3 communities', 'Basic features'] },
    premium: { name: 'Premium', color: 'bg-blue-500', features: ['Unlimited communities', 'Advanced features'] },
    pro: { name: 'Pro', color: 'bg-purple-500', features: ['Everything + AI tools', 'Priority support'] }
  };

  const currentTier = subscriptionTiers[user?.subscription || 'free'];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
        <p className="text-white/70">Manage your account and preferences</p>
      </div>

      {/* Profile Info */}
      <div className="glass-effect rounded-xl p-6">
        <div className="flex items-start space-x-6">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="h-10 w-10 text-white" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-2xl font-bold text-white">{user?.username}</h2>
              <div className={`px-2 py-1 ${currentTier.color} rounded-full text-xs font-medium text-white flex items-center space-x-1`}>
                <Crown className="h-3 w-3" />
                <span>{currentTier.name}</span>
              </div>
            </div>
            
            <p className="text-white/70 mb-2">{user?.email}</p>
            
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-1">Bio</label>
                  <textarea
                    value={editData.bio}
                    onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:border-white/40 focus:outline-none h-20 resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-1">Interests</label>
                  <input
                    value={editData.interests}
                    onChange={(e) => setEditData({ ...editData, interests: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:border-white/40 focus:outline-none"
                    placeholder="AI, Entrepreneurship, Computer Science..."
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-white text-purple-600 rounded-lg font-medium hover:bg-white/90 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-white/80 mb-3">{user?.bio || 'No bio added yet'}</p>
                
                {user?.interests && user.interests.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {user.interests.map((interest) => (
                      <TagPill key={interest} text={interest} variant="topic" />
                    ))}
                  </div>
                )}
                
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Edit Profile</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-effect rounded-xl p-6 text-center">
          <Users className="h-8 w-8 text-blue-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{userCommunities.length}</p>
          <p className="text-white/70 text-sm">Communities</p>
        </div>
        
        <div className="glass-effect rounded-xl p-6 text-center">
          <MessageSquare className="h-8 w-8 text-green-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{userPosts.length}</p>
          <p className="text-white/70 text-sm">Posts</p>
        </div>
        
        <div className="glass-effect rounded-xl p-6 text-center">
          <Brain className="h-8 w-8 text-purple-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">5</p>
          <p className="text-white/70 text-sm">AI Sessions</p>
        </div>
      </div>

      {/* Subscription */}
      <div className="glass-effect rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
          <CreditCard className="h-5 w-5" />
          <span>Subscription</span>
        </h3>
        
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className={`w-3 h-3 ${currentTier.color} rounded-full`}></div>
              <span className="font-medium text-white">{currentTier.name} Plan</span>
            </div>
            <ul className="text-sm text-white/70 space-y-1">
              {currentTier.features.map((feature, index) => (
                <li key={index}>• {feature}</li>
              ))}
            </ul>
          </div>
          
          {user?.subscription === 'free' && (
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors">
              Upgrade
            </button>
          )}
        </div>
      </div>

      {/* Settings */}
      <div className="glass-effect rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="h-5 w-5 text-white/70" />
              <div>
                <p className="font-medium text-white">Notifications</p>
                <p className="text-sm text-white/70">Email updates and alerts</p>
              </div>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-white/20">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6"></span>
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-white/70" />
              <div>
                <p className="font-medium text-white">Privacy</p>
                <p className="text-sm text-white/70">Profile visibility settings</p>
              </div>
            </div>
            <button className="px-3 py-1 bg-white/10 text-white text-sm rounded-lg hover:bg-white/20 transition-colors">
              Configure
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;