import React from 'react';

function TagPill({ text, variant = 'community' }) {
  const variants = {
    community: 'bg-purple-500/20 text-purple-200 border-purple-500/30',
    topic: 'bg-blue-500/20 text-blue-200 border-blue-500/30'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]}`}>
      {text}
    </span>
  );
}

export default TagPill;