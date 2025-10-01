import { useState, useEffect } from 'react';
import { InterviewQuestion } from '../types';
import { InterviewQuestionDetail } from '../components/InterviewQuestionDetail';
import { useFilteredQuestions } from '../hooks/useFilteredQuestions';
import { IndexHeader } from '../components/IndexHeader';
import { IndexSearchSortBar } from '../components/IndexSearchSortBar';
import { IndexSidebarFilters } from '../components/IndexSidebarFilters';
import { IndexQuestionsList } from '../components/IndexQuestionsList';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { questionsApi } from '../lib/api';
import { useUserProfile } from '@/hooks/useProfile';
import { useQuestions } from '@/hooks/useQuestions';

const Index = () => {
  const queryClient = useQueryClient();
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'newest' | 'votes' | 'company'>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [initialValues, setInitialValues] = useState<Partial<InterviewQuestion> | null>({});
  const [open, setOpen] = useState(false);

  // Auth state
  const { user } = useUserProfile()
  const isAuthenticated = !!user?.data?.id;



  const { allQuestions: questions, allIsLoading: isLoading, allIsError: isError, allError: error, addQuestionMutation, upvoteMutation, downvoteMutation, bookmarkMutation } = useQuestions({
    searchQuery,
    selectedCategories,
    sortBy,
  });
  useEffect(() => {
    if (searchQuery === '' && selectedCategories.length === 0) {
      const categorySet = new Set<string>();
      questions.forEach((question: InterviewQuestion) => {
        categorySet.add(question.category);
      });
      const newCategories = Array.from(categorySet).sort((a, b) => a.localeCompare(b));
      if (JSON.stringify(newCategories) !== JSON.stringify(availableCategories)) {
        setAvailableCategories(newCategories);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions, searchQuery, selectedCategories]);

  const generateWithAIMutation = useMutation({
    mutationFn: questionsApi.generateWithAI,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      console.log("AI generated question:", data);
      setInitialValues(data.question);
      setOpen(true)
    },
  });



  const filteredQuestions = useFilteredQuestions({
    questions,
    searchQuery,
    selectedCategories,
    sortBy,
  });

  const selectedQuestion = selectedQuestionId
    ? questions.find((q: InterviewQuestion) => q._id === selectedQuestionId)
    : null;

  // Handlers
  const handleVote = (questionId: string, direction: 'up' | 'down') => {
    if (!isAuthenticated) { return };
    if (direction === 'up') {
      upvoteMutation.mutate(questionId);
    } else {
      downvoteMutation.mutate(questionId);
    }
  };

  const handleBookmark = (questionId: string) => {
    if (!isAuthenticated) { return; };
    bookmarkMutation.mutate(questionId);
  };

  const handleAddQuestion = (newQuestionData: Omit<InterviewQuestion, 'id' | 'author' | 'timestamp' | 'votes' | 'bookmarked' | 'views'>) => {
    if (!isAuthenticated) {
      return false;
    }
    addQuestionMutation.mutate(newQuestionData);
    return true;
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSearchQuery('');
  };

  if (selectedQuestion) {
    return (
      <InterviewQuestionDetail
        question={selectedQuestion}
        onVote={handleVote}
        onBookmark={handleBookmark}
        onBack={() => setSelectedQuestionId(null)}
        userId={user?.data?.id}
      />
    );
  }
  const handleGenerateWithAI = () => {
    // Placeholder for AI generation logic
    generateWithAIMutation.mutate(searchQuery);
  }
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <IndexHeader onAddQuestion={handleAddQuestion} initialValues={initialValues} open={open} setOpen={setOpen} />
          <IndexSearchSortBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            sortBy={sortBy}
            setSortBy={setSortBy}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
          />
        </div>
        <div className="flex flex-col lg:flex-row gap-6">
          <IndexSidebarFilters
            selectedCategories={selectedCategories}
            availableCategories={availableCategories}
            onCategoryToggle={handleCategoryToggle}
            onClearFilters={handleClearFilters}
            showFilters={showFilters}
          />
          <div className="flex-1">
            {isLoading ? (
              <div className="p-8 text-center">Loading questions...</div>
            ) : isError ? (
              <div className="p-8 text-center text-destructive">Error loading questions: {String(error)}</div>
            ) : (
              <IndexQuestionsList
                filteredQuestions={filteredQuestions}
                handleVote={handleVote}
                handleBookmark={handleBookmark}
                handleClearFilters={handleClearFilters}
                setSelectedQuestionId={setSelectedQuestionId}
                setQuestions={() => { }}
                generateWithAI={handleGenerateWithAI}
                AIThinking={generateWithAIMutation}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;