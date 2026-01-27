const API_BASE_URL = 'http://localhost:8000';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  profession_id?: number;
}

export interface AuthResponse {
  message: string;
  email: string;
  name?: string;
  is_superuser: boolean;
  access_token: string;
}

export interface ApiError {
  message: string;
  detail?: string;
}

/**
 * Login user with email and password
 */
export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/login/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      message: 'Login failed. Please check your credentials.',
    }));
    throw new Error(error.detail || error.message || 'Login failed');
  }

  const result: AuthResponse = await response.json();
  
  // Store token in localStorage
  if (result.access_token) {
    localStorage.setItem('access_token', result.access_token);
    localStorage.setItem('user_email', result.email);
  }

  return result;
};

/**
 * Register a new user
 */
export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/register/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      message: 'Registration failed. Please try again.',
    }));
    throw new Error(error.detail || error.message || 'Registration failed');
  }

  const result: AuthResponse = await response.json();
  
  // Store token in localStorage
  if (result.access_token) {
    localStorage.setItem('access_token', result.access_token);
    localStorage.setItem('user_email', result.email);
  }

  return result;
};

/**
 * Get stored access token
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem('access_token');
};

/**
 * Get stored user email
 */
export const getUserEmail = (): string | null => {
  return localStorage.getItem('user_email');
};

/**
 * Clear authentication data
 */
export const logout = (): void => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user_email');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};

