import React from 'react';
import { User, Calendar, MessageSquare, Clock, CheckCircle, XCircle, HelpCircle } from 'lucide-react';

/**
 * MentorshipRequest component for displaying mentorship requests
 * 
 * @param {Object} props
 * @param {Object} props.request - Request data
 * @param {string} props.viewType - View type (sent, received)
 * @param {Function} props.onAccept - Callback for accepting a request
 * @param {Function} props.onReject - Callback for rejecting a request
 */
function MentorshipRequest({ request, viewType = 'received', onAccept, onReject }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusIcon = () => {
    switch (request.status) {
      case 'accepted':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-400" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-400" />;
      default:
        return <HelpCircle className="h-5 w-5 text-white/60" />;
    }
  };

  const getStatusText = () => {
    switch (request.status) {
      case 'accepted':
        return 'Accepted';
      case 'rejected':
        return 'Rejected';
      case 'pending':
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="glass-effect rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-white/10">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">
                {viewType === 'sent' ? request.recipientName : request.requesterName}
              </h3>
              <div className="flex items-center space-x-1 text-sm text-white/70">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(request.createdAt)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-white/10">
            {getStatusIcon()}
            <span className="text-sm text-white">{getStatusText()}</span>
          </div>
        </div>
      </div>

      {/* Topics */}
      <div className="p-5 border-b border-white/10">
        <h4 className="text-sm font-medium text-white/70 mb-2">Topics</h4>
        <div className="flex flex-wrap gap-2">
          {request.topics?.map((topic, index) => (
            <span 
              key={index}
              className="px-3 py-1 bg-white/10 rounded-full text-sm text-white"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>

      {/* Message */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-start space-x-2 mb-2">
          <MessageSquare className="h-5 w-5 text-white/70 flex-shrink-0 mt-0.5" />
          <h4 className="text-sm font-medium text-white/70">Message</h4>
        </div>
        <p className="text-white/90 whitespace-pre-line">{request.message}</p>
      </div>

      {/* Actions */}
      {viewType === 'received' && request.status === 'pending' && (
        <div className="p-5 flex space-x-3">
          <button
            onClick={() => onAccept(request.requestId)}
            className="flex-1 flex items-center justify-center space-x-2 py-2 bg-white text-purple-600 rounded-lg font-medium hover:bg-white/90 transition-colors"
          >
            <CheckCircle className="h-5 w-5" />
            <span>Accept</span>
          </button>
          <button
            onClick={() => onReject(request.requestId)}
            className="flex-1 flex items-center justify-center space-x-2 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors"
          >
            <XCircle className="h-5 w-5" />
            <span>Decline</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default MentorshipRequest;

