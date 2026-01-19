'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import CourseCard from './course-card';
import VideoCard from './video-card';

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

interface StoredUser {
  id: number;
  name: string;
  designation: string;
  department: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData>({
    staffId: '',
    name: '',
    designation: '',
    department: '',
  });
  
  const [activeView, setActiveView] = useState<'recommendations' | 'profile' | 'certifications' | 'skill-assessment'>('recommendations');
  
  const [activeTab, setActiveTab] = useState<'courses' | 'videos' | 'articles'>('courses');
  
  // Certifications state
  const [isCertFormOpen, setIsCertFormOpen] = useState(false);
  const [editingCertId, setEditingCertId] = useState<number | null>(null);
  const [certFormData, setCertFormData] = useState({
    link: '',
  });
  
  const queryClient = useQueryClient();
  
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

  // Load user data from localStorage in useEffect
  useEffect(() => {
    const loadUserData = () => {
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

    // Load user data on mount
    loadUserData();

    // Listen for storage events (when localStorage is updated from another tab/window)
    const handleStorageChange = () => {
      loadUserData();
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  
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
    }
    // Blur the dropdown trigger to close it
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement) {
      activeElement.blur();
    }
  };

  const handleSignOut = () => {
    // Remove all three localStorage items
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    
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
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
              <div className="w-10 sm:w-12 rounded-full bg-linear-to-br from-primary to-secondary text-primary-content flex items-center justify-center text-sm sm:text-base font-semibold">
                {initials}
              </div>
            </div>
            <ul
              tabIndex={0}
              className="mt-3 z-10 p-2 shadow-lg menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
            >
              <li>
                <button onClick={() => handleMenuItemClick('Recommendations')}>Recommendations</button>
              </li>
              <li>
                <button onClick={() => handleMenuItemClick('Profile Details')}>Profile Details</button>
              </li>
              <li>
                <button onClick={() => handleMenuItemClick('Certifications')}>Certifications</button>
              </li>
              <li>
                <button onClick={() => handleMenuItemClick('Skill Assessment')}>Skill Assessment</button>
              </li>
              <li>
                <hr className="my-1" />
              </li>
              <li>
                <button onClick={handleSignOut} className="text-error">
                  Sign Out
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Dashboard Header - Always visible at the top */}
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
              className="absolute right-0 btn btn-circle bg-linear-to-br from-primary to-secondary border-0 hover:opacity-90 transition-opacity"
              aria-label="Refresh"
            >
              <RefreshIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </button>
          )}
        </div>

        {activeView === 'recommendations' && (
          <div className="max-w-7xl mx-auto">
            <div className="card bg-base-100 shadow-2xl">
              {/* Header with Tabs */}
              <div className="card-body bg-linear-to-r from-primary to-secondary text-primary-content rounded-t-2xl p-4 sm:p-6">
                <div className="flex items-center gap-6 sm:gap-8">
                  <button
                    className={`text-lg sm:text-xl font-semibold pb-2 border-b-2 transition-colors ${
                      activeTab === 'courses'
                        ? 'text-white border-white'
                        : 'text-white/60 border-transparent hover:text-white/80'
                    }`}
                    onClick={() => setActiveTab('courses')}
                  >
                    Courses
                  </button>
                  <button
                    className={`text-lg sm:text-xl font-semibold pb-2 border-b-2 transition-colors ${
                      activeTab === 'videos'
                        ? 'text-white border-white'
                        : 'text-white/60 border-transparent hover:text-white/80'
                    }`}
                    onClick={() => setActiveTab('videos')}
                  >
                    Videos
                  </button>
                  <button
                    className={`text-lg sm:text-xl font-semibold pb-2 border-b-2 transition-colors ${
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
                  <button onClick={handleAddCert} className="btn btn-primary gap-2 bg-white text-primary hover:bg-base-200 border-0">
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
                      className="btn btn-sm btn-ghost"
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
                                className="link link-primary break-all text-sm sm:text-base"
                              >
                                {cert.link}
                              </a>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditCert(cert)}
                                className="btn btn-ghost btn-sm btn-circle"
                                aria-label="Edit certification"
                              >
                                <PencilIcon className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDeleteCert(cert.id)}
                                className="btn btn-ghost btn-sm btn-circle text-error"
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
                          className="btn btn-sm btn-circle btn-ghost text-white hover:bg-white/20 border-0"
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
                        className="btn"
                        disabled={createCertMutation.isPending || updateCertMutation.isPending}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="btn btn-primary"
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
                  <button onClick={handleCertFormCancel}>close</button>
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
      </main>
    </div>
  );
}
