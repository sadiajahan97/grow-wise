const API_BASE_URL = 'http://localhost:8000';

export interface ChatThread {
  id: string;
  title: string;
  created_at: string;
}

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

/**
 * Get all chat threads for the authenticated user
 */
export const getThreads = async (): Promise<ChatThread[]> => {
  const response = await fetch(`${API_BASE_URL}/api/chatbot/threads/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized. Please login again.');
    }
    throw new Error('Failed to fetch threads');
  }

  return response.json();
};

/**
 * Create a new chat thread
 */
export const createThread = async (title: string): Promise<ChatThread> => {
  const response = await fetch(`${API_BASE_URL}/api/chatbot/threads/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ title }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized. Please login again.');
    }
    throw new Error('Failed to create thread');
  }

  return response.json();
};

/**
 * Delete a chat thread
 */
export const deleteThread = async (threadId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/chatbot/threads/${threadId}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized. Please login again.');
    }
    if (response.status === 404) {
      throw new Error('Thread not found');
    }
    throw new Error('Failed to delete thread');
  }
};

