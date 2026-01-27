
import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import RegistrationForm from './components/RegistrationForm';
import Dashboard from './components/Dashboard';
import { User, ChatSession, AppState } from './types';
import { isAuthenticated, getUserEmail, logout as authLogout } from './services/authService';
import { deleteThread, getThreadDetail } from './services/chatbotService';

const USER_STORAGE_KEY = 'growwise_user';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    // Only load user from localStorage, not sessions
    const saved = localStorage.getItem(USER_STORAGE_KEY);
    if (saved) {
      try {
        const userData = JSON.parse(saved);
        return {
          user: userData,
          sessions: [], // Always start with empty sessions, fetch from API
          activeSessionId: null,
        };
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
  const [refreshThreadsTrigger, setRefreshThreadsTrigger] = useState(0);

  // Only save user to localStorage, not sessions
  useEffect(() => {
    if (state.user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(state.user));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, [state.user]);

  const handleRegister = (user: User) => {
    setState(prev => ({ ...prev, user }));
  };

  const handleCreateSession = (agentId: string) => {
    // Create a local-only session (not persisted to backend until first message)
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

  const handleCreateSessionFromThread = async (threadId: string, title: string, agentId: string) => {
    // Fetch messages for this thread immediately
    let messages: Array<{ id: string; role: 'user' | 'agent'; content: string; timestamp: number }> = [];
    try {
      const threadDetail = await getThreadDetail(threadId);
      messages = threadDetail.messages.map((msg, idx) => {
        // LangGraph uses 'human' for user and 'ai' for assistant
        // Backend might also return 'assistant' or 'user'
        const isAgent = msg.role === 'assistant' || msg.role === 'ai';
        return {
          id: `${threadId}-${idx}`,
          role: isAgent ? 'agent' : 'user',
          content: msg.content,
          timestamp: Date.now() - (threadDetail.messages.length - idx) * 1000,
        };
      });
    } catch (error) {
      console.error('Failed to fetch thread messages:', error);
    }
    
    const newSession: ChatSession = {
      id: threadId,
      title: title,
      agentId,
      messages: messages,
      createdAt: Date.now(),
    };
    setState(prev => ({
      ...prev,
      sessions: [newSession, ...prev.sessions],
      activeSessionId: newSession.id,
    }));
    // Trigger thread refetch when a new thread-based session is created
    setRefreshThreadsTrigger(prev => prev + 1);
  };

  const handleDeleteSession = async (sessionId: string) => {
    // Delete from backend if it's a thread-based session (UUID format)
    try {
      // Check if sessionId looks like a UUID (thread ID)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(sessionId)) {
        await deleteThread(sessionId);
      }
    } catch (error) {
      console.error('Error deleting thread:', error);
    }
    
    setState(prev => {
      const newSessions = prev.sessions.filter(s => s.id !== sessionId);
      return {
        ...prev,
        sessions: newSessions,
        activeSessionId: prev.activeSessionId === sessionId ? (newSessions[0]?.id || null) : prev.activeSessionId
      };
    });
    // Trigger thread refetch when a session is deleted
    setRefreshThreadsTrigger(prev => prev + 1);
  };

  const handleRenameSession = (sessionId: string, newTitle: string) => {
    setState(prev => ({
      ...prev,
      sessions: prev.sessions.map(s => s.id === sessionId ? { ...s, title: newTitle } : s)
    }));
  };

  const handleSelectSession = async (sessionId: string) => {
    setState(prev => ({ ...prev, activeSessionId: sessionId }));
    
    // Fetch messages for this thread from API if it's a thread-based session
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(sessionId)) {
      try {
        const threadDetail = await getThreadDetail(sessionId);
        
        // Update session with messages from API
        setState(prev => ({
          ...prev,
          sessions: prev.sessions.map(s => {
            if (s.id === sessionId) {
              return {
                ...s,
                title: threadDetail.thread.title,
                messages: threadDetail.messages.map((msg, idx) => {
                  // LangGraph uses 'human' for user and 'ai' for assistant
                  const isAgent = msg.role === 'assistant' || msg.role === 'ai';
                  return {
                    id: `${sessionId}-${idx}`,
                    role: isAgent ? 'agent' : 'user',
                    content: msg.content,
                    timestamp: Date.now() - (threadDetail.messages.length - idx) * 1000, // Approximate timestamps
                  };
                }),
              };
            }
            return s;
          }),
        }));
      } catch (error) {
        console.error('Failed to fetch thread messages:', error);
      }
    }
  };

  const handleAddMessage = (sessionId: string, message: { role: 'user' | 'agent', content: string }) => {
    // Optimistically update UI, but messages are persisted on backend
    setState(prev => ({
      ...prev,
      sessions: prev.sessions.map(s => s.id === sessionId ? {
        ...s,
        messages: [...s.messages, { id: crypto.randomUUID(), ...message, timestamp: Date.now() }]
      } : s)
    }));
    
    // After sending message, refetch thread to get latest messages from API
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(sessionId) && message.role === 'agent') {
      // Refetch thread messages after agent response
      setTimeout(async () => {
        try {
          const threadDetail = await getThreadDetail(sessionId);
          
          setState(prev => ({
            ...prev,
            sessions: prev.sessions.map(s => {
              if (s.id === sessionId) {
                return {
                  ...s,
                  messages: threadDetail.messages.map((msg, idx) => {
                    // LangGraph uses 'human' for user and 'ai' for assistant
                    const isAgent = msg.role === 'assistant' || msg.role === 'ai';
                    return {
                      id: `${sessionId}-${idx}`,
                      role: isAgent ? 'agent' : 'user',
                      content: msg.content,
                      timestamp: Date.now() - (threadDetail.messages.length - idx) * 1000,
                    };
                  }),
                };
              }
              return s;
            }),
          }));
        } catch (error) {
          console.error('Failed to refetch thread messages:', error);
        }
      }, 500);
    }
  };

  const handleLoadThreads = (threads: ChatSession[]) => {
    // Replace sessions with threads from API (no merging, API is source of truth)
    setState(prev => ({
      ...prev,
      sessions: threads, // Use threads from API as source of truth
    }));
  };

  const handleLogout = () => {
    setState({ user: null, sessions: [], activeSessionId: null });
    localStorage.removeItem(USER_STORAGE_KEY);
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
                         onCreateSessionFromThread={handleCreateSessionFromThread}
                         onDeleteSession={handleDeleteSession}
                         onRenameSession={handleRenameSession}
                         onSelectSession={handleSelectSession}
                         onAddMessage={handleAddMessage}
                         onLoadThreads={handleLoadThreads}
                         refreshThreadsTrigger={refreshThreadsTrigger}
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
