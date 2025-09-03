import React, { useState } from 'react';
import { Reply, ThumbsUp, MoreVertical, Send, Trash2, Edit } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

/**
 * CommentThread component for displaying and managing comments
 * 
 * @param {Object} props
 * @param {Array} props.comments - List of comments
 * @param {string} props.variant - Component variant (nested, flat)
 * @param {Function} props.onAddComment - Callback for adding a comment
 * @param {Function} props.onEditComment - Callback for editing a comment
 * @param {Function} props.onDeleteComment - Callback for deleting a comment
 * @param {Function} props.onLikeComment - Callback for liking a comment
 */
function CommentThread({ 
  comments = [], 
  variant = 'nested', 
  onAddComment, 
  onEditComment, 
  onDeleteComment, 
  onLikeComment 
}) {
  const { user } = useAuth();
  const [replyToId, setReplyToId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  // Group comments by parent ID for nested view
  const groupedComments = comments.reduce((acc, comment) => {
    const parentId = comment.parentId || 'root';
    if (!acc[parentId]) {
      acc[parentId] = [];
    }
    acc[parentId].push(comment);
    return acc;
  }, {});

  const handleReply = (commentId) => {
    setReplyToId(commentId);
    setReplyText('');
  };

  const submitReply = () => {
    if (replyText.trim()) {
      onAddComment({
        content: replyText,
        parentId: replyToId
      });
      setReplyText('');
      setReplyToId(null);
    }
  };

  const handleEdit = (comment) => {
    setEditingId(comment.commentId);
    setEditText(comment.content);
  };

  const submitEdit = () => {
    if (editText.trim()) {
      onEditComment(editingId, { content: editText });
      setEditingId(null);
      setEditText('');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Recursive function to render nested comments
  const renderNestedComments = (parentId = 'root', depth = 0) => {
    const childComments = groupedComments[parentId] || [];
    
    return childComments.map(comment => (
      <div 
        key={comment.commentId} 
        className={`mt-3 ${depth > 0 ? 'ml-6 border-l-2 border-white/10 pl-4' : ''}`}
      >
        <div className="glass-effect rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-xs font-bold text-white">
                  {comment.authorName?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <div className="font-medium text-white">{comment.authorName}</div>
                <div className="text-xs text-white/60">{formatDate(comment.createdAt)}</div>
              </div>
            </div>
            
            {user?.userId === comment.authorId && (
              <div className="relative group">
                <button className="p-1 text-white/60 hover:text-white">
                  <MoreVertical className="h-5 w-5" />
                </button>
                <div className="absolute right-0 mt-1 w-32 bg-white/10 backdrop-blur-md border border-white/20 rounded-md shadow-lg hidden group-hover:block z-10">
                  <button 
                    onClick={() => handleEdit(comment)}
                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 rounded-t-md"
                  >
                    <Edit className="h-4 w-4 inline mr-2" />
                    Edit
                  </button>
                  <button 
                    onClick={() => onDeleteComment(comment.commentId)}
                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 rounded-b-md"
                  >
                    <Trash2 className="h-4 w-4 inline mr-2" />
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {editingId === comment.commentId ? (
            <div className="mt-2">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:border-white/40 focus:outline-none resize-none h-20"
                placeholder="Edit your comment..."
              />
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  onClick={cancelEdit}
                  className="px-3 py-1 text-sm text-white/80 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={submitEdit}
                  className="px-3 py-1 text-sm bg-white/10 hover:bg-white/20 text-white rounded-md"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-2 text-white/90">{comment.content}</div>
          )}
          
          <div className="mt-3 flex items-center space-x-4 text-sm">
            <button 
              onClick={() => onLikeComment(comment.commentId)}
              className="flex items-center space-x-1 text-white/60 hover:text-white"
            >
              <ThumbsUp className="h-4 w-4" />
              <span>Like</span>
            </button>
            <button 
              onClick={() => handleReply(comment.commentId)}
              className="flex items-center space-x-1 text-white/60 hover:text-white"
            >
              <Reply className="h-4 w-4" />
              <span>Reply</span>
            </button>
          </div>
          
          {replyToId === comment.commentId && (
            <div className="mt-3">
              <div className="flex space-x-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex-shrink-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 relative">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:border-white/40 focus:outline-none resize-none"
                    placeholder="Write a reply..."
                    rows={2}
                  />
                  <button
                    onClick={submitReply}
                    disabled={!replyText.trim()}
                    className="absolute right-2 bottom-2 p-1 text-white/60 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Render child comments recursively */}
          {variant === 'nested' && renderNestedComments(comment.commentId, depth + 1)}
        </div>
      </div>
    ));
  };

  // Render flat comment list
  const renderFlatComments = () => {
    return comments.map(comment => (
      <div key={comment.commentId} className="mt-3">
        <div className="glass-effect rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-xs font-bold text-white">
                  {comment.authorName?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <div className="font-medium text-white">{comment.authorName}</div>
                <div className="text-xs text-white/60">{formatDate(comment.createdAt)}</div>
              </div>
            </div>
            
            {user?.userId === comment.authorId && (
              <div className="relative group">
                <button className="p-1 text-white/60 hover:text-white">
                  <MoreVertical className="h-5 w-5" />
                </button>
                <div className="absolute right-0 mt-1 w-32 bg-white/10 backdrop-blur-md border border-white/20 rounded-md shadow-lg hidden group-hover:block z-10">
                  <button 
                    onClick={() => handleEdit(comment)}
                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 rounded-t-md"
                  >
                    <Edit className="h-4 w-4 inline mr-2" />
                    Edit
                  </button>
                  <button 
                    onClick={() => onDeleteComment(comment.commentId)}
                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 rounded-b-md"
                  >
                    <Trash2 className="h-4 w-4 inline mr-2" />
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {editingId === comment.commentId ? (
            <div className="mt-2">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:border-white/40 focus:outline-none resize-none h-20"
                placeholder="Edit your comment..."
              />
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  onClick={cancelEdit}
                  className="px-3 py-1 text-sm text-white/80 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={submitEdit}
                  className="px-3 py-1 text-sm bg-white/10 hover:bg-white/20 text-white rounded-md"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-2 text-white/90">{comment.content}</div>
          )}
          
          <div className="mt-3 flex items-center space-x-4 text-sm">
            <button 
              onClick={() => onLikeComment(comment.commentId)}
              className="flex items-center space-x-1 text-white/60 hover:text-white"
            >
              <ThumbsUp className="h-4 w-4" />
              <span>Like</span>
            </button>
            <button 
              onClick={() => handleReply(comment.commentId)}
              className="flex items-center space-x-1 text-white/60 hover:text-white"
            >
              <Reply className="h-4 w-4" />
              <span>Reply</span>
            </button>
          </div>
          
          {replyToId === comment.commentId && (
            <div className="mt-3">
              <div className="flex space-x-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex-shrink-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 relative">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:border-white/40 focus:outline-none resize-none"
                    placeholder="Write a reply..."
                    rows={2}
                  />
                  <button
                    onClick={submitReply}
                    disabled={!replyText.trim()}
                    className="absolute right-2 bottom-2 p-1 text-white/60 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    ));
  };

  return (
    <div className="space-y-4">
      {variant === 'nested' ? renderNestedComments() : renderFlatComments()}
      
      {/* Add new comment */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-white mb-3">Add a comment</h3>
        <div className="flex space-x-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex-shrink-0 flex items-center justify-center">
            <span className="text-sm font-bold text-white">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 relative">
            <textarea
              value={replyToId === null ? replyText : ''}
              onChange={(e) => setReplyText(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:border-white/40 focus:outline-none resize-none"
              placeholder="Write a comment..."
              rows={3}
            />
            <button
              onClick={() => {
                if (replyText.trim()) {
                  onAddComment({ content: replyText });
                  setReplyText('');
                }
              }}
              disabled={!replyText.trim()}
              className="absolute right-3 bottom-3 p-1 text-white/60 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommentThread;

