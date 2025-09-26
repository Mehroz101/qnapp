import { useState, useMemo } from 'react';
import { InterviewQuestion } from '../types';
import { mockInterviewQuestions } from '../data/interviewQuestions';
import { InterviewQuestionDetail } from '../components/InterviewQuestionDetail';
import { useFilteredQuestions } from '../hooks/useFilteredQuestions';
import { IndexHeader } from '../components/IndexHeader';
import { IndexSearchSortBar } from '../components/IndexSearchSortBar';
import { IndexSidebarFilters } from '../components/IndexSidebarFilters';
import { IndexQuestionsList } from '../components/IndexQuestionsList';

const Index = () => {
  const [questions, setQuestions] = useState<InterviewQuestion[]>(mockInterviewQuestions);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'newest' | 'votes' | 'company'>('newest');
  const [showFilters, setShowFilters] = useState(false);

  const availableCategories = useMemo(() => {
    const categorySet = new Set<string>();
    questions.forEach(question => {
      categorySet.add(question.category);
    });
    return Array.from(categorySet).sort((a, b) => a.localeCompare(b));
  }, [questions]);

  const filteredQuestions = useFilteredQuestions({
    questions,
    searchQuery,
    selectedCategories,
    sortBy
  });

  const selectedQuestion = selectedQuestionId 
    ? questions.find(q => q.id === selectedQuestionId)
    : null;

  const handleVote = (questionId: string, direction: 'up' | 'down') => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId 
        ? { ...q, votes: q.votes + (direction === 'up' ? 1 : -1) }
        : q
    ));
  };

  const handleBookmark = (questionId: string) => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId 
        ? { ...q, bookmarked: !q.bookmarked }
        : q
    ));
  };

  const handleAddQuestion = (newQuestionData: Omit<InterviewQuestion, 'id' | 'author' | 'timestamp' | 'votes' | 'bookmarked' | 'views'>) => {
    const newQuestion: InterviewQuestion = {
      id: Date.now().toString(),
      ...newQuestionData,
      author: 'You',
      timestamp: new Date(),
      votes: 0,
      bookmarked: false,
      views: 0
    };
    setQuestions(prev => [newQuestion, ...prev]);
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
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
          <IndexQuestionsList
            filteredQuestions={filteredQuestions}
            handleVote={handleVote}
            handleBookmark={handleBookmark}
            handleClearFilters={handleClearFilters}
            setSelectedQuestionId={setSelectedQuestionId}
            setQuestions={setQuestions}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;