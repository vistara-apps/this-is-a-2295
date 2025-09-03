import React, { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext();

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

export function DataProvider({ children }) {
  const [communities, setCommunities] = useState([]);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    // Initialize with mock data
    const mockCommunities = [
      {
        communityId: '1',
        name: 'AI & Machine Learning',
        description: 'Explore the latest in artificial intelligence and machine learning technologies',
        topic: 'Computer Science',
        createdBy: '1',
        members: ['1', '2', '3'],
        memberCount: 234,
        posts: 45,
        tags: ['AI', 'ML', 'Deep Learning']
      },
      {
        communityId: '2',
        name: 'Startup Founders',
        description: 'Connect with fellow entrepreneurs and share startup insights',
        topic: 'Entrepreneurship',
        createdBy: '2',
        members: ['1', '4', '5'],
        memberCount: 156,
        posts: 28,
        tags: ['Startup', 'Business', 'Funding']
      },
      {
        communityId: '3',
        name: 'Product Management',
        description: 'Discuss product strategy, user research, and PM best practices',
        topic: 'Business',
        createdBy: '3',
        members: ['2', '3', '6'],
        memberCount: 89,
        posts: 32,
        tags: ['Product', 'Strategy', 'UX']
      }
    ];

    const mockPosts = [
      {
        postId: '1',
        communityId: '1',
        authorId: '1',
        authorName: 'Alex Chen',
        title: 'Best practices for training neural networks?',
        content: 'I\'m working on a computer vision project and looking for advice on training deep neural networks effectively. What are your go-to techniques?',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        likes: 12,
        comments: 5,
        tags: ['Neural Networks', 'Computer Vision']
      },
      {
        postId: '2',
        communityId: '2',
        authorId: '2',
        authorName: 'Sarah Johnson',
        title: 'AI startup idea: Personalized learning assistant',
        content: 'I\'m developing an AI-powered learning assistant that adapts to individual student needs. Looking for feedback and potential co-founders!',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        likes: 8,
        comments: 3,
        tags: ['Education', 'AI', 'Startup']
      }
    ];

    setCommunities(mockCommunities);
    setPosts(mockPosts);
  }, []);

  const createCommunity = (communityData) => {
    const newCommunity = {
      ...communityData,
      communityId: Date.now().toString(),
      members: [communityData.createdBy],
      memberCount: 1,
      posts: 0
    };
    setCommunities(prev => [...prev, newCommunity]);
    return newCommunity;
  };

  const joinCommunity = (communityId, userId) => {
    setCommunities(prev => prev.map(community => 
      community.communityId === communityId
        ? { 
            ...community, 
            members: [...community.members, userId],
            memberCount: community.memberCount + 1
          }
        : community
    ));
  };

  const createPost = (postData) => {
    const newPost = {
      ...postData,
      postId: Date.now().toString(),
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: 0
    };
    setPosts(prev => [...prev, newPost]);
    
    // Update community post count
    setCommunities(prev => prev.map(community => 
      community.communityId === postData.communityId
        ? { ...community, posts: community.posts + 1 }
        : community
    ));
    
    return newPost;
  };

  const getCommunityPosts = (communityId) => {
    return posts.filter(post => post.communityId === communityId);
  };

  const value = {
    communities,
    posts,
    comments,
    createCommunity,
    joinCommunity,
    createPost,
    getCommunityPosts
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}