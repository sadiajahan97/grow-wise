
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import { AppState, Agent, ChatSession } from '../types';
import { AGENTS } from '../constants';

interface DashboardProps {
  state: AppState;
  onLogout: () => void;
  onCreateSession: (agentId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onRenameSession: (sessionId: string, newTitle: string) => void;
  onSelectSession: (sessionId: string) => void;
  onAddMessage: (sessionId: string, message: { role: 'user' | 'agent', content: string }) => void;
  onLoadThreads?: (threads: ChatSession[]) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  state, 
  onLogout, 
  onCreateSession, 
  onDeleteSession, 
  onRenameSession, 
  onSelectSession,
  onAddMessage,
  onLoadThreads
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const activeSession = state.sessions.find(s => s.id === state.activeSessionId);
  const activeAgent = activeSession ? AGENTS.find(a => a.id === activeSession.agentId) : null;

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Sidebar - Desktop */}
      <div className={`${isSidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 border-r border-slate-200 hidden md:block`}>
        <Sidebar 
          state={state} 
          onCreateSession={onCreateSession}
          onDeleteSession={onDeleteSession}
          onRenameSession={onRenameSession}
          onSelectSession={onSelectSession}
          onLogout={onLogout}
          onLoadThreads={onLoadThreads}
        />
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header/Controls */}
        <header className="h-16 border-b border-slate-200 flex items-center justify-between px-4 bg-white/80 backdrop-blur-md z-10">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-slate-100 rounded-md md:block hidden"
          >
            <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-slate-800">
              {activeSession ? activeSession.title : 'Welcome, ' + state.user?.name}
            </h2>
          </div>

          <div className="flex items-center gap-3">
             {state.user && (
               <div className="text-right hidden sm:block">
                 <p className="text-sm font-medium leading-none">{state.user.name}</p>
                 <p className="text-xs text-slate-500">{state.user.profession}</p>
               </div>
             )}
             <img src={`https://ui-avatars.com/api/?name=${state.user?.name}&background=6366f1&color=fff`} className="w-8 h-8 rounded-full" alt="avatar" />
          </div>
        </header>

        {/* Chat Content */}
        <main className="flex-1 overflow-hidden">
          {activeSession && activeAgent ? (
            <ChatWindow 
              session={activeSession} 
              agent={activeAgent}
              onSendMessage={(content) => onAddMessage(activeSession.id, { role: 'user', content })}
              onReceiveResponse={(content) => onAddMessage(activeSession.id, { role: 'agent', content })}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-slate-50">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Select a Learning Path</h3>
              <p className="text-slate-500 max-w-md mb-8">Choose an AI agent from the sidebar or select a specialty below to start your personalized session.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl w-full">
                {AGENTS.map(agent => (
                  <button
                    key={agent.id}
                    onClick={() => onCreateSession(agent.id)}
                    className="flex flex-col items-start p-6 bg-white border border-slate-200 rounded-xl hover:border-indigo-400 hover:shadow-lg transition-all text-left"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <img src={agent.avatar} className="w-10 h-10 rounded-lg" alt={agent.name} />
                      <span className="font-semibold text-slate-800">{agent.name}</span>
                    </div>
                    <p className="text-sm text-slate-500">{agent.role}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
