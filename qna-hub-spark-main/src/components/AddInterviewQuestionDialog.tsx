import { useState, useEffect } from 'react';
import { InterviewQuestion } from '../types';
import Modal from './ui/Modal';
import { Building2, Code, Target, Star, Send, X, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import { Select } from './ui/select';
import CustomSelect, { OptionType } from './customSelect';
import { useQuestions } from '@/hooks/useQuestions';

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

const interviewTypeOptions = [
  { value: 'technical', label: 'Technical', icon: Code, color: 'text-blue-600' },
  { value: 'behavioral', label: 'Behavioral', icon: Target, color: 'text-green-600' },
  { value: 'system-design', label: 'System Design', icon: Building2, color: 'text-purple-600' },
  { value: 'coding', label: 'Coding', icon: Code, color: 'text-orange-600' },
  { value: 'case-study', label: 'Case Study', icon: Target, color: 'text-indigo-600' },
] as const;

const difficultyOptions = [
  { value: 'easy', label: 'Easy', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { value: 'medium', label: 'Medium', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { value: 'hard', label: 'Hard', color: 'bg-rose-100 text-rose-700 border-rose-200' },
] as const;

export default function AddInterviewQuestionDialog({
  onAddQuestion,
  initialValues,
  open: controlledOpen,
  setOpen: setControlledOpen,
}: Readonly<AddInterviewQuestionDialogProps>) {
  // Always call useState unconditionally
  const [open, setOpen] = useState(false);
  // If controlled props are provided, sync open state
  useEffect(() => {
    if (typeof controlledOpen === 'boolean' && setControlledOpen) {
      setOpen(controlledOpen);
    }
  }, [controlledOpen, setControlledOpen]);
  const [question, setQuestion] = useState(initialValues?.question || '');
  const [answer, setAnswer] = useState(initialValues?.answer || '');
  const [company, setCompany] = useState(initialValues?.company || '');
  const [selected, setSelected] = useState<{ value: string; label: string } | null>(null);
  const [options, setOptions] = useState<{ value: string; label: string }[]>([]);
  const [interviewType, setInterviewType] = useState<
    'technical' | 'behavioral' | 'system-design' | 'coding' | 'case-study'
  >(initialValues?.interviewType || 'technical');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>(initialValues?.difficulty || 'medium');

  const { getCategories } = useQuestions({});
  // Reset form when initialValues or open changes
  useEffect(() => {
    if (open) {
      setQuestion(initialValues?.question || '');
      setAnswer(initialValues?.answer || '');
      setCompany(initialValues?.company || '');
      setInterviewType(initialValues?.interviewType || 'technical');
      setDifficulty(initialValues?.difficulty || 'medium');
    }
  }, [open, initialValues, getCategories]);
  useEffect(() => {
    if (getCategories) {
      const option = getCategories?.map((category: string) => ({ value: category, label: category }));
      const selectedOption = initialValues?.category ? option.find((cat) => cat.value === initialValues.category) : null;
      console.log('Options fetched:', option);
      console.log('Selected option:', selectedOption);
      setOptions(option);
      setSelected(selectedOption);
    }
  }, [getCategories, initialValues?.category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim() || !company.trim() || selected === null) {
      return;
    }

    const ok = onAddQuestion({
      _id: initialValues?._id || '',
      question: question.trim(),
      answer: answer.trim(),
      company: company.trim(),
      interviewType,
      category: selected?.value || '',
      difficulty,
    });

    if (ok) {
      setQuestion('');
      setAnswer('');
      setCompany('');
      setInterviewType('technical');
      setSelected(null);
      setDifficulty('medium');
      setOpen(false);
    }
  };
  const colourOptions = [
    { value: 'red', label: 'Red' },
    { value: 'blue', label: 'Blue' },
    { value: 'green', label: 'Green' },
    { value: 'yellow', label: 'Yellow' },
    { value: 'orange', label: 'Orange' },
    { value: 'purple', label: 'Purple' },
  ]
  const isEditing = !!initialValues?._id;
  const filterColors = (inputValue: string) => {
    return colourOptions.filter((i) =>
      i.label.toLowerCase().includes(inputValue.toLowerCase())
    );
  };


  return (
    <>
      {/* Trigger Button (only show if uncontrolled) */}
      {typeof controlledOpen !== 'boolean' && (
        <Button
          onClick={() => setOpen(true)}
          className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-white shadow-lg hover:from-blue-700 hover:to-purple-700 hover:shadow-xl transition-all duration-200 hover:scale-105"
        >
          <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-200" />
          Share Experience
        </Button>
      )}

      {/* Modal Overlay */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Send className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isEditing ? 'Edit Question' : 'Share Your Experience'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {isEditing ? 'Update your interview question and solution' : 'Help others prepare for their interviews'}
              </p>
            </div>
          </div>
        }
        className="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company & Category Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor='company' className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <Building2 className="h-4 w-4 text-blue-600" />
                Company *
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 focus:outline-none transition-all duration-200"
                placeholder="e.g., Google, Microsoft, Amazon"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor='category' className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <Code className="h-4 w-4 text-purple-600" />
                Category *
              </label>
              <div style={{ width: 300 }}>
                <CustomSelect
                  options={options ?? []}
                  placeholder="Pick or create a color..."
                  value={selected}
                  onChange={setSelected}
                  isClearable
                />
              </div>
              {/* <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 focus:outline-none transition-all duration-200"
                placeholder="e.g., React, System Design, Algorithms"
                required
              /> */}
            </div>
          </div>

          {/* Interview Type & Difficulty Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <Target className="h-4 w-4 text-green-600" />
                Interview Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {interviewTypeOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setInterviewType(option.value)}
                      className={cn(
                        "flex items-center gap-2 rounded-xl border-2 px-3 py-2 text-sm font-medium transition-all duration-200 hover:scale-105",
                        interviewType === option.value
                          ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-600"
                          : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-gray-500"
                      )}
                    >
                      <Icon className={cn("h-4 w-4", option.color)} />
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <Star className="h-4 w-4 text-amber-600" />
                Difficulty Level
              </label>
              <div className="flex gap-2">
                {difficultyOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setDifficulty(option.value)}
                    className={cn(
                      "flex-1 rounded-xl border-2 px-3 py-2 text-sm font-semibold transition-all duration-200 hover:scale-105",
                      difficulty === option.value
                        ? option.color + " border-current"
                        : "border-gray-200 bg-gray-50 text-gray-400 hover:border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-gray-500"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Question Input */}
          <div className="space-y-3">
            <label htmlFor='question' className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Interview Question *
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 focus:outline-none transition-all duration-200 resize-none"
              rows={3}
              placeholder="What specific question were you asked in the interview?"
              required
            />
          </div>

          {/* Answer Input */}
          <div className="space-y-3">
            <label htmlFor='answer' className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Your Solution / Approach *
            </label>
            <div className="relative">
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 focus:outline-none transition-all duration-200 resize-none"
                rows={8}
                placeholder={`Share your approach, solution, and any important insights...

• Break down your thought process
• Include code examples if applicable
• Mention time/space complexity
• Share what the interviewer was looking for
• Add any follow-up questions or variations`}
                required
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                Markdown supported
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="rounded-xl px-6 py-2.5 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-105"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2.5 text-white shadow-lg hover:from-blue-700 hover:to-purple-700 hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!question.trim() || !answer.trim() || !company.trim() || selected === null}
            >
              <Send className="h-4 w-4 mr-2" />
              {isEditing ? 'Update Question' : 'Share Experience'}
            </Button>
          </div>

          {/* Form Help Text */}
          <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4">
            <div className="flex items-start gap-3">
              <div className="p-1 bg-blue-100 dark:bg-blue-800 rounded-lg">
                <Star className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  Pro Tips for Great Submissions
                </p>
                <ul className="text-xs text-blue-700 dark:text-blue-400 mt-1 space-y-1">
                  <li>• Be specific and detailed in your solution approach</li>
                  <li>• Include code examples with proper formatting</li>
                  <li>• Mention time and space complexity when relevant</li>
                  <li>• Share what the interviewer was looking for in the answer</li>
                </ul>
              </div>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
}