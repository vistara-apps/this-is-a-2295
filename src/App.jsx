import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/AppShell';
import Dashboard from './pages/Dashboard';
import Communities from './pages/Communities';
import AIHub from './pages/AIHub';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Community from './pages/Community';
import Mentorship from './pages/Mentorship';
import Resources from './pages/Resources';
import Subscription from './pages/Subscription';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { NotificationProvider } from './contexts/NotificationContext';

function AppRoutes() {
  const { user } = useAuth();

  if (!user) {
    return <Login />;
  }

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/communities" element={<Communities />} />
        <Route path="/community/:id" element={<Community />} />
        <Route path="/ai-hub" element={<AIHub />} />
        <Route path="/mentorship" element={<Mentorship />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/subscription" element={<Subscription />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <DataProvider>
          <NotificationProvider>
            <AppRoutes />
          </NotificationProvider>
        </DataProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
