'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface RegisterData {
  email: string;
  password: string;
  name: string;
  designation: string;
  department: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface FormData {
  email: string;
  password: string;
  confirmPassword?: string;
  name?: string;
  designation?: string;
  department?: string;
}

interface AuthResponse {
  message: string;
  user: {
    id: number;
    email: string;
    name: string;
    designation: string;
    department: string;
  };
  refresh: string;
  access: string;
}

interface ApiError {
  email?: string | string[];
  password?: string | string[];
  detail?: string;
  non_field_errors?: string | string[];
  [key: string]: string | string[] | undefined;
}

// Helper function to extract error message from API response
function getErrorMessage(error: ApiError): string {
  if (error.email) {
    return Array.isArray(error.email) ? error.email[0] : error.email;
  }
  if (error.password) {
    return Array.isArray(error.password) ? error.password[0] : error.password;
  }
  if (error.detail) {
    return error.detail;
  }
  if (error.non_field_errors) {
    return Array.isArray(error.non_field_errors) ? error.non_field_errors[0] : error.non_field_errors;
  }
  return 'An error occurred. Please try again.';
}

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      designation: '',
      department: '',
    },
  });

  // Registration mutation
  const registerMutation = useMutation<AuthResponse, Error, RegisterData>({
    mutationFn: async (data: RegisterData) => {
      const response = await fetch(`${API_BASE_URL}/api/accounts/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage = getErrorMessage(responseData);
        throw new Error(errorMessage);
      }

      return responseData;
    },
    onSuccess: (data) => {
      // Store tokens in localStorage
      if (data.access && data.refresh) {
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      // Reset form and redirect to dashboard
      reset();
      router.push('/dashboard');
    },
    onError: (error) => {
      console.error('Registration error:', error);
    },
  });

  // Login mutation
  const loginMutation = useMutation<AuthResponse, Error, LoginData>({
    mutationFn: async (data: LoginData) => {
      const response = await fetch(`${API_BASE_URL}/api/accounts/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage = getErrorMessage(responseData);
        throw new Error(errorMessage);
      }

      return responseData;
    },
    onSuccess: (data) => {
      // Store tokens in localStorage
      if (data.access && data.refresh) {
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      // Reset form and redirect to dashboard
      reset();
      router.push('/dashboard');
    },
    onError: (error) => {
      console.error('Login error:', error);
    },
  });

  // Form submission handlers
  const onSignUpSubmit = (data: FormData) => {
    if (!data.name || !data.designation || !data.department) {
      return;
    }

    registerMutation.mutate({
      email: data.email,
      password: data.password,
      name: data.name,
      designation: data.designation,
      department: data.department,
    });
  };

  const onSignInSubmit = (data: FormData) => {
    loginMutation.mutate({
      email: data.email,
      password: data.password,
    });
  };

  // Reset form and mutation errors when switching tabs
  const handleTabChange = (tab: 'signin' | 'signup') => {
    setActiveTab(tab);
    reset();
    registerMutation.reset();
    loginMutation.reset();
  };

  const isLoading = activeTab === 'signup' ? registerMutation.isPending : loginMutation.isPending;
  const apiError =
    activeTab === 'signup'
      ? registerMutation.error
        ? registerMutation.error.message
        : null
      : loginMutation.error
        ? loginMutation.error.message
        : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4 py-8 sm:px-6 lg:px-8">
      <main className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-linear-to-r from-blue-600 to-indigo-600 p-4 sm:p-6 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">GrowWise</h1>
            <p className="text-blue-100 mt-1 sm:mt-2 text-sm sm:text-base">Your Personal Growth Assistant</p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => handleTabChange('signin')}
              className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 text-center font-medium transition-colors text-sm sm:text-base ${
                activeTab === 'signin'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-gray-700'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('signup')}
              className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 text-center font-medium transition-colors text-sm sm:text-base ${
                activeTab === 'signup'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-gray-700'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form Content */}
          <div className="p-4 sm:p-6">
            {/* API Error Message */}
            {apiError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{apiError}</p>
              </div>
            )}

            <form
              onSubmit={handleSubmit(activeTab === 'signup' ? onSignUpSubmit : onSignInSubmit)}
              className="space-y-3 sm:space-y-4"
            >
              {activeTab === 'signup' && (
                <div>
                  <label
                    htmlFor="name"
                    className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    {...register('name', {
                      required: 'Full name is required',
                      minLength: {
                        value: 2,
                        message: 'Name must be at least 2 characters',
                      },
                    })}
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors ${
                      errors.name
                        ? 'border-red-300 dark:border-red-600'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.name.message}</p>
                  )}
                </div>
              )}

              {activeTab === 'signup' && (
                <div>
                  <label
                    htmlFor="designation"
                    className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2"
                  >
                    Designation
                  </label>
                  <input
                    type="text"
                    id="designation"
                    {...register('designation', {
                      required: 'Designation is required',
                    })}
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors ${
                      errors.designation
                        ? 'border-red-300 dark:border-red-600'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Enter your designation"
                  />
                  {errors.designation && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.designation.message}</p>
                  )}
                </div>
              )}

              {activeTab === 'signup' && (
                <div>
                  <label
                    htmlFor="department"
                    className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2"
                  >
                    Department
                  </label>
                  <input
                    type="text"
                    id="department"
                    {...register('department', {
                      required: 'Department is required',
                    })}
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors ${
                      errors.department
                        ? 'border-red-300 dark:border-red-600'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Enter your department"
                  />
                  {errors.department && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.department.message}</p>
                  )}
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors ${
                    errors.email
                      ? 'border-red-300 dark:border-red-600'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                  })}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors ${
                    errors.password
                      ? 'border-red-300 dark:border-red-600'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Enter your password"
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.password.message}</p>
                )}
              </div>

              {activeTab === 'signup' && (
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2"
                  >
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (value) =>
                        value === getValues('password') || 'Passwords do not match',
                    })}
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors ${
                      errors.confirmPassword
                        ? 'border-red-300 dark:border-red-600'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Confirm your password"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              )}

              {activeTab === 'signin' && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      Remember me
                    </span>
                  </label>
                  <a
                    href="#"
                    className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-linear-to-r from-blue-600 to-indigo-600 text-white py-2.5 sm:py-3 text-sm sm:text-base rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {activeTab === 'signup' ? 'Registering...' : 'Signing in...'}
                  </span>
                ) : (
                  activeTab === 'signin' ? 'Sign In' : 'Sign Up'
                )}
              </button>
            </form>

            {activeTab === 'signup' && (
              <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-center text-gray-600 dark:text-gray-400 px-2">
                By signing up, you agree to our{' '}
                <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Privacy Policy
                </a>
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
