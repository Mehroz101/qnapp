import { Button } from './ui/button';
import { QuestionCard } from './QuestionCard';
import { InterviewQuestion } from '../types';

type IndexQuestionsListProps = Readonly<{
  filteredQuestions: InterviewQuestion[];
  handleVote: (id: string, dir: 'up' | 'down') => void;
  handleBookmark: (id: string) => void;
  handleClearFilters: () => void;
  setSelectedQuestionId: (id: string) => void;
  setQuestions: React.Dispatch<React.SetStateAction<InterviewQuestion[]>>;
}>;

function incrementQuestionViews(id: string, setQuestions: React.Dispatch<React.SetStateAction<InterviewQuestion[]>>) {
  setQuestions(prev =>
    prev.map(q => q._id === id ? { ...q, views: q.views + 1 } : q)
  );
}

export function IndexQuestionsList({
  filteredQuestions,
  handleVote,
  handleBookmark,
  handleClearFilters,
  setSelectedQuestionId,
  setQuestions,
}: IndexQuestionsListProps) {
  const handleQuestionClick = (id: string) => {
    setSelectedQuestionId(id);
    incrementQuestionViews(id, setQuestions);
  };

  return (
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
              key={question._id}
              question={question}
              onVote={handleVote}
              onBookmark={handleBookmark}
              onClick={handleQuestionClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
