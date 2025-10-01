export interface InterviewQuestion {
  _id: string;
  question: string;
  answer: string;
  company: string;
  interviewType: 'technical' | 'behavioral' | 'system-design' | 'coding' | 'case-study';
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  author: {
    _id: string;
    username: string;
  };
  timestamp: Date;
  votes: number;
  bookmarked: boolean;
  views: number;
  myVote?: "up" | "down" | null;

}

// The Question interface has been removed as it was redundant with InterviewQuestion.

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