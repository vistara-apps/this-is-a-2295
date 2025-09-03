import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Brain, 
  TrendingUp, 
  MessageCircle, 
  Plus,
  ArrowRight,
  Star,
  Clock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import CommunityCard from '../components/CommunityCard';
import PostItem from '../components/PostItem';

function Dashboard() {
  const { user } = useAuth();
  const { communities, posts } = useData();

  const joinedCommunities = communities.filter(c => 
    c.members.includes(user?.userId)
  );
  
  const recentPosts = posts
    .filter(p => joinedCommunities.some(c => c.communityId === p.communityId))
    .slice(0, 3);

  const stats = [
    {
      name: 'Communities Joined',
      value: joinedCommunities.length,
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      name: 'AI Ideas Shared',
      value: posts.filter(p => p.authorId === user?.userId).length,
      icon: Brain,
      color: 'bg-purple-500'
    },
    {
      name: 'Connections Made',
      value: 23,
      icon: TrendingUp,
      color: 'bg-green-500'
    },
    {
      name: 'Messages Sent',
      value: 47,
      icon: MessageCircle,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          Welcome back, {user?.username}! 👋
        </h1>
        <p className="text-xl text-white/80">
          Ready to spark some new ideas today?
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="glass-effect rounded-xl p-6 animate-fade-in">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-white/70">{stat.name}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="glass-effect rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/communities"
            className="flex items-center space-x-3 p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors group"
          >
            <Plus className="h-8 w-8 text-white" />
            <div>
              <p className="font-medium text-white">Join Community</p>
              <p className="text-sm text-white/70">Find your niche</p>
            </div>
            <ArrowRight className="h-5 w-5 text-white/70 group-hover:text-white ml-auto" />
          </Link>
          
          <Link
            to="/ai-hub"
            className="flex items-center space-x-3 p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors group"
          >
            <Brain className="h-8 w-8 text-white" />
            <div>
              <p className="font-medium text-white">AI Brainstorm</p>
              <p className="text-sm text-white/70">Generate ideas</p>
            </div>
            <ArrowRight className="h-5 w-5 text-white/70 group-hover:text-white ml-auto" />
          </Link>
          
          <Link
            to="/communities"
            className="flex items-center space-x-3 p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors group"
          >
            <MessageCircle className="h-8 w-8 text-white" />
            <div>
              <p className="font-medium text-white">Ask Question</p>
              <p className="text-sm text-white/70">Get peer advice</p>
            </div>
            <ArrowRight className="h-5 w-5 text-white/70 group-hover:text-white ml-auto" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* My Communities */}
        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">My Communities</h2>
            <Link
              to="/communities"
              className="text-white/70 hover:text-white text-sm font-medium"
            >
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {joinedCommunities.slice(0, 3).map((community) => (
              <CommunityCard key={community.communityId} community={community} compact />
            ))}
            {joinedCommunities.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-white/40 mx-auto mb-3" />
                <p className="text-white/70">No communities joined yet</p>
                <Link
                  to="/communities"
                  className="text-white hover:text-white/80 font-medium mt-2 inline-block"
                >
                  Explore communities →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
            <Clock className="h-5 w-5 text-white/70" />
          </div>
          <div className="space-y-4">
            {recentPosts.map((post) => (
              <PostItem key={post.postId} post={post} compact />
            ))}
            {recentPosts.length === 0 && (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-white/40 mx-auto mb-3" />
                <p className="text-white/70">No recent activity</p>
                <p className="text-white/50 text-sm mt-1">
                  Join communities to see posts here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Featured Content */}
      <div className="glass-effect rounded-xl p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Star className="h-5 w-5 text-yellow-400" />
          <h2 className="text-xl font-semibold text-white">Featured This Week</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <h3 className="font-semibold text-white mb-2">AI Startup Workshop</h3>
            <p className="text-white/70 text-sm mb-3">
              Join our live workshop on building AI-powered startups. Learn from successful founders.
            </p>
            <button className="text-white bg-purple-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
              Register Now
            </button>
          </div>
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <h3 className="font-semibold text-white mb-2">Community Spotlight</h3>
            <p className="text-white/70 text-sm mb-3">
              This week's featured community: "Quantum Computing Enthusiasts" - 500+ members
            </p>
            <Link
              to="/communities"
              className="text-white bg-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors inline-block"
            >
              Explore
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;