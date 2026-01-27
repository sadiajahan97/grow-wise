
import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import RegistrationForm from './components/RegistrationForm';
import Dashboard from './components/Dashboard';
import { User, ChatSession, AppState } from './types';
import { isAuthenticated, getUserEmail, logout as authLogout } from './services/authService';

const STORAGE_KEY = 'growwise_state';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse storage", e);
      }
    }
    return {
      user: null,
      sessions: [],
      activeSessionId: null,
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const handleRegister = (user: User) => {
    setState(prev => ({ ...prev, user }));
  };

  const handleCreateSession = (agentId: string) => {
    const newSession: ChatSession = {
      id: crypto.randomUUID(),
      title: 'New Conversation',
      agentId,
      messages: [],
      createdAt: Date.now(),
    };
    setState(prev => ({
      ...prev,
      sessions: [newSession, ...prev.sessions],
      activeSessionId: newSession.id,
    }));
  };

  const handleDeleteSession = (sessionId: string) => {
    setState(prev => {
      const newSessions = prev.sessions.filter(s => s.id !== sessionId);
      return {
        ...prev,
        sessions: newSessions,
        activeSessionId: prev.activeSessionId === sessionId ? (newSessions[0]?.id || null) : prev.activeSessionId
      };
    });
  };

  const handleRenameSession = (sessionId: string, newTitle: string) => {
    setState(prev => ({
      ...prev,
      sessions: prev.sessions.map(s => s.id === sessionId ? { ...s, title: newTitle } : s)
    }));
  };

  const handleSelectSession = (sessionId: string) => {
    setState(prev => ({ ...prev, activeSessionId: sessionId }));
  };

  const handleAddMessage = (sessionId: string, message: { role: 'user' | 'agent', content: string }) => {
    setState(prev => ({
      ...prev,
      sessions: prev.sessions.map(s => s.id === sessionId ? {
        ...s,
        messages: [...s.messages, { id: crypto.randomUUID(), ...message, timestamp: Date.now() }]
      } : s)
    }));
  };

  const handleLoadThreads = (threads: ChatSession[]) => {
    setState(prev => {
      // Merge API threads with existing sessions, avoiding duplicates
      const existingIds = new Set(prev.sessions.map(s => s.id));
      const newThreads = threads.filter(t => !existingIds.has(t.id));
      return {
        ...prev,
        sessions: [...newThreads, ...prev.sessions],
      };
    });
  };

  const handleLogout = () => {
    setState({ user: null, sessions: [], activeSessionId: null });
    localStorage.removeItem(STORAGE_KEY);
    authLogout();
  };

  // Check authentication on mount
  useEffect(() => {
    if (isAuthenticated() && !state.user) {
      const email = getUserEmail();
      if (email) {
        setState(prev => ({
          ...prev,
          user: {
            name: email.split('@')[0], // Use email prefix as name
            email: email,
            profession: 'Other' as any,
            isRegistered: true,
          }
        }));
      }
    }
  }, []);

  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Routes>
          <Route 
            path="/" 
            element={
              state.user?.isRegistered ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <RegistrationForm onRegister={handleRegister} />
              )
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              state.user?.isRegistered ? (
                <Dashboard 
                  state={state}
                  onLogout={handleLogout}
                  onCreateSession={handleCreateSession}
                  onDeleteSession={handleDeleteSession}
                  onRenameSession={handleRenameSession}
                  onSelectSession={handleSelectSession}
                  onAddMessage={handleAddMessage}
                  onLoadThreads={handleLoadThreads}
                />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
        </Routes>
      </div>
    </HashRouter>
  );
};

export default App;
