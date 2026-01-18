'use client';

import { useState, useEffect, useRef } from 'react';

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

// Bell icon component
function BellIcon({ className }: { className?: string }) {
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
        d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
      />
    </svg>
  );
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

interface Certification {
  id: string;
  link: string;
}

interface UserData {
  staffId: string;
  name: string;
  designation: string;
  department: string;
  email: string;
}

interface StoredUser {
  id: number;
  email: string;
  name: string;
  designation: string;
  department: string;
}

export default function Dashboard() {
  const [userData, setUserData] = useState<UserData>({
    staffId: '',
    name: '',
    designation: '',
    department: '',
    email: '',
  });
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeView, setActiveView] = useState<'profile' | 'certifications' | 'skill-assessment'>('profile');
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Certifications state
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [isCertFormOpen, setIsCertFormOpen] = useState(false);
  const [editingCertId, setEditingCertId] = useState<string | null>(null);
  const [certFormData, setCertFormData] = useState({
    link: '',
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
            email: user.email,
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

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleMenuItemClick = (menuItem: string) => {
    if (menuItem === 'Profile Details') {
      setActiveView('profile');
    } else if (menuItem === 'Certifications') {
      setActiveView('certifications');
    } else if (menuItem === 'Skill Assessment') {
      setActiveView('skill-assessment');
    }
    setIsDropdownOpen(false);
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

  const handleDeleteCert = (id: string) => {
    if (window.confirm('Are you sure you want to delete this certification?')) {
      setCertifications(certifications.filter((cert) => cert.id !== id));
    }
  };

  const handleCertFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCertId) {
      // Update existing certification
      setCertifications(
        certifications.map((cert) =>
          cert.id === editingCertId
            ? {
                ...cert,
                link: certFormData.link,
              }
            : cert
        )
      );
    } else {
      // Add new certification
      const newCert: Certification = {
        id: Date.now().toString(),
        link: certFormData.link,
      };
      setCertifications([...certifications, newCert]);
    }
    
    setIsCertFormOpen(false);
    setEditingCertId(null);
    setCertFormData({
      link: '',
    });
  };

  const handleCertFormCancel = () => {
    setIsCertFormOpen(false);
    setEditingCertId(null);
    setCertFormData({
      link: '',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navbar */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-end items-center h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              {/* Notification Bell Icon */}
              <button
                className="relative p-1.5 sm:p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Notifications"
              >
                <BellIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                {/* Optional: Notification badge */}
                <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 block h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800"></span>
              </button>

              {/* Avatar with Initials and Dropdown */}
              <div className="relative flex items-center" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
                  aria-label="User menu"
                  aria-expanded={isDropdownOpen}
                >
                  {initials}
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 top-10 sm:top-12 mt-2 w-48 sm:w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                    <button
                      onClick={() => handleMenuItemClick('Profile Details')}
                      className="w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      Profile Details
                    </button>
                    <button
                      onClick={() => handleMenuItemClick('Certifications')}
                      className="w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      Certifications
                    </button>
                    <button
                      onClick={() => handleMenuItemClick('Skill Assessment')}
                      className="w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      Skill Assessment
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
        {/* Dashboard Header - Always visible at the top */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400 px-4">
            Welcome to your GrowWise dashboard
          </p>
        </div>

        {activeView === 'profile' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Header */}
              <div className="bg-linear-to-r from-blue-600 to-indigo-600 px-4 sm:px-6 py-4 sm:py-5">
                <h2 className="text-xl sm:text-2xl font-bold text-white">Profile Details</h2>
              </div>

              {/* Profile Information */}
              <div className="px-4 sm:px-6 py-6 sm:py-8">
                <div className="space-y-4 sm:space-y-5">
                  {/* Staff ID */}
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-4 sm:pb-5">
                    <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 sm:mb-2">
                      Staff ID
                    </label>
                    <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white">
                      {userData.staffId}
                    </p>
                  </div>

                  {/* Name */}
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-4 sm:pb-5">
                    <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 sm:mb-2">
                      Name
                    </label>
                    <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white">
                      {userData.name}
                    </p>
                  </div>

                  {/* Designation */}
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-4 sm:pb-5">
                    <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 sm:mb-2">
                      Designation
                    </label>
                    <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white">
                      {userData.designation}
                    </p>
                  </div>

                  {/* Department */}
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-4 sm:pb-5">
                    <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 sm:mb-2">
                      Department
                    </label>
                    <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white">
                      {userData.department}
                    </p>
                  </div>

                  {/* Email */}
                  <div className="pb-2">
                    <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 sm:mb-2">
                      Email
                    </label>
                    <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white break-all">
                      {userData.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'certifications' && (
          <div className="max-w-4xl mx-auto">
            {/* Header with Add Button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                My Certifications
              </h2>
              <button
                onClick={handleAddCert}
                className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm sm:text-base"
              >
                <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                Add Certification
              </button>
            </div>

            {/* Certifications List */}
            {certifications.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-8 sm:p-12 text-center">
                <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                  No certifications added yet. Click &quot;Add Certification&quot; to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {certifications.map((cert) => (
                  <div
                    key={cert.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4 sm:p-6"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex-1">
                        <a
                          href={cert.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline break-all text-sm sm:text-base"
                        >
                          {cert.link}
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditCert(cert)}
                          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          aria-label="Edit certification"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCert(cert.id)}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          aria-label="Delete certification"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add/Edit Certification Form Modal */}
            {isCertFormOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="bg-linear-to-r from-blue-600 to-indigo-600 px-4 sm:px-6 py-4 sm:py-5">
                    <h3 className="text-xl sm:text-2xl font-bold text-white">
                      {editingCertId ? 'Edit Certification' : 'Add Certification'}
                    </h3>
                  </div>
                  <form onSubmit={handleCertFormSubmit} className="p-4 sm:p-6">
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="certLink"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                          Certification Link <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="url"
                          id="certLink"
                          required
                          value={certFormData.link}
                          onChange={(e) =>
                            setCertFormData({ ...certFormData, link: e.target.value })
                          }
                          className="w-full px-3 sm:px-4 py-2.5 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          placeholder="https://example.com/certification"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
                      <button
                        type="button"
                        onClick={handleCertFormCancel}
                        className="px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm sm:text-base bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors"
                      >
                        {editingCertId ? 'Update' : 'Add'} Certification
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {activeView === 'skill-assessment' && (
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Skill Assessment
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400 px-4">
              Skill Assessment view coming soon
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

