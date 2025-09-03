import React, { useState, useEffect } from 'react';
import { 
  Users, 
  User, 
  Search, 
  Filter, 
  MessageSquare, 
  UserPlus, 
  UserCheck,
  Loader,
  PlusCircle,
  Settings
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { mentorshipService } from '../services/mentorshipService';
import MentorCard from '../components/MentorCard';
import MentorshipRequest from '../components/MentorshipRequest';

function Mentorship() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('find');
  const [mentorshipProfile, setMentorshipProfile] = useState(null);
  const [mentors, setMentors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [activeMentorships, setActiveMentorships] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [topicFilter, setTopicFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    isMentor: false,
    isMentee: true,
    mentorTopics: [],
    menteeTopics: [],
    experienceLevel: 'beginner',
    availability: 'Weekends and evenings',
    bio: ''
  });

  // Fetch mentorship profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setProfileLoading(true);
        const profile = await mentorshipService.getMentorshipProfile(user.userId);
        setMentorshipProfile(profile);
        
        if (profile) {
          setProfileFormData({
            isMentor: profile.isMentor,
            isMentee: profile.isMentee,
            mentorTopics: profile.mentorTopics || [],
            menteeTopics: profile.menteeTopics || [],
            experienceLevel: profile.experienceLevel || 'beginner',
            availability: profile.availability || 'Weekends and evenings',
            bio: profile.bio || ''
          });
        }
      } catch (error) {
        console.error('Error fetching mentorship profile:', error);
      } finally {
        setProfileLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  // Fetch data based on active tab
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (activeTab === 'find') {
          // Fetch mentors
          const topics = mentorshipProfile?.menteeTopics || [];
          const { mentors: mentorsList } = await mentorshipService.findMentors(topics);
          setMentors(mentorsList);
        } else if (activeTab === 'requests') {
          // Fetch mentorship requests
          const requestsList = await mentorshipService.getMentorshipRequests(user.userId);
          setRequests(requestsList);
        } else if (activeTab === 'active') {
          // Fetch active mentorships
          const mentorshipsList = await mentorshipService.getActiveMentorships(user.userId);
          setActiveMentorships(mentorshipsList);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user && mentorshipProfile) {
      fetchData();
    }
  }, [activeTab, user, mentorshipProfile]);

  const handleRequestMentorship = async (requestData) => {
    try {
      await mentorshipService.createMentorshipRequest({
        requesterId: user.userId,
        ...requestData
      });
      
      // Switch to requests tab
      setActiveTab('requests');
      
      // Refresh requests
      const requestsList = await mentorshipService.getMentorshipRequests(user.userId);
      setRequests(requestsList);
    } catch (error) {
      console.error('Error creating mentorship request:', error);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await mentorshipService.updateRequestStatus(requestId, 'accepted');
      
      // Refresh requests
      const requestsList = await mentorshipService.getMentorshipRequests(user.userId);
      setRequests(requestsList);
      
      // Refresh active mentorships
      const mentorshipsList = await mentorshipService.getActiveMentorships(user.userId);
      setActiveMentorships(mentorshipsList);
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await mentorshipService.updateRequestStatus(requestId, 'rejected');
      
      // Refresh requests
      const requestsList = await mentorshipService.getMentorshipRequests(user.userId);
      setRequests(requestsList);
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const updatedProfile = await mentorshipService.updateMentorshipProfile(
        user.userId,
        profileFormData
      );
      
      setMentorshipProfile(updatedProfile);
      setShowProfileForm(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleTopicChange = (e, field) => {
    const topics = e.target.value.split(',').map(topic => topic.trim()).filter(Boolean);
    setProfileFormData(prev => ({ ...prev, [field]: topics }));
  };

  // Filter mentors based on search term and topic filter
  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = mentor.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentor.bio?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTopic = !topicFilter || mentor.mentorTopics.includes(topicFilter);
    
    return matchesSearch && matchesTopic;
  });

  // Get unique topics from all mentors
  const allTopics = [...new Set(mentors.flatMap(mentor => mentor.mentorTopics))];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Mentorship</h1>
          <p className="text-white/70 mt-1">Connect with mentors or become a mentor</p>
        </div>
        
        <button
          onClick={() => setShowProfileForm(true)}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-white text-purple-600 rounded-lg font-medium hover:bg-white/90 transition-colors"
        >
          <Settings className="h-5 w-5" />
          <span>Mentorship Settings</span>
        </button>
      </div>

      {/* Profile Form Modal */}
      {showProfileForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="glass-effect rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Mentorship Profile</h2>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  I want to be a:
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={profileFormData.isMentee}
                      onChange={(e) => setProfileFormData(prev => ({ ...prev, isMentee: e.target.checked }))}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-white">Mentee</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={profileFormData.isMentor}
                      onChange={(e) => setProfileFormData(prev => ({ ...prev, isMentor: e.target.checked }))}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-white">Mentor</span>
                  </label>
                </div>
              </div>
              
              {profileFormData.isMentee && (
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    Topics I want mentorship in (comma-separated):
                  </label>
                  <input
                    type="text"
                    value={profileFormData.menteeTopics.join(', ')}
                    onChange={(e) => handleTopicChange(e, 'menteeTopics')}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:border-white/40 focus:outline-none"
                    placeholder="e.g., Machine Learning, Web Development, Career Growth"
                  />
                </div>
              )}
              
              {profileFormData.isMentor && (
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    Topics I can mentor in (comma-separated):
                  </label>
                  <input
                    type="text"
                    value={profileFormData.mentorTopics.join(', ')}
                    onChange={(e) => handleTopicChange(e, 'mentorTopics')}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:border-white/40 focus:outline-none"
                    placeholder="e.g., JavaScript, Product Management, Research"
                  />
                </div>
              )}
              
              {profileFormData.isMentor && (
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    Experience Level:
                  </label>
                  <select
                    value={profileFormData.experienceLevel}
                    onChange={(e) => setProfileFormData(prev => ({ ...prev, experienceLevel: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-white/40 focus:outline-none"
                  >
                    <option value="beginner">Beginner (1-2 years)</option>
                    <option value="intermediate">Intermediate (3-5 years)</option>
                    <option value="advanced">Advanced (5+ years)</option>
                    <option value="expert">Expert (10+ years)</option>
                  </select>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Availability:
                </label>
                <input
                  type="text"
                  value={profileFormData.availability}
                  onChange={(e) => setProfileFormData(prev => ({ ...prev, availability: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:border-white/40 focus:outline-none"
                  placeholder="e.g., Weekends and evenings"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Bio:
                </label>
                <textarea
                  value={profileFormData.bio}
                  onChange={(e) => setProfileFormData(prev => ({ ...prev, bio: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:border-white/40 focus:outline-none h-24 resize-none"
                  placeholder="Tell others about yourself, your background, and your interests..."
                />
              </div>
              
              <div className="flex space-x-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-white text-purple-600 py-2 rounded-lg font-medium hover:bg-white/90 transition-colors"
                >
                  Save Profile
                </button>
                <button
                  type="button"
                  onClick={() => setShowProfileForm(false)}
                  className="flex-1 bg-white/10 text-white py-2 rounded-lg font-medium hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Loading */}
      {profileLoading ? (
        <div className="glass-effect rounded-xl p-8 text-center">
          <Loader className="h-8 w-8 text-white/60 mx-auto animate-spin mb-4" />
          <p className="text-white/70">Loading your mentorship profile...</p>
        </div>
      ) : !mentorshipProfile ? (
        <div className="glass-effect rounded-xl p-8 text-center">
          <UserPlus className="h-16 w-16 text-white/40 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Create Your Mentorship Profile</h3>
          <p className="text-white/70 mb-6 max-w-md mx-auto">
            Set up your mentorship profile to connect with mentors or become a mentor yourself.
          </p>
          <button
            onClick={() => setShowProfileForm(true)}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-white text-purple-600 rounded-lg font-medium hover:bg-white/90 transition-colors"
          >
            <PlusCircle className="h-5 w-5" />
            <span>Create Profile</span>
          </button>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex border-b border-white/10">
            <button
              onClick={() => setActiveTab('find')}
              className={`px-4 py-3 font-medium text-sm border-b-2 ${
                activeTab === 'find'
                  ? 'border-white text-white'
                  : 'border-transparent text-white/60 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Search className="h-5 w-5" />
                <span>Find Mentors</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-4 py-3 font-medium text-sm border-b-2 ${
                activeTab === 'requests'
                  ? 'border-white text-white'
                  : 'border-transparent text-white/60 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Requests</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-3 font-medium text-sm border-b-2 ${
                activeTab === 'active'
                  ? 'border-white text-white'
                  : 'border-transparent text-white/60 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2">
                <UserCheck className="h-5 w-5" />
                <span>Active Mentorships</span>
              </div>
            </button>
          </div>

          {/* Find Mentors Tab */}
          {activeTab === 'find' && (
            <div>
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search mentors..."
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:border-white/40 focus:outline-none"
                  />
                </div>
                <div className="sm:w-64">
                  <select
                    value={topicFilter}
                    onChange={(e) => setTopicFilter(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:border-white/40 focus:outline-none"
                  >
                    <option value="">All Topics</option>
                    {allTopics.map((topic, index) => (
                      <option key={index} value={topic}>{topic}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Mentors Grid */}
              {loading ? (
                <div className="text-center py-12">
                  <Loader className="h-8 w-8 text-white/60 mx-auto animate-spin mb-4" />
                  <p className="text-white/70">Loading mentors...</p>
                </div>
              ) : filteredMentors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredMentors.map((mentor) => (
                    <MentorCard
                      key={mentor.userId}
                      mentor={mentor}
                      onRequestMentorship={handleRequestMentorship}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-white/40 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No mentors found</h3>
                  <p className="text-white/70 mb-4">
                    {searchTerm || topicFilter
                      ? 'Try adjusting your search or filters'
                      : 'There are no mentors available for your topics of interest yet'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Requests Tab */}
          {activeTab === 'requests' && (
            <div>
              <div className="flex space-x-4 mb-6">
                <button
                  className={`px-4 py-2 rounded-lg font-medium ${
                    true
                      ? 'bg-white text-purple-600'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  All Requests
                </button>
                <button
                  className={`px-4 py-2 rounded-lg font-medium ${
                    false
                      ? 'bg-white text-purple-600'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  Sent
                </button>
                <button
                  className={`px-4 py-2 rounded-lg font-medium ${
                    false
                      ? 'bg-white text-purple-600'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  Received
                </button>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <Loader className="h-8 w-8 text-white/60 mx-auto animate-spin mb-4" />
                  <p className="text-white/70">Loading requests...</p>
                </div>
              ) : requests.length > 0 ? (
                <div className="space-y-6">
                  {requests.map((request) => (
                    <MentorshipRequest
                      key={request.requestId}
                      request={request}
                      viewType={request.requesterId === user.userId ? 'sent' : 'received'}
                      onAccept={handleAcceptRequest}
                      onReject={handleRejectRequest}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="h-16 w-16 text-white/40 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No requests yet</h3>
                  <p className="text-white/70 mb-4">
                    You don't have any mentorship requests yet
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Active Mentorships Tab */}
          {activeTab === 'active' && (
            <div>
              {loading ? (
                <div className="text-center py-12">
                  <Loader className="h-8 w-8 text-white/60 mx-auto animate-spin mb-4" />
                  <p className="text-white/70">Loading mentorships...</p>
                </div>
              ) : activeMentorships.length > 0 ? (
                <div className="space-y-6">
                  {activeMentorships.map((mentorship) => (
                    <div key={mentorship.mentorshipId} className="glass-effect rounded-xl p-5">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                              <User className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-white">
                                {mentorship.mentorId === user.userId
                                  ? `Mentoring ${mentorship.menteeName}`
                                  : `Mentored by ${mentorship.mentorName}`}
                              </h3>
                              <div className="text-sm text-white/70">
                                Since {new Date(mentorship.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          
                          <div className="ml-13 pl-13">
                            <h4 className="text-sm font-medium text-white/70 mb-2">Topics</h4>
                            <div className="flex flex-wrap gap-2">
                              {mentorship.topics?.map((topic, index) => (
                                <span 
                                  key={index}
                                  className="px-3 py-1 bg-white/10 rounded-full text-sm text-white"
                                >
                                  {topic}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <button
                          className="px-4 py-2 bg-white text-purple-600 rounded-lg font-medium hover:bg-white/90 transition-colors"
                        >
                          Message
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <UserCheck className="h-16 w-16 text-white/40 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No active mentorships</h3>
                  <p className="text-white/70 mb-4">
                    You don't have any active mentorships yet
                  </p>
                  <button
                    onClick={() => setActiveTab('find')}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-white text-purple-600 rounded-lg font-medium hover:bg-white/90 transition-colors"
                  >
                    <Search className="h-5 w-5" />
                    <span>Find Mentors</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Mentorship;

