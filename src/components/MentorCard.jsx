import React, { useState } from 'react';
import { User, MessageSquare, Calendar, Award, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * MentorCard component for displaying mentor information
 * 
 * @param {Object} props
 * @param {Object} props.mentor - Mentor data
 * @param {Function} props.onRequestMentorship - Callback for requesting mentorship
 */
function MentorCard({ mentor, onRequestMentorship }) {
  const [expanded, setExpanded] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [showRequestForm, setShowRequestForm] = useState(false);

  const handleRequestSubmit = (e) => {
    e.preventDefault();
    onRequestMentorship({
      recipientId: mentor.userId,
      message: requestMessage,
      topics: mentor.mentorTopics
    });
    setRequestMessage('');
    setShowRequestForm(false);
  };

  return (
    <div className="glass-effect rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <User className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{mentor.username}</h3>
            <div className="flex items-center space-x-2 text-sm text-white/70">
              <Award className="h-4 w-4" />
              <span>{mentor.experienceLevel || 'Experienced'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Topics */}
      <div className="p-5 border-b border-white/10">
        <h4 className="text-sm font-medium text-white/70 mb-2">Mentoring in</h4>
        <div className="flex flex-wrap gap-2">
          {mentor.mentorTopics.map((topic, index) => (
            <span 
              key={index}
              className="px-3 py-1 bg-white/10 rounded-full text-sm text-white"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>

      {/* Bio (collapsed by default) */}
      <div className="p-5 border-b border-white/10">
        <button 
          className="flex items-center justify-between w-full text-left"
          onClick={() => setExpanded(!expanded)}
        >
          <h4 className="text-sm font-medium text-white/70">About</h4>
          {expanded ? (
            <ChevronUp className="h-5 w-5 text-white/70" />
          ) : (
            <ChevronDown className="h-5 w-5 text-white/70" />
          )}
        </button>
        
        {expanded && (
          <div className="mt-3 text-white/90">
            <p>{mentor.bio || mentor.userBio || 'No bio provided.'}</p>
          </div>
        )}
      </div>

      {/* Availability */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-white/70" />
          <span className="text-sm text-white">
            {mentor.availability || 'Available for mentorship'}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="p-5">
        {!showRequestForm ? (
          <button
            onClick={() => setShowRequestForm(true)}
            className="w-full flex items-center justify-center space-x-2 py-2 bg-white text-purple-600 rounded-lg font-medium hover:bg-white/90 transition-colors"
          >
            <MessageSquare className="h-5 w-5" />
            <span>Request Mentorship</span>
          </button>
        ) : (
          <form onSubmit={handleRequestSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Message to Mentor
              </label>
              <textarea
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:border-white/40 focus:outline-none h-24 resize-none"
                placeholder="Introduce yourself and explain why you'd like mentorship..."
                required
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex-1 bg-white text-purple-600 py-2 rounded-lg font-medium hover:bg-white/90 transition-colors"
              >
                Send Request
              </button>
              <button
                type="button"
                onClick={() => setShowRequestForm(false)}
                className="flex-1 bg-white/10 text-white py-2 rounded-lg font-medium hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default MentorCard;

