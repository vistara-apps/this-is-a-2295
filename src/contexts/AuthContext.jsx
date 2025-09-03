import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('nichespark_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Simulate API call
    const mockUser = {
      userId: '1',
      username: email.split('@')[0],
      email,
      bio: 'Passionate about technology and innovation',
      interests: ['AI', 'Entrepreneurship', 'Computer Science'],
      communitiesJoined: ['1', '2'],
      subscription: 'free'
    };
    
    setUser(mockUser);
    localStorage.setItem('nichespark_user', JSON.stringify(mockUser));
    return mockUser;
  };

  const signup = async (email, password, username) => {
    // Simulate API call
    const mockUser = {
      userId: Date.now().toString(),
      username,
      email,
      bio: '',
      interests: [],
      communitiesJoined: [],
      subscription: 'free'
    };
    
    setUser(mockUser);
    localStorage.setItem('nichespark_user', JSON.stringify(mockUser));
    return mockUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('nichespark_user');
  };

  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('nichespark_user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    login,
    signup,
    logout,
    updateUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}