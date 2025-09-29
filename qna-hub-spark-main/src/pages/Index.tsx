import { useState, useMemo } from 'react';
import { InterviewQuestion } from '../types';
import { InterviewQuestionDetail } from '../components/InterviewQuestionDetail';
import { useFilteredQuestions } from '../hooks/useFilteredQuestions';
import { IndexHeader } from '../components/IndexHeader';
import { IndexSearchSortBar } from '../components/IndexSearchSortBar';
import { IndexSidebarFilters } from '../components/IndexSidebarFilters';
import { IndexQuestionsList } from '../components/IndexQuestionsList';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { questionsApi, authApi } from '../lib/api';

const Index = () => {
  const queryClient = useQueryClient();
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'newest' | 'votes' | 'company'>('newest');
  const [showFilters, setShowFilters] = useState(false);

  // Auth state
  const { data: user, isLoading: loadingUser } = useQuery({
    queryKey: ['profile'],
    queryFn: authApi.getProfile,
    retry: false,
  });
  const isAuthenticated = !!user?.data?.id;

  // Questions list
  const {
    data: questions = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['questions', { searchQuery, selectedCategories, sortBy }],
    queryFn: () => questionsApi.list({ search: searchQuery, categories: selectedCategories, sortBy }),
  });

  // Add question mutation
  const addQuestionMutation = useMutation({
    mutationFn: questionsApi.addQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] })
      return true;
    },
  });

  // Upvote mutation
  const upvoteMutation = useMutation({
    mutationFn: questionsApi.upvote,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['questions'] }),
  });

  // Downvote mutation
  const downvoteMutation = useMutation({
    mutationFn: questionsApi.downvote,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['questions'] }),
  });

  // Bookmark mutation
  const bookmarkMutation = useMutation({
    mutationFn: questionsApi.bookmark,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['questions'] }),
  });

  const availableCategories = useMemo(() => {
    const categorySet = new Set<string>();
    questions.forEach((question: InterviewQuestion) => {
      categorySet.add(question.category);
    });
    return Array.from(categorySet).sort((a, b) => a.localeCompare(b));
  }, [questions]);

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
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <IndexHeader onAddQuestion={handleAddQuestion} />
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
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;