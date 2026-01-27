
export enum Profession {
  SOFTWARE_ENGINEER = 'Software Engineer',
  PRODUCT_MANAGER = 'Product Manager',
  DESIGNER = 'Designer',
  DATA_SCIENTIST = 'Data Scientist',
  STUDENT = 'Student',
  MARKETER = 'Marketer',
  OTHER = 'Other'
}

export interface User {
  name: string;
  email: string;
  profession: Profession;
  isRegistered: boolean;
}

export interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: number;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  avatar: string;
  systemInstruction: string;
  color: string;
}

export interface ChatSession {
  id: string;
  title: string;
  agentId: string;
  messages: Message[];
  createdAt: number;
}

export interface AppState {
  user: User | null;
  sessions: ChatSession[];
  activeSessionId: string | null;
}
