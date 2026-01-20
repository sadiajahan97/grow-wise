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
  staff_id: string;
  is_superuser: boolean;
  access_token: string;
}

interface ApiError {
  staff_id?: string | string[];
  password?: string | string[];
  detail?: string;
  non_field_errors?: string | string[];
  [key: string]: string | string[] | undefined;
}

// Custom error class for API errors
class ApiResponseError extends Error {
  isHandled = true;
  constructor(message: string) {
    super(message);
    this.name = 'ApiResponseError';
    // Prevent Next.js from treating this as an unhandled error
    Object.setPrototypeOf(this, ApiResponseError.prototype);
  }
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
  const loginMutation = useMutation<AuthResponse, ApiResponseError, LoginData>({
    mutationFn: async (data: LoginData) => {
      const response = await fetch(`${API_BASE_URL}/api/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      let responseData: ApiError | AuthResponse;
      try {
        responseData = await response.json();
      } catch {
        responseData = { detail: 'Failed to parse server response' };
      }

      if (!response.ok) {
        const errorMessage = getErrorMessage(responseData as ApiError);
        throw new ApiResponseError(errorMessage);
      }

      return responseData as AuthResponse;
    },
    // Prevent errors from propagating to Next.js error boundary
    throwOnError: false,
    onSuccess: (data) => {
      // Store staff_id, is_superuser, and access_token in localStorage
      localStorage.setItem('staff_id', data.staff_id);
      localStorage.setItem('is_superuser', JSON.stringify(data.is_superuser));
      localStorage.setItem('access_token', data.access_token);

      // Reset form and redirect to dashboard
      reset();
      router.push('/dashboard');
    },
    onError: (error) => {
      // Only log unexpected errors, not API response errors
      if (!(error instanceof ApiResponseError)) {
        console.error('Login error:', error);
      }
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
    <div className="min-h-screen hero bg-base-200 px-4 py-6 sm:py-8 lg:py-12">
      <div className="hero-content flex-col w-full max-w-md">
        <div className="card w-full shadow-2xl bg-base-100">
          {/* Header */}
          <div className="card-body bg-linear-to-r from-primary to-secondary text-primary-content rounded-t-2xl p-4 sm:p-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center">GrowWise</h1>
            <p className="text-center text-base-content/80 text-xs sm:text-sm md:text-base mt-1 sm:mt-2">
              Your Personal Growth Assistant
            </p>
          </div>

          {/* Form Content */}
          <div className="card-body p-4 sm:p-6 md:p-8">
            {/* API Error Message */}
            {apiError && (
              <div className="alert alert-error mb-4 text-xs sm:text-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-current shrink-0 h-5 w-5 sm:h-6 sm:w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-xs sm:text-sm">{apiError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSignInSubmit)} className="space-y-3 sm:space-y-4 md:space-y-5">
              {/* Staff ID Field */}
              <div className="form-control">
                <label className="label py-1 sm:py-2" htmlFor="staff_id">
                  <span className="label-text font-medium text-xs sm:text-sm md:text-base">Staff ID</span>
                </label>
                <input
                  type="text"
                  id="staff_id"
                  placeholder="Enter your staff ID"
                  {...register('staff_id', {
                    required: 'Staff ID is required',
                    pattern: {
                      value: /^\d+$/,
                      message: 'Staff ID must be a number',
                    },
                  })}
                  className={`input input-bordered w-full text-sm sm:text-base ${errors.staff_id ? 'input-error' : ''}`}
                />
                {errors.staff_id && (
                  <label className="label py-1">
                    <span className="label-text-alt text-error text-xs sm:text-sm">{errors.staff_id.message}</span>
                  </label>
                )}
              </div>

              {/* Password Field */}
              <div className="form-control">
                <label className="label py-1 sm:py-2" htmlFor="password">
                  <span className="label-text font-medium text-xs sm:text-sm md:text-base">Password</span>
                </label>
                <input
                  type="password"
                  id="password"
                  placeholder="Enter your password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                  })}
                  className={`input input-bordered w-full text-sm sm:text-base ${errors.password ? 'input-error' : ''}`}
                />
                {errors.password && (
                  <label className="label py-1">
                    <span className="label-text-alt text-error text-xs sm:text-sm">{errors.password.message}</span>
                  </label>
                )}
              </div>

              {/* Submit Button */}
              <div className="form-control mt-4 sm:mt-6">
                <button
                  type="submit"
                  className={`btn btn-primary w-full text-sm sm:text-base md:text-lg cursor-pointer ${isLoading ? 'loading' : ''}`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="loading loading-spinner loading-sm"></span>
                      <span>Signing in...</span>
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
