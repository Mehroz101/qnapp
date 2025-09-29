
import { useState, useEffect } from 'react';
import { InterviewQuestion } from '../types';
import Modal from './ui/Modal';

interface AddInterviewQuestionDialogProps {
  onAddQuestion: (
    question: Omit<
      InterviewQuestion,
      'id' | 'author' | 'timestamp' | 'votes' | 'bookmarked' | 'views'
    >
  ) => boolean;
  initialValues?: Partial<Omit<InterviewQuestion, 'id' | 'author' | 'timestamp' | 'votes' | 'bookmarked' | 'views' | '_id'>> & { _id?: string };
  open?: boolean;
  setOpen?: (open: boolean) => void;
}

export default function AddInterviewQuestionDialog({
  onAddQuestion,
  initialValues,
  open: controlledOpen,
  setOpen: setControlledOpen,
}: Readonly<AddInterviewQuestionDialogProps>) {
  // Support both controlled and uncontrolled open state
  const [open, setOpen] = typeof controlledOpen === 'boolean' && setControlledOpen ? [controlledOpen, setControlledOpen] : useState(false);
  const [question, setQuestion] = useState(initialValues?.question || '');
  const [answer, setAnswer] = useState(initialValues?.answer || '');
  const [company, setCompany] = useState(initialValues?.company || '');
  const [interviewType, setInterviewType] = useState<
    'technical' | 'behavioral' | 'system-design' | 'coding' | 'case-study'
  >(initialValues?.interviewType || 'technical');
  const [category, setCategory] = useState(initialValues?.category || '');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>(initialValues?.difficulty || 'medium');

  // Reset form when initialValues or open changes
  useEffect(() => {
    if (open) {
      setQuestion(initialValues?.question || '');
      setAnswer(initialValues?.answer || '');
      setCompany(initialValues?.company || '');
      setInterviewType(initialValues?.interviewType || 'technical');
      setCategory(initialValues?.category || '');
      setDifficulty(initialValues?.difficulty || 'medium');
    }
  }, [open, initialValues]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim() || !company.trim() || !category.trim()) { return; }

    const ok = onAddQuestion({
      _id: initialValues?._id || '',
      question: question.trim(),
      answer: answer.trim(),
      company: company.trim(),
      interviewType,
      category: category.trim(),
      difficulty,
    });

    if (ok) {
      setQuestion('');
      setAnswer('');
      setCompany('');
      setInterviewType('technical');
      setCategory('');
      setDifficulty('medium');
      setOpen(false);
    }
  };

  return (
    <>
      {/* Trigger Button (only show if uncontrolled) */}
      {typeof controlledOpen !== 'boolean' && (
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Share Experience
        </button>
      )}

      {/* Modal Overlay */}
      <Modal open={open} onClose={() => setOpen(false)} title="Share Your Interview Experience">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor='company' className="mb-1 block text-sm font-medium">Company *</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
                placeholder="e.g. Google, Microsoft"
                required
              />
            </div>
            <div>
              <label htmlFor='category' className="mb-1 block text-sm font-medium">Category *</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
                placeholder="e.g. JavaScript, System Design"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor='interviewType' className="mb-1 block text-sm font-medium">Interview Type</label>
              <select
                value={interviewType}
                onChange={(e) =>
                  setInterviewType(e.target.value as typeof interviewType)
                }
                className="w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
              >
                <option value="technical">Technical</option>
                <option value="behavioral">Behavioral</option>
                <option value="system-design">System Design</option>
                <option value="coding">Coding</option>
                <option value="case-study">Case Study</option>
              </select>
            </div>

            <div>
              <label htmlFor='difficulty' className="mb-1 block text-sm font-medium">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) =>
                  setDifficulty(e.target.value as typeof difficulty)
                }
                className="w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor='question' className="mb-1 block text-sm font-medium">Interview Question *</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
              rows={3}
              placeholder="What was the interview question?"
              required
            />
          </div>

          <div>
            <label htmlFor='answer' className="mb-1 block text-sm font-medium">Your Answer/Approach *</label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
              rows={6}
              placeholder="How did you approach this question? Share details..."
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Share Experience
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
