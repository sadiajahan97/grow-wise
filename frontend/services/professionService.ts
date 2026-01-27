const API_BASE_URL = 'http://localhost:8000';

export interface Profession {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get all professions from the API
 */
export const getProfessions = async (): Promise<Profession[]> => {
  const response = await fetch(`${API_BASE_URL}/api/employees/professions/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch professions');
  }

  const professions: Profession[] = await response.json();
  return professions;
};

