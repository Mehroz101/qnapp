import { Button } from './ui/button';
import { QuestionCard } from './QuestionCard';
import { InterviewQuestion } from '../types';

type IndexQuestionsListProps = Readonly<{
  filteredQuestions: InterviewQuestion[];
  handleVote: (id: string, dir: 'up' | 'down') => void;
  handleBookmark: (id: string) => void;
  handleClearFilters: () => void;
  setSelectedQuestionId: (id: string) => void;
  generateWithAI: () => void;
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
  generateWithAI
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
          <div className='flex flex-col gap-2 items-center justify-center'>

            <Button
              variant="outline"
              onClick={generateWithAI}
              className='bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:text-white mb-4 flex items-center justify-center'
            >
              <img src="/ai-Btn.png" alt="" className='w-4 h-4 mr-2 ' />
              Ask From Qwizzy
            </Button>
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="mb-4"
            >
              Clear Filters
            </Button>
          </div>

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
