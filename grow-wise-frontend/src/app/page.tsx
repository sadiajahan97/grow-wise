'use client';

import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface LoginData {
  staff_id: string;
  password: string;
}

interface FormData {
  staff_id: string;
  password: string;
}

interface AuthResponse {
  message: string;
  user: {
    id: number;
    name: string;
    designation: string;
    department: string;
  };
  refresh: string;
  access: string;
}

interface ApiError {
  staff_id?: string | string[];
  password?: string | string[];
  detail?: string;
  non_field_errors?: string | string[];
  [key: string]: string | string[] | undefined;
}

// Helper function to extract error message from API response
function getErrorMessage(error: ApiError): string {
  if (error.staff_id) {
    return Array.isArray(error.staff_id) ? error.staff_id[0] : error.staff_id;
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

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    mode: 'onBlur',
    defaultValues: {
      staff_id: '',
      password: '',
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

  // Form submission handler
  const onSignInSubmit = (data: FormData) => {
    loginMutation.mutate({
      staff_id: data.staff_id,
      password: data.password,
    });
  };

  const isLoading = loginMutation.isPending;
  const apiError = loginMutation.error ? loginMutation.error.message : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4 py-8 sm:px-6 lg:px-8">
      <main className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-linear-to-r from-blue-600 to-indigo-600 p-4 sm:p-6 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">GrowWise</h1>
            <p className="text-blue-100 mt-1 sm:mt-2 text-sm sm:text-base">Your Personal Growth Assistant</p>
          </div>

          {/* Form Content */}
          <div className="p-4 sm:p-6">
            {/* API Error Message */}
            {apiError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{apiError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSignInSubmit)} className="space-y-3 sm:space-y-4">
              <div>
                <label
                  htmlFor="staff_id"
                  className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2"
                >
                  Staff ID
                </label>
                <input
                  type="text"
                  id="staff_id"
                  {...register('staff_id', {
                    required: 'Staff ID is required',
                    pattern: {
                      value: /^\d+$/,
                      message: 'Staff ID must be a number',
                    },
                  })}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors ${
                    errors.staff_id
                      ? 'border-red-300 dark:border-red-600'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Enter your staff ID"
                />
                {errors.staff_id && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.staff_id.message}</p>
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
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
