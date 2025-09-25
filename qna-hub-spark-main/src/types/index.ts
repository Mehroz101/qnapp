export interface InterviewQuestion {
  id: string;
  question: string;
  answer: string;
  company: string;
  interviewType: 'technical' | 'behavioral' | 'system-design' | 'coding' | 'case-study';
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  author: string;
  timestamp: Date;
  votes: number;
  bookmarked: boolean;
  views: number;
}

// Keep Question interface for backward compatibility but mark as deprecated
export interface Question extends InterviewQuestion {}

export interface Answer {
  id: string;
  content: string;
  author: string;
  timestamp: Date;
  votes: number;
  isAccepted: boolean;
}

export interface TagInfo {
  name: string;
  color: string;
  count: number;
}