import { InterviewQuestion } from '../types';

export const mockInterviewQuestions: InterviewQuestion[] = [
  {
    id: '1',
    question: 'Explain the difference between let, const, and var in JavaScript.',
    answer: 'var is function-scoped and can be redeclared. let is block-scoped and can be reassigned but not redeclared. const is block-scoped and cannot be reassigned or redeclared after declaration. const must be initialized at declaration time.',
    company: 'Google',
    interviewType: 'technical',
    category: 'JavaScript',
    difficulty: 'medium',
    author: 'Sarah Chen',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    votes: 15,
    bookmarked: false,
    views: 342
  },
  {
    id: '2',
    question: 'Tell me about a time when you had to work with a difficult team member.',
    answer: 'I focused on understanding their perspective first. I scheduled a one-on-one conversation to discuss our working styles and found common ground. We established clear communication protocols and regular check-ins, which improved our collaboration significantly.',
    company: 'Microsoft',
    interviewType: 'behavioral',
    category: 'Leadership',
    difficulty: 'medium',
    author: 'Alex Kumar',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    votes: 23,
    bookmarked: true,
    views: 156
  },
  {
    id: '3',
    question: 'Design a URL shortener like bit.ly.',
    answer: 'Key components: 1) Base62 encoding for short URLs 2) Database with original_url, short_code, created_at 3) Caching layer (Redis) 4) Load balancer 5) Analytics service. Handle collision with retry logic. Use consistent hashing for database sharding.',
    company: 'Meta',
    interviewType: 'system-design',
    category: 'System Design',
    difficulty: 'hard',
    author: 'David Park',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    votes: 41,
    bookmarked: false,
    views: 789
  },
  {
    id: '4',
    question: 'Implement a function to reverse a linked list.',
    answer: 'function reverseList(head) { let prev = null; let current = head; while (current) { const next = current.next; current.next = prev; prev = current; current = next; } return prev; }',
    company: 'Amazon',
    interviewType: 'coding',
    category: 'Data Structures',
    difficulty: 'medium',
    author: 'Maria Rodriguez',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    votes: 38,
    bookmarked: true,
    views: 234
  },
  {
    id: '5',
    question: 'How would you prioritize features for our mobile app with limited resources?',
    answer: 'I would use a framework combining user impact, business value, and technical effort. First, gather user feedback and analytics. Then score each feature on impact (1-5) and effort (1-5). Prioritize high-impact, low-effort items first. Consider technical dependencies and create a roadmap with quarterly milestones.',
    company: 'Spotify',
    interviewType: 'case-study',
    category: 'Product Management',
    difficulty: 'hard',
    author: 'Jennifer Liu',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    votes: 29,
    bookmarked: false,
    views: 187
  }
];

export const categoryColors: Record<string, string> = {
  'JavaScript': 'category-technical',
  'Leadership': 'category-behavioral', 
  'System Design': 'category-system-design',
  'Data Structures': 'category-coding',
  'Product Management': 'category-case-study',
  'React': 'category-technical',
  'Python': 'category-technical',
  'Algorithms': 'category-coding'
};