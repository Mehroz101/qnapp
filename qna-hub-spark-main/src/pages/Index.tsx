import { useState, useMemo } from 'react';
import { Search, Filter } from 'lucide-react';
import { InterviewQuestion } from '../types';
import { mockInterviewQuestions, categoryColors } from '../data/interviewQuestions';
import { QuestionCard } from '../components/QuestionCard';
import { InterviewQuestionDetail } from '../components/InterviewQuestionDetail';
import { TagFilter } from '../components/TagFilter';
import { AddInterviewQuestionDialog } from '../components/AddInterviewQuestionDialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const Index = () => {
  const [questions, setQuestions] = useState<InterviewQuestion[]>(mockInterviewQuestions);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'newest' | 'votes' | 'company'>('newest');
  const [showFilters, setShowFilters] = useState(false);

  // Get unique categories from all questions
  const availableCategories = useMemo(() => {
    const categorySet = new Set<string>();
    questions.forEach(question => {
      categorySet.add(question.category);
    });
    return Array.from(categorySet).sort();
  }, [questions]);

  // Filter and sort questions
  const filteredQuestions = useMemo(() => {
    let filtered = questions.filter(question => {
      // Search filter
      const searchMatch = searchQuery === '' || 
        question.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        question.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        question.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        question.category.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter
      const categoryMatch = selectedCategories.length === 0 || 
        selectedCategories.includes(question.category);

      return searchMatch && categoryMatch;
    });

    // Sort questions
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'votes':
          return b.votes - a.votes;
        case 'company':
          return a.company.localeCompare(b.company);
        case 'newest':
        default:
          return b.timestamp.getTime() - a.timestamp.getTime();
      }
    });

    return filtered;
  }, [questions, searchQuery, selectedCategories, sortBy]);

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

  // Question detail view
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

  // Questions list view
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Interview Prep Hub
              </h1>
              <p className="text-muted-foreground">
                Real interview questions and answers from the community
              </p>
            </div>
            <AddInterviewQuestionDialog onAddQuestion={handleAddQuestion} />
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search questions, companies, categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="votes">Most Voted</SelectItem>
                  <SelectItem value="company">Company A-Z</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <TagFilter
              selectedTags={selectedCategories}
              availableTags={availableCategories}
              onTagToggle={handleCategoryToggle}
              onClearAll={handleClearFilters}
              title="Categories"
            />
          </div>

          {/* Questions List */}
          <div className="flex-1">
            {filteredQuestions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg mb-4">
                  No questions found matching your criteria
                </p>
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  className="mb-4"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-muted-foreground">
                    {filteredQuestions.length} interview experience{filteredQuestions.length !== 1 ? 's' : ''}
                  </p>
                </div>

                {filteredQuestions.map((question) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    onVote={handleVote}
                    onBookmark={handleBookmark}
                    onClick={(id) => {
                      setSelectedQuestionId(id);
                      // Increment view count
                      setQuestions(prev => prev.map(q => 
                        q.id === id ? { ...q, views: q.views + 1 } : q
                      ));
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;