const API_BASE_URL = 'http://localhost:8000';

/**
 * Get access token from localStorage
 */
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

export interface Recommendation {
  id: number;
  skill: string;
  title: string;
  description: string;
  url: string;
  source: string;
  created_at: string;
}

export interface AgentRecommendation {
  id: number;
  skill: string;
  name: string;
  system_prompt: string;
  created_at: string;
}

export interface GenerateRecommendationsResponse {
  status: string;
  video_recommendations: number;
  article_recommendations: number;
  course_recommendations: number;
}

/**
 * Get all article recommendations for the authenticated user
 */
export const getArticleRecommendations = async (): Promise<Recommendation[]> => {
  const response = await fetch(`${API_BASE_URL}/api/recommendations_01/articles/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized. Please login again.');
    }
    throw new Error('Failed to fetch article recommendations');
  }

  return response.json();
};

/**
 * Get all course recommendations for the authenticated user
 */
export const getCourseRecommendations = async (): Promise<Recommendation[]> => {
  const response = await fetch(`${API_BASE_URL}/api/recommendations_01/courses/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized. Please login again.');
    }
    throw new Error('Failed to fetch course recommendations');
  }

  return response.json();
};

/**
 * Get all video recommendations for the authenticated user
 */
export const getVideoRecommendations = async (): Promise<Recommendation[]> => {
  const response = await fetch(`${API_BASE_URL}/api/recommendations_01/videos/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized. Please login again.');
    }
    throw new Error('Failed to fetch video recommendations');
  }

  return response.json();
};

/**
 * Get all agent recommendations for the authenticated user
 */
export const getAgentRecommendations = async (): Promise<AgentRecommendation[]> => {
  const response = await fetch(`${API_BASE_URL}/api/recommendations_01/agents/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized. Please login again.');
    }
    throw new Error('Failed to fetch agent recommendations');
  }

  return response.json();
};

/**
 * Generate new recommendations based on user's chat history
 */
export const generateRecommendations = async (profession?: string): Promise<GenerateRecommendationsResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/recommendations_01/generate/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ profession }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized. Please login again.');
    }
    const error = await response.json().catch(() => ({ detail: 'Failed to generate recommendations' }));
    throw new Error(error.detail || 'Failed to generate recommendations');
  }

  return response.json();
};

