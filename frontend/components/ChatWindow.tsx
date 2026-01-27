
import React, { useState, useRef, useEffect } from 'react';
import { ChatSession, Agent, Message } from '../types';
import { generateAgentResponse } from '../services/geminiService';

interface ChatWindowProps {
  session: ChatSession;
  agent: Agent;
  onSendMessage: (content: string) => void;
  onReceiveResponse: (content: string) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ session, agent, onSendMessage, onReceiveResponse }) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [session.messages, isTyping]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const currentInput = input;
    setInput('');
    onSendMessage(currentInput);
    
    setIsTyping(true);
    try {
      const response = await generateAgentResponse(agent, session.messages, currentInput);
      onReceiveResponse(response);
    } catch (err) {
      onReceiveResponse("I'm having trouble thinking right now. Please try again later.");
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Scrollable messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {session.messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <img src={agent.avatar} className="w-20 h-20 rounded-2xl shadow-lg mb-4" alt={agent.name} />
            <h4 className="text-xl font-bold text-slate-800">Chatting with {agent.name}</h4>
            <p className="text-slate-500 max-w-sm mt-2">I am ready to help you with {agent.role.toLowerCase()}. What would you like to learn today?</p>
          </div>
        )}
        
        {session.messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className="flex-shrink-0">
                <img 
                  src={msg.role === 'user' ? `https://ui-avatars.com/api/?name=User&background=64748b&color=fff` : agent.avatar} 
                  className="w-9 h-9 rounded-lg"
                  alt=""
                />
              </div>
              <div className={`p-4 rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none'}`}>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                <span className={`text-[10px] mt-2 block ${msg.role === 'user' ? 'text-indigo-200' : 'text-slate-400'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="flex gap-3">
              <img src={agent.avatar} className="w-9 h-9 rounded-lg opacity-50" alt="" />
              <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto flex items-center gap-2">
          <input
            type="text"
            className="w-full bg-slate-100 text-slate-900 border-none rounded-xl px-5 py-4 focus:ring-2 focus:ring-indigo-500 outline-none pr-14 transition-all"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
          />
          <button 
            type="submit"
            disabled={!input.trim() || isTyping}
            className={`absolute right-2 p-2 rounded-lg transition-all ${input.trim() && !isTyping ? 'bg-indigo-600 text-white shadow-md hover:bg-indigo-700' : 'text-slate-400'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </form>
        <p className="text-[10px] text-center text-slate-400 mt-2">GrowWise may produce inaccurate information about people, places, or facts.</p>
      </div>
    </div>
  );
};

export default ChatWindow;
