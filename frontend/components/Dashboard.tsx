
import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import ArticleCard from './ArticleCard';
import CourseCard from './CourseCard';
import VideoCard from './VideoCard';
import { AppState, Agent, ChatSession } from '../types';
import { AGENTS } from '../constants';
import {
  getArticleRecommendations,
  getCourseRecommendations,
  getVideoRecommendations,
  generateRecommendations,
  Recommendation,
} from '../services/recommendationsService';
import { sendChatMessage } from '../services/chatbotService';

interface DashboardProps {
  state: AppState;
  onLogout: () => void;
  onCreateSession: (agentId: string) => void;
  onCreateSessionFromThread?: (threadId: string, title: string, agentId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onRenameSession: (sessionId: string, newTitle: string) => void;
  onSelectSession: (sessionId: string) => void;
  onAddMessage: (sessionId: string, message: { role: 'user' | 'agent', content: string }) => void;
  onLoadThreads?: (threads: ChatSession[]) => void;
  refreshThreadsTrigger?: number;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  state, 
  onLogout, 
  onCreateSession, 
  onCreateSessionFromThread,
  onDeleteSession, 
  onRenameSession, 
  onSelectSession,
  onAddMessage,
  onLoadThreads,
  refreshThreadsTrigger
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'articles' | 'courses' | 'videos' | 'chat'>('articles');
  const [articles, setArticles] = useState<Recommendation[]>([]);
  const [courses, setCourses] = useState<Recommendation[]>([]);
  const [videos, setVideos] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generalChatInput, setGeneralChatInput] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const activeSession = state.sessions.find(s => s.id === state.activeSessionId);
  const activeAgent = activeSession ? AGENTS.find(a => a.id === activeSession.agentId) : null;

  // Fetch recommendations when tab changes
  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoading(true);
      try {
        if (activeTab === 'articles') {
          const data = await getArticleRecommendations();
          setArticles(data);
        } else if (activeTab === 'courses') {
          const data = await getCourseRecommendations();
          setCourses(data);
        } else if (activeTab === 'videos') {
          const data = await getVideoRecommendations();
          setVideos(data);
        }
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (activeTab !== 'chat') {
      fetchRecommendations();
    }
  }, [activeTab]);

  const handleGenerateRecommendations = async () => {
    setIsGenerating(true);
    try {
      await generateRecommendations(state.user?.profession);
      // Refresh the current tab's recommendations
      if (activeTab === 'articles') {
        const data = await getArticleRecommendations();
        setArticles(data);
      } else if (activeTab === 'courses') {
        const data = await getCourseRecommendations();
        setCourses(data);
      } else if (activeTab === 'videos') {
        const data = await getVideoRecommendations();
        setVideos(data);
      }
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
      alert('Failed to generate recommendations. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGeneralChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!generalChatInput.trim() || isSendingMessage) return;

    const message = generalChatInput.trim();
    setGeneralChatInput('');
    setIsSendingMessage(true);

    try {
      // Send message to chatbot API (creates new thread if needed)
      const response = await sendChatMessage(message);
      
      // Create a new session from the thread (this will fetch messages from API)
      const defaultAgentId = AGENTS[0]?.id || '';
      
      if (onCreateSessionFromThread) {
        // Use the handler to create session from thread
        // This will automatically fetch messages from the API including the user message and AI response
        await onCreateSessionFromThread(response.thread_id, response.title, defaultAgentId);
        // Small delay to ensure backend has persisted everything
        await new Promise(resolve => setTimeout(resolve, 300));
        onSelectSession(response.thread_id);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
      setGeneralChatInput(message); // Restore the message
    } finally {
      setIsSendingMessage(false);
    }
  };

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
          activeTab={activeTab}
          onTabChange={setActiveTab}
          refreshThreadsTrigger={refreshThreadsTrigger}
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

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          {activeTab === 'chat' ? (
            // Chat view
            activeSession && activeAgent ? (
              <ChatWindow 
                session={activeSession} 
                agent={activeAgent}
                onSendMessage={(content) => onAddMessage(activeSession.id, { role: 'user', content })}
                onReceiveResponse={(content) => onAddMessage(activeSession.id, { role: 'agent', content })}
              />
            ) : (
              <div className="h-full flex flex-col bg-slate-50">
                {/* Welcome Section */}
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">Start a Conversation</h3>
                  <p className="text-slate-500 max-w-md mb-8">Ask me anything or choose a specialized learning path below.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl w-full mb-8">
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

                {/* General Chat Input */}
                <div className="p-4 bg-white border-t border-slate-200">
                  <form onSubmit={handleGeneralChatSubmit} className="relative max-w-4xl mx-auto flex items-center gap-2">
                    <input
                      type="text"
                      className="w-full bg-slate-100 text-slate-900 border-none rounded-xl px-5 py-4 focus:ring-2 focus:ring-indigo-500 outline-none pr-14 transition-all"
                      placeholder="Type your message here..."
                      value={generalChatInput}
                      onChange={(e) => setGeneralChatInput(e.target.value)}
                      disabled={isSendingMessage}
                    />
                    <button 
                      type="submit"
                      disabled={!generalChatInput.trim() || isSendingMessage}
                      className={`absolute right-2 p-2 rounded-lg transition-all ${generalChatInput.trim() && !isSendingMessage ? 'bg-indigo-600 text-white shadow-md hover:bg-indigo-700' : 'text-slate-400'}`}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                    </button>
                  </form>
                  <p className="text-[10px] text-center text-slate-400 mt-2">GrowWise may produce inaccurate information about people, places, or facts.</p>
                </div>
              </div>
            )
          ) : (
            // Recommendations view
            <div className="h-full overflow-y-auto bg-slate-50 p-6">
              <div className="max-w-7xl mx-auto">
                {/* Header with Generate Button */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 capitalize">{activeTab}</h2>
                    <p className="text-slate-500 mt-1">Personalized recommendations for your learning journey</p>
                  </div>
                  <button
                    onClick={handleGenerateRecommendations}
                    disabled={isGenerating}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Generate Recommendations
                      </>
                    )}
                  </button>
                </div>

                {/* Loading State */}
                {isLoading && (
                  <div className="flex items-center justify-center py-12">
                    <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}

                {/* Recommendations Grid */}
                {!isLoading && (
                  <>
                    {activeTab === 'articles' && (
                      articles.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {articles.map((article) => (
                            <ArticleCard
                              key={article.id}
                              title={article.title}
                              url={article.url}
                              thumbnail_url={null}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <p className="text-slate-500 mb-4">No article recommendations yet.</p>
                          <button
                            onClick={handleGenerateRecommendations}
                            disabled={isGenerating}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                          >
                            Generate Recommendations
                          </button>
                        </div>
                      )
                    )}

                    {activeTab === 'courses' && (
                      courses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {courses.map((course) => (
                            <CourseCard
                              key={course.id}
                              title={course.title}
                              url={course.url}
                              thumbnail_url={null}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <p className="text-slate-500 mb-4">No course recommendations yet.</p>
                          <button
                            onClick={handleGenerateRecommendations}
                            disabled={isGenerating}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                          >
                            Generate Recommendations
                          </button>
                        </div>
                      )
                    )}

                    {activeTab === 'videos' && (
                      videos.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {videos.map((video) => (
                            <VideoCard
                              key={video.id}
                              title={video.title}
                              url={video.url}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <p className="text-slate-500 mb-4">No video recommendations yet.</p>
                          <button
                            onClick={handleGenerateRecommendations}
                            disabled={isGenerating}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                          >
                            Generate Recommendations
                          </button>
                        </div>
                      )
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
