
import React, { useState } from 'react';
import { AppState, Agent } from '../types';
import { AGENTS } from '../constants';

interface SidebarProps {
  state: AppState;
  onCreateSession: (agentId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onRenameSession: (sessionId: string, newTitle: string) => void;
  onSelectSession: (sessionId: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  state, 
  onCreateSession, 
  onDeleteSession, 
  onRenameSession, 
  onSelectSession,
  onLogout
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleStartRename = (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();
    setEditingId(id);
    setEditValue(title);
  };

  const handleSaveRename = (id: string) => {
    if (editValue.trim()) {
      onRenameSession(id, editValue.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 text-slate-300">
      {/* Brand */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-white">G</div>
        <h1 className="text-xl font-bold text-white tracking-tight">GrowWise</h1>
      </div>

      {/* New Session Section */}
      <div className="p-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">New Learning Path</p>
        <div className="grid grid-cols-2 gap-2">
          {AGENTS.map(agent => (
            <button
              key={agent.id}
              onClick={() => onCreateSession(agent.id)}
              className="flex items-center gap-2 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors text-xs"
              title={agent.role}
            >
              <img src={agent.avatar} className="w-5 h-5 rounded-full" alt="" />
              <span className="truncate">{agent.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Session History */}
      <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">Active Conversations</p>
        <div className="space-y-1">
          {state.sessions.length === 0 && (
            <p className="text-xs text-slate-600 px-2 py-4 italic">No active sessions.</p>
          )}
          {state.sessions.map(session => (
            <div
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${state.activeSessionId === session.id ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'hover:bg-slate-800 border border-transparent'}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                {editingId === session.id ? (
                  <input
                    autoFocus
                    className="bg-slate-700 text-white text-sm px-1 rounded outline-none w-full"
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    onBlur={() => handleSaveRename(session.id)}
                    onKeyDown={e => e.key === 'Enter' && handleSaveRename(session.id)}
                    onClick={e => e.stopPropagation()}
                  />
                ) : (
                  <span className="text-sm font-medium truncate">{session.title}</span>
                )}
              </div>
              
              <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${editingId === session.id ? 'hidden' : ''}`}>
                <button 
                  onClick={(e) => handleStartRename(e, session.id, session.title)}
                  className="p-1 hover:bg-slate-700 rounded transition-colors text-slate-400"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDeleteSession(session.id); }}
                  className="p-1 hover:bg-red-900/40 hover:text-red-400 rounded transition-colors text-slate-400"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-900/20 hover:text-red-400 transition-all text-sm font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
