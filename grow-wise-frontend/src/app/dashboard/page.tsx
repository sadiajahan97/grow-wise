'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import CourseCard from './course-card';
import VideoCard from './video-card';
import UserMessage from './user-message';
import AIMessage from './ai-message';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

// Function to get initials from full name
// Returns first letter of first name + first letter of last name
function getInitials(fullName: string): string {
  if (!fullName || typeof fullName !== 'string') return '';
  
  const nameParts = fullName.trim().split(/\s+/).filter(part => part.length > 0);
  
  if (nameParts.length === 0) return '';
  
  if (nameParts.length === 1) {
    const firstChar = nameParts[0][0];
    return firstChar ? firstChar.toUpperCase() : '';
  }
  
  // First letter of first name + first letter of last name
  const firstInitial = nameParts[0][0]?.toUpperCase() || '';
  const lastInitial = nameParts[nameParts.length - 1][0]?.toUpperCase() || '';
  
  return `${firstInitial}${lastInitial}`;
}

// Icon components for certifications
function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
      />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
      />
    </svg>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
      />
    </svg>
  );
}

interface Certification {
  id: number;
  staff_id: string;
  link: string;
  created_at: string;
  updated_at: string;
}

interface UserData {
  staffId: string;
  name: string;
  designation: string;
  department: string;
}

interface Profile {
  staff_id: string;
  name: string;
  department_name: string;
  designation_name: string;
}

interface StoredUser {
  id: number;
  name: string;
  designation: string;
  department: string;
}

interface Chat {
  id: number;
  staff_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

interface Message {
  id: number;
  chat_id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  updated_at: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData>({
    staffId: '',
    name: '',
    designation: '',
    department: '',
  });
  
  const [activeView, setActiveView] = useState<'recommendations' | 'profile' | 'certifications' | 'skill-assessment' | 'ai-chat'>('recommendations');
  
  const [activeTab, setActiveTab] = useState<'courses' | 'videos' | 'articles'>('courses');
  
  // Certifications state
  const [isCertFormOpen, setIsCertFormOpen] = useState(false);
  const [editingCertId, setEditingCertId] = useState<number | null>(null);
  const [certFormData, setCertFormData] = useState({
    link: '',
  });

  // AI Chat state
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [newChatName, setNewChatName] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const queryClient = useQueryClient();
  
  // Helper function to safely check localStorage
  const getLocalStorageItem = (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(key);
  };
  
  // Fetch employee profile using TanStack Query
  // Only calls API if profile doesn't exist in localStorage
  const {
    data: profile,
  } = useQuery<Profile>({
    queryKey: ['profile'],
    queryFn: async () => {
      const accessToken = getLocalStorageItem('access_token');
      if (!accessToken) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/api/employees/profile/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const profileData = await response.json();
      // Store in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('profile', JSON.stringify(profileData));
      }
      return profileData;
    },
    enabled: typeof window !== 'undefined' && !getLocalStorageItem('profile') && !!getLocalStorageItem('access_token'),
    staleTime: Infinity, // Never refetch if we have it in localStorage
  });

  // Fetch certifications using TanStack Query
  const {
    data: certifications = [],
    isLoading: isLoadingCerts,
    error: certQueryError,
  } = useQuery<Certification[]>({
    queryKey: ['certifications'],
    queryFn: async () => {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/api/employees/certifications/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch certifications');
      }

      return response.json();
    },
    enabled: activeView === 'certifications',
  });

  // Fetch chats for AI Chat view
  const {
    data: chats = [],
    isLoading: isLoadingChats,
  } = useQuery<Chat[]>({
    queryKey: ['chats'],
    queryFn: async () => {
      const accessToken = getLocalStorageItem('access_token');
      if (!accessToken) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/api/employees/chats/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch chats');
      }

      return response.json();
    },
    enabled: activeView === 'ai-chat',
  });

  // Fetch messages for selected chat
  const {
    data: messages = [],
    isLoading: isLoadingMessages,
  } = useQuery<Message[]>({
    queryKey: ['messages', selectedChatId],
    queryFn: async () => {
      if (!selectedChatId) return [];

      const accessToken = getLocalStorageItem('access_token');
      if (!accessToken) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/api/employees/chats/${selectedChatId}/messages/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      return response.json();
    },
    enabled: activeView === 'ai-chat' && selectedChatId !== null,
  });

  // Create new chat mutation
  const createChatMutation = useMutation({
    mutationFn: async (name: string) => {
      const accessToken = getLocalStorageItem('access_token');
      if (!accessToken) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/api/employees/chats/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error('Failed to create chat');
      }

      return response.json();
    },
    onSuccess: (newChat) => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      // Ensure we have the chat ID before setting it
      if (newChat && newChat.id) {
        setSelectedChatId(newChat.id);
      }
      setNewChatName('');
      setIsCreatingChat(false);
    },
  });

  // Send message to AI mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedChatId) throw new Error('No chat selected');

      const accessToken = getLocalStorageItem('access_token');
      if (!accessToken) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/api/employees/chats/${selectedChatId}/chat/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      return response.json();
    },
    onMutate: async (content: string) => {
      if (!selectedChatId) return;

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['messages', selectedChatId] });

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData<Message[]>(['messages', selectedChatId]);

      // Create a temporary ID for the optimistic message
      const tempId = -Date.now(); // Negative ID to identify optimistic messages

      // Optimistically update with user message
      const optimisticUserMessage: Message = {
        id: tempId, // Temporary negative ID
        chat_id: selectedChatId,
        role: 'user',
        content: content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Update the cache optimistically
      queryClient.setQueryData<Message[]>(['messages', selectedChatId], (old = []) => [
        ...old,
        optimisticUserMessage,
      ]);

      // Clear input immediately
      setMessageInput('');

      // Return context with the previous messages and temp ID for rollback
      return { previousMessages, tempId };
    },
    onSuccess: (data, content, context) => {
      // Replace optimistic message with real messages from server
      if (selectedChatId && data.user_message && data.ai_message && context?.tempId) {
        queryClient.setQueryData<Message[]>(['messages', selectedChatId], (old = []) => {
          // Remove the optimistic message (the one with temporary negative ID)
          const withoutOptimistic = old.filter(msg => msg.id !== context.tempId);
          // Add the real user message and AI response
          return [...withoutOptimistic, data.user_message, data.ai_message];
        });
      }
      // Invalidate chats to update the updated_at timestamp
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
    onError: (err, content, context) => {
      // Rollback to previous messages on error
      if (context?.previousMessages && selectedChatId) {
        queryClient.setQueryData(['messages', selectedChatId], context.previousMessages);
      }
      // Restore input on error
      setMessageInput(content);
    },
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load user data from localStorage or API response
  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      // If no access token, redirect to login
      router.push('/');
      return;
    }

    const loadUserData = () => {
      // First, try to get from localStorage
      const storedProfile = localStorage.getItem('profile');
      if (storedProfile) {
        try {
          const profileData: Profile = JSON.parse(storedProfile);
          setUserData({
            staffId: profileData.staff_id,
            name: profileData.name,
            designation: profileData.designation_name,
            department: profileData.department_name,
          });
          return;
        } catch (error) {
          console.error('Error parsing profile data from localStorage:', error);
        }
      }

      // If profile was fetched from API, use it
      if (profile) {
        setUserData({
          staffId: profile.staff_id,
          name: profile.name,
          designation: profile.designation_name,
          department: profile.department_name,
        });
        return;
      }

      // Fallback to old user data format if exists
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const user: StoredUser = JSON.parse(storedUser);
          setUserData({
            staffId: user.id.toString(),
            name: user.name,
            designation: user.designation,
            department: user.department,
          });
        } catch (error) {
          console.error('Error parsing user data from localStorage:', error);
        }
      }
    };

    // Load user data on mount or when profile changes
    loadUserData();

    // Listen for storage events (when localStorage is updated from another tab/window)
    const handleStorageChange = () => {
      loadUserData();
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [profile, router]);

  
  const initials = getInitials(userData.name);

  const handleMenuItemClick = (menuItem: string) => {
    if (menuItem === 'Recommendations') {
      setActiveView('recommendations');
    } else if (menuItem === 'Profile Details') {
      setActiveView('profile');
    } else if (menuItem === 'Certifications') {
      setActiveView('certifications');
    } else if (menuItem === 'Skill Assessment') {
      setActiveView('skill-assessment');
    } else if (menuItem === 'AI Chat') {
      setActiveView('ai-chat');
    }
    // Blur the dropdown trigger to close it
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement) {
      activeElement.blur();
    }
  };

  const handleSignOut = () => {
    // Remove all localStorage items
    localStorage.removeItem('access_token');
    localStorage.removeItem('profile');
    localStorage.removeItem('staff_id');
    localStorage.removeItem('is_superuser');
    
    // Redirect to auth page
    router.push('/');
  };

  // Certification handlers
  const handleAddCert = () => {
    setEditingCertId(null);
    setCertFormData({
      link: '',
    });
    setIsCertFormOpen(true);
  };

  const handleEditCert = (cert: Certification) => {
    setEditingCertId(cert.id);
    setCertFormData({
      link: cert.link,
    });
    setIsCertFormOpen(true);
  };

  // Delete certification mutation
  const deleteCertMutation = useMutation({
    mutationFn: async (id: number) => {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/api/employees/certifications/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete certification');
      }

      return id;
    },
    onSuccess: () => {
      // Invalidate and refetch certifications
      queryClient.invalidateQueries({ queryKey: ['certifications'] });
    },
  });

  const handleDeleteCert = (id: number) => {
    if (window.confirm('Are you sure you want to delete this certification?')) {
      deleteCertMutation.mutate(id);
    }
  };

  // Delete chat mutation
  const deleteChatMutation = useMutation({
    mutationFn: async (id: number) => {
      const accessToken = getLocalStorageItem('access_token');
      if (!accessToken) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/api/employees/chats/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete chat');
      }

      return id;
    },
    onSuccess: (deletedChatId) => {
      // Invalidate and refetch chats
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      // If the deleted chat was selected, clear the selection
      if (selectedChatId === deletedChatId) {
        setSelectedChatId(null);
        // Also invalidate messages for that chat
        queryClient.invalidateQueries({ queryKey: ['messages', deletedChatId] });
      }
    },
  });

  // AI Chat handlers
  const handleCreateChat = () => {
    if (newChatName.trim()) {
      createChatMutation.mutate(newChatName.trim());
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim() && selectedChatId) {
      sendMessageMutation.mutate(messageInput.trim());
    }
  };

  const handleSelectChat = (chatId: number) => {
    setSelectedChatId(chatId);
  };

  const handleDeleteChat = (chatId: number, chatName: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the chat selection
    if (window.confirm(`Are you sure you want to delete "${chatName}"? This will delete all messages in this chat.`)) {
      deleteChatMutation.mutate(chatId);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Create certification mutation
  const createCertMutation = useMutation({
    mutationFn: async (link: string) => {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/api/employees/certifications/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ link }),
      });

      if (!response.ok) {
        throw new Error('Failed to create certification');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certifications'] });
      setIsCertFormOpen(false);
      setEditingCertId(null);
      setCertFormData({ link: '' });
    },
  });

  // Update certification mutation
  const updateCertMutation = useMutation({
    mutationFn: async ({ id, link }: { id: number; link: string }) => {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/api/employees/certifications/${id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ link }),
      });

      if (!response.ok) {
        throw new Error('Failed to update certification');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certifications'] });
      setIsCertFormOpen(false);
      setEditingCertId(null);
      setCertFormData({ link: '' });
    },
  });

  const handleCertFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCertId) {
      updateCertMutation.mutate({ id: editingCertId, link: certFormData.link });
    } else {
      createCertMutation.mutate(certFormData.link);
    }
  };

  const handleCertFormCancel = () => {
    setIsCertFormOpen(false);
    setEditingCertId(null);
    setCertFormData({
      link: '',
    });
  };

  return (
    <div className="min-h-screen bg-base-200">
      {/* Navbar */}
      <div className="navbar bg-base-100 shadow-lg border-b border-base-300">
        <div className="flex-1"></div>
        <div className="flex-none gap-2">
          {/* Avatar with Dropdown */}
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar cursor-pointer">
              <div className="w-10 sm:w-12 rounded-full bg-linear-to-br from-primary to-secondary text-primary-content flex items-center justify-center text-sm sm:text-base font-semibold">
                {initials}
              </div>
            </div>
            <ul
              tabIndex={0}
              className="mt-3 z-10 p-2 shadow-lg menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
            >
              <li>
                <button onClick={() => handleMenuItemClick('Recommendations')} className="cursor-pointer">Recommendations</button>
              </li>
              <li>
                <button onClick={() => handleMenuItemClick('Profile Details')} className="cursor-pointer">Profile Details</button>
              </li>
              <li>
                <button onClick={() => handleMenuItemClick('Certifications')} className="cursor-pointer">Certifications</button>
              </li>
              <li>
                <button onClick={() => handleMenuItemClick('Skill Assessment')} className="cursor-pointer">Skill Assessment</button>
              </li>
              <li>
                <button onClick={() => handleMenuItemClick('AI Chat')} className="cursor-pointer">AI Chat</button>
              </li>
              <li>
                <hr className="my-1" />
              </li>
              <li>
                <button onClick={handleSignOut} className="text-error cursor-pointer">
                  Sign Out
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <main className={`container mx-auto px-4 sm:px-6 lg:px-8 ${activeView === 'ai-chat' ? 'py-0' : 'py-6 sm:py-8'}`}>
        {/* Dashboard Header - Always visible at the top */}
        {activeView !== 'ai-chat' && (
          <div className="relative flex items-center justify-center mb-6 sm:mb-8">
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                GrowWise
              </h1>
              <p className="mt-2 text-sm sm:text-base text-base-content/70 px-4">
                Welcome to your GrowWise dashboard
              </p>
            </div>
            {activeView === 'recommendations' && (
              <button
                className="absolute right-0 btn btn-circle bg-linear-to-br from-primary to-secondary border-0 hover:opacity-90 transition-opacity cursor-pointer"
                aria-label="Refresh"
              >
                <RefreshIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </button>
            )}
          </div>
        )}

        {activeView === 'recommendations' && (
          <div className="max-w-7xl mx-auto">
            <div className="card bg-base-100 shadow-2xl">
              {/* Header with Tabs */}
              <div className="card-body bg-linear-to-r from-primary to-secondary text-primary-content rounded-t-2xl p-4 sm:p-6">
                <div className="flex items-center gap-6 sm:gap-8">
                  <button
                    className={`text-lg sm:text-xl font-semibold pb-2 border-b-2 transition-colors cursor-pointer ${
                      activeTab === 'courses'
                        ? 'text-white border-white'
                        : 'text-white/60 border-transparent hover:text-white/80'
                    }`}
                    onClick={() => setActiveTab('courses')}
                  >
                    Courses
                  </button>
                  <button
                    className={`text-lg sm:text-xl font-semibold pb-2 border-b-2 transition-colors cursor-pointer ${
                      activeTab === 'videos'
                        ? 'text-white border-white'
                        : 'text-white/60 border-transparent hover:text-white/80'
                    }`}
                    onClick={() => setActiveTab('videos')}
                  >
                    Videos
                  </button>
                  <button
                    className={`text-lg sm:text-xl font-semibold pb-2 border-b-2 transition-colors cursor-pointer ${
                      activeTab === 'articles'
                        ? 'text-white border-white'
                        : 'text-white/60 border-transparent hover:text-white/80'
                    }`}
                    onClick={() => setActiveTab('articles')}
                  >
                    Articles
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="card-body p-4 sm:p-6 md:p-8">
                {activeTab === 'courses' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Dummy Course Data */}
                    <CourseCard
                      imageUrl="/thumbnail.png"
                      provider="Google"
                      title="Google AI Essentials"
                      skills={[
                        'Prompt Engineering',
                        'Large Language Modeling',
                        'Generative AI',
                        'AI Security',
                        'Gemini',
                        'AI Enablement',
                        'Google Workspace',
                        'Productivity Software',
                        'Artificial Intelligence and Machine Learning'
                      ]}
                      rating={4.8}
                      reviewCount={18000}
                      level="Beginner"
                      type="Specialization"
                      duration="3 - 6 Months"
                    />
                    <CourseCard
                      imageUrl="/thumbnail.png"
                      provider="Microsoft"
                      title="Azure Cloud Fundamentals"
                      skills={[
                        'Cloud Computing',
                        'Azure Services',
                        'Virtual Machines',
                        'Storage Solutions',
                        'Networking',
                        'Security'
                      ]}
                      rating={4.6}
                      reviewCount={12500}
                      level="Beginner"
                      type="Course"
                      duration="2 - 4 Months"
                    />
                    <CourseCard
                      imageUrl="/thumbnail.png"
                      provider="AWS"
                      title="AWS Certified Solutions Architect"
                      skills={[
                        'AWS Architecture',
                        'Cloud Design',
                        'Scalability',
                        'Security Best Practices',
                        'Cost Optimization',
                        'Disaster Recovery'
                      ]}
                      rating={4.9}
                      reviewCount={25000}
                      level="Intermediate"
                      type="Certification"
                      duration="4 - 8 Months"
                    />
                    <CourseCard
                      imageUrl="/thumbnail.png"
                      provider="Coursera"
                      title="Data Science Specialization"
                      skills={[
                        'Python Programming',
                        'Data Analysis',
                        'Machine Learning',
                        'Statistical Modeling',
                        'Data Visualization',
                        'SQL'
                      ]}
                      rating={4.7}
                      reviewCount={32000}
                      level="Intermediate"
                      type="Specialization"
                      duration="6 - 12 Months"
                    />
                    <CourseCard
                      imageUrl="/thumbnail.png"
                      provider="Udemy"
                      title="Full Stack Web Development"
                      skills={[
                        'React',
                        'Node.js',
                        'MongoDB',
                        'Express',
                        'JavaScript',
                        'RESTful APIs'
                      ]}
                      rating={4.5}
                      reviewCount={15000}
                      level="Beginner"
                      type="Course"
                      duration="3 - 6 Months"
                    />
                    <CourseCard
                      imageUrl="/thumbnail.png"
                      provider="LinkedIn Learning"
                      title="Project Management Professional"
                      skills={[
                        'Project Planning',
                        'Risk Management',
                        'Agile Methodologies',
                        'Stakeholder Management',
                        'Budgeting',
                        'Team Leadership'
                      ]}
                      rating={4.8}
                      reviewCount={9800}
                      level="Advanced"
                      type="Certification"
                      duration="6 - 12 Months"
                    />
                  </div>
                )}

                {activeTab === 'videos' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Dummy Video Data */}
                    <VideoCard
                      thumbnailUrl="/thumbnail.png"
                      channelName="Tech Education Hub"
                      title="Introduction to Machine Learning: Complete Beginner's Guide"
                      viewCount={1250000}
                      uploadTime="2 months ago"
                      duration="15:42"
                    />
                    <VideoCard
                      thumbnailUrl="/thumbnail.png"
                      channelName="Cloud Academy"
                      title="AWS Fundamentals: Building Your First Cloud Application"
                      viewCount={850000}
                      uploadTime="1 month ago"
                      duration="22:18"
                    />
                    <VideoCard
                      thumbnailUrl="/thumbnail.png"
                      channelName="Code Mastery"
                      title="React Hooks Explained: useState, useEffect, and More"
                      viewCount={2100000}
                      uploadTime="3 weeks ago"
                      duration="18:55"
                    />
                    <VideoCard
                      thumbnailUrl="/thumbnail.png"
                      channelName="Data Science Pro"
                      title="Python for Data Analysis: Pandas Tutorial Series"
                      viewCount={950000}
                      uploadTime="5 months ago"
                      duration="28:30"
                    />
                    <VideoCard
                      thumbnailUrl="/thumbnail.png"
                      channelName="DevOps Simplified"
                      title="Docker and Kubernetes: Container Orchestration Basics"
                      viewCount={680000}
                      uploadTime="1 week ago"
                      duration="25:12"
                    />
                    <VideoCard
                      thumbnailUrl="/thumbnail.png"
                      channelName="AI Insights"
                      title="Understanding Large Language Models: GPT Explained"
                      viewCount={3200000}
                      uploadTime="2 weeks ago"
                      duration="32:45"
                    />
                  </div>
                )}

                {activeTab === 'articles' && (
                  <div className="text-center p-8 sm:p-12">
                    <p className="text-base-content/70 text-sm sm:text-base">
                      Articles view coming soon
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeView === 'profile' && (
          <div className="max-w-2xl mx-auto">
            <div className="card bg-base-100 shadow-2xl">
              {/* Header */}
              <div className="card-body bg-linear-to-r from-primary to-secondary text-primary-content rounded-t-2xl p-4 sm:p-6">
                <h2 className="card-title text-xl sm:text-2xl text-white">Profile Details</h2>
              </div>

              {/* Profile Information */}
              <div className="card-body p-4 sm:p-6 md:p-8">
                <div className="space-y-4 sm:space-y-5">
                  {/* Staff ID */}
                  <div className="border-b border-base-300 pb-4 sm:pb-5">
                    <label className="label py-0">
                      <span className="label-text text-xs sm:text-sm font-medium opacity-70">Staff ID</span>
                    </label>
                    <p className="text-sm sm:text-base md:text-lg font-semibold mt-1">
                      {userData.staffId}
                    </p>
                  </div>

                  {/* Name */}
                  <div className="border-b border-base-300 pb-4 sm:pb-5">
                    <label className="label py-0">
                      <span className="label-text text-xs sm:text-sm font-medium opacity-70">Name</span>
                    </label>
                    <p className="text-sm sm:text-base md:text-lg font-semibold mt-1">
                      {userData.name}
                    </p>
                  </div>

                  {/* Designation */}
                  <div className="border-b border-base-300 pb-4 sm:pb-5">
                    <label className="label py-0">
                      <span className="label-text text-xs sm:text-sm font-medium opacity-70">Designation</span>
                    </label>
                    <p className="text-sm sm:text-base md:text-lg font-semibold mt-1">
                      {userData.designation}
                    </p>
                  </div>

                  {/* Department */}
                  <div className="pb-2">
                    <label className="label py-0">
                      <span className="label-text text-xs sm:text-sm font-medium opacity-70">Department</span>
                    </label>
                    <p className="text-sm sm:text-base md:text-lg font-semibold mt-1">
                      {userData.department}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'certifications' && (
          <div className="max-w-4xl mx-auto">
            <div className="card bg-base-100 shadow-2xl">
              {/* Header */}
              <div className="card-body bg-linear-to-r from-primary to-secondary text-primary-content rounded-t-2xl p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="card-title text-xl sm:text-2xl text-white">
                    My Certifications
                  </h2>
                  <button onClick={handleAddCert} className="btn btn-primary gap-2 bg-white text-primary hover:bg-base-200 border-0 cursor-pointer">
                    <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base">Add Certification</span>
                  </button>
                </div>
              </div>

              {/* Certifications List */}
              <div className="card-body p-4 sm:p-6 md:p-8">
                {(certQueryError || createCertMutation.error || updateCertMutation.error || deleteCertMutation.error) && (
                  <div className="alert alert-error mb-4">
                    <span>
                      {certQueryError instanceof Error ? certQueryError.message : 
                       createCertMutation.error instanceof Error ? createCertMutation.error.message :
                       updateCertMutation.error instanceof Error ? updateCertMutation.error.message :
                       deleteCertMutation.error instanceof Error ? deleteCertMutation.error.message :
                       'An error occurred. Please try again.'}
                    </span>
                    <button
                      className="btn btn-sm btn-ghost cursor-pointer"
                      onClick={() => {
                        queryClient.resetQueries({ queryKey: ['certifications'] });
                        createCertMutation.reset();
                        updateCertMutation.reset();
                        deleteCertMutation.reset();
                      }}
                    >
                      ✕
                    </button>
                  </div>
                )}
                {isLoadingCerts ? (
                  <div className="text-center p-8 sm:p-12">
                    <span className="loading loading-spinner loading-lg"></span>
                    <p className="mt-4 text-base-content/70 text-sm sm:text-base">
                      Loading certifications...
                    </p>
                  </div>
                ) : certifications.length === 0 ? (
                  <div className="text-center p-8 sm:p-12">
                    <p className="text-base-content/70 text-sm sm:text-base">
                      No certifications added yet. Click &quot;Add Certification&quot; to get started.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {certifications.map((cert) => (
                      <div key={cert.id} className="card bg-base-200 shadow-md">
                        <div className="card-body p-4 sm:p-6">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex-1">
                              <a
                                href={cert.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="link link-primary break-all text-sm sm:text-base cursor-pointer"
                              >
                                {cert.link}
                              </a>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditCert(cert)}
                                className="btn btn-ghost btn-sm btn-circle cursor-pointer"
                                aria-label="Edit certification"
                              >
                                <PencilIcon className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDeleteCert(cert.id)}
                                className="btn btn-ghost btn-sm btn-circle text-error cursor-pointer"
                                aria-label="Delete certification"
                                disabled={deleteCertMutation.isPending}
                              >
                                {deleteCertMutation.isPending ? (
                                  <span className="loading loading-spinner loading-sm"></span>
                                ) : (
                                  <TrashIcon className="w-5 h-5" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Add/Edit Certification Form Modal */}
            {isCertFormOpen && (
              <dialog open={isCertFormOpen} className="modal modal-open">
                <div className="modal-box max-w-2xl p-0 overflow-hidden">
                  {/* Modal Header with Gradient */}
                  <div className="bg-linear-to-r from-primary to-secondary text-primary-content p-4 sm:p-6">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-xl sm:text-2xl text-white">
                        {editingCertId ? 'Edit Certification' : 'Add Certification'}
                      </h3>
                      <form method="dialog">
                        <button
                          onClick={handleCertFormCancel}
                          className="btn btn-sm btn-circle btn-ghost text-white hover:bg-white/20 border-0 cursor-pointer"
                        >
                          ✕
                        </button>
                      </form>
                    </div>
                  </div>
                  {/* Modal Body */}
                  <form onSubmit={handleCertFormSubmit} className="p-4 sm:p-6">
                    <div className="form-control">
                      <label className="label" htmlFor="certLink">
                        <span className="label-text font-medium">
                          Certification Link <span className="text-error">*</span>
                        </span>
                      </label>
                      <input
                        type="url"
                        id="certLink"
                        required
                        value={certFormData.link}
                        onChange={(e) => setCertFormData({ ...certFormData, link: e.target.value })}
                        className="input input-bordered w-full"
                        placeholder="https://example.com/certification"
                      />
                    </div>
                    {(createCertMutation.error || updateCertMutation.error) && (
                      <div className="alert alert-error mb-4">
                        <span>
                          {createCertMutation.error instanceof Error ? createCertMutation.error.message :
                           updateCertMutation.error instanceof Error ? updateCertMutation.error.message :
                           'An error occurred. Please try again.'}
                        </span>
                      </div>
                    )}
                    <div className="modal-action">
                      <button 
                        type="button" 
                        onClick={handleCertFormCancel} 
                        className="btn cursor-pointer"
                        disabled={createCertMutation.isPending || updateCertMutation.isPending}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="btn btn-primary cursor-pointer"
                        disabled={createCertMutation.isPending || updateCertMutation.isPending}
                      >
                        {(createCertMutation.isPending || updateCertMutation.isPending) ? (
                          <>
                            <span className="loading loading-spinner loading-sm"></span>
                            {editingCertId ? 'Updating...' : 'Adding...'}
                          </>
                        ) : (
                          `${editingCertId ? 'Update' : 'Add'} Certification`
                        )}
                      </button>
                    </div>
                  </form>
                </div>
                <form method="dialog" className="modal-backdrop">
                  <button onClick={handleCertFormCancel} className="cursor-pointer">close</button>
                </form>
              </dialog>
            )}
          </div>
        )}

        {activeView === 'skill-assessment' && (
          <div className="max-w-2xl mx-auto">
            <div className="card bg-base-100 shadow-2xl">
              {/* Header */}
              <div className="card-body bg-linear-to-r from-primary to-secondary text-primary-content rounded-t-2xl p-4 sm:p-6">
                <h2 className="card-title text-xl sm:text-2xl text-white">Skill Assessment</h2>
              </div>

              {/* Content */}
              <div className="card-body p-4 sm:p-6 md:p-8">
                <div className="text-center">
                  <p className="text-base-content/70 text-sm sm:text-base">
                    Skill Assessment view coming soon
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'ai-chat' && (
          <div className="flex h-[calc(100vh-4rem)] mx-auto max-w-7xl">
            {/* Sidebar - Chat List */}
            <div className="w-64 sm:w-80 bg-base-200 border-r border-base-300 flex flex-col">
              {/* Sidebar Header */}
              <div className="bg-linear-to-r from-primary to-secondary text-primary-content p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg sm:text-xl font-bold text-white">Chats</h2>
                  <button
                    onClick={() => setIsCreatingChat(true)}
                    className="btn btn-sm btn-circle bg-white text-primary hover:bg-base-200 border-0 cursor-pointer"
                    aria-label="New chat"
                  >
                    <PlusIcon className="w-5 h-5" />
                  </button>
                </div>
                
                {/* New Chat Input */}
                {isCreatingChat && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newChatName}
                      onChange={(e) => setNewChatName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleCreateChat();
                        } else if (e.key === 'Escape') {
                          setIsCreatingChat(false);
                          setNewChatName('');
                        }
                      }}
                      placeholder="Chat name..."
                      className="input input-bordered input-sm flex-1 bg-white text-gray-900 placeholder:text-gray-500"
                      autoFocus
                    />
                    <button
                      onClick={handleCreateChat}
                      className="btn btn-sm btn-primary cursor-pointer"
                      disabled={createChatMutation.isPending || !newChatName.trim()}
                    >
                      {createChatMutation.isPending ? (
                        <span className="loading loading-spinner loading-xs"></span>
                      ) : (
                        'Create'
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setIsCreatingChat(false);
                        setNewChatName('');
                      }}
                      className="btn btn-sm btn-ghost text-white hover:bg-white/20 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* Chat List */}
              <div className="flex-1 overflow-y-auto">
                {isLoadingChats ? (
                  <div className="flex items-center justify-center p-8">
                    <span className="loading loading-spinner"></span>
                  </div>
                ) : chats.length === 0 ? (
                  <div className="p-4 text-center text-base-content/70 text-sm">
                    No chats yet. Create a new chat to get started.
                  </div>
                ) : (
                  <div className="p-2">
                    {chats.map((chat) => (
                      <div
                        key={chat.id}
                        className={`group relative w-full rounded-lg mb-2 transition-colors ${
                          selectedChatId === chat.id
                            ? 'bg-linear-to-r from-primary to-secondary text-primary-content'
                            : 'bg-base-100 hover:bg-base-300 text-base-content'
                        }`}
                      >
                        <button
                          onClick={() => handleSelectChat(chat.id)}
                          className="w-full text-left p-3 pr-10 cursor-pointer"
                        >
                          <div className="font-medium text-sm truncate">{chat.name}</div>
                          <div className={`text-xs mt-1 ${
                            selectedChatId === chat.id ? 'text-primary-content/70' : 'text-base-content/60'
                          }`}>
                            {formatTimestamp(chat.updated_at)}
                          </div>
                        </button>
                        <button
                          onClick={(e) => handleDeleteChat(chat.id, chat.name, e)}
                          className={`absolute right-2 top-1/2 -translate-y-1/2 btn btn-ghost btn-xs btn-circle opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer ${
                            selectedChatId === chat.id
                              ? 'text-primary-content hover:bg-white/20'
                              : 'text-base-content/60 hover:text-error'
                          }`}
                          aria-label="Delete chat"
                          disabled={deleteChatMutation.isPending}
                        >
                          {deleteChatMutation.isPending ? (
                            <span className="loading loading-spinner loading-xs"></span>
                          ) : (
                            <TrashIcon className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Main Chat Window */}
            <div className="flex-1 flex flex-col bg-base-100">
              {selectedChatId ? (
                <>
                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                    {isLoadingMessages ? (
                      <div className="flex items-center justify-center h-full">
                        <span className="loading loading-spinner loading-lg"></span>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-base-content/70 text-sm sm:text-base">
                          Start a conversation by sending a message below.
                        </p>
                      </div>
                    ) : (
                      <div>
                        {messages.map((message) => {
                          if (message.role === 'user') {
                            return (
                              <UserMessage
                                key={message.id}
                                content={message.content}
                                timestamp={formatTimestamp(message.created_at)}
                              />
                            );
                          } else {
                            return (
                              <AIMessage
                                key={message.id}
                                content={message.content}
                                timestamp={formatTimestamp(message.created_at)}
                              />
                            );
                          }
                        })}
                        {sendMessageMutation.isPending && (
                          <AIMessage content="Thinking..." />
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="border-t border-base-300 p-4">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="Type your message..."
                        className="input input-bordered flex-1"
                        disabled={sendMessageMutation.isPending}
                      />
                      <button
                        type="submit"
                        className="btn btn-primary cursor-pointer"
                        disabled={sendMessageMutation.isPending || !messageInput.trim()}
                      >
                        {sendMessageMutation.isPending ? (
                          <span className="loading loading-spinner loading-sm"></span>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                            />
                          </svg>
                        )}
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <p className="text-base-content/70 text-lg mb-4">
                      Select a chat or create a new one to start
                    </p>
                    <button
                      onClick={() => setIsCreatingChat(true)}
                      className="btn btn-primary cursor-pointer"
                    >
                      <PlusIcon className="w-5 h-5 mr-2" />
                      New Chat
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
