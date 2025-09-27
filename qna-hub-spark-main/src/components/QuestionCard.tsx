import { ArrowUp, ArrowDown, Bookmark, Eye, Building2, Clock } from 'lucide-react';
import { InterviewQuestion } from '../types';
import { categoryColors } from '../data/interviewQuestions';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

interface QuestionCardProps {
  question: InterviewQuestion;
  onVote: (questionId: string, direction: 'up' | 'down') => void;
  onBookmark: (questionId: string) => void;
  onClick: (questionId: string) => void;
}

export function QuestionCard({ question, onVote, onBookmark, onClick }: QuestionCardProps) {
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-difficulty-easy/10 text-difficulty-easy border-difficulty-easy/20';
      case 'medium': return 'bg-difficulty-medium/10 text-difficulty-medium border-difficulty-medium/20';
      case 'hard': return 'bg-difficulty-hard/10 text-difficulty-hard border-difficulty-hard/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="p-6 hover:bg-card-hover transition-all duration-200 cursor-pointer border border-border/50 hover:border-primary/20">
      <div className="flex gap-4">
        {/* Voting section */}
        <div className="flex flex-col items-center gap-2 min-w-[50px]">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onVote(question.id, 'up');
            }}
            className="h-7 w-7 p-0 hover:bg-success/10 hover:text-success transition-colors"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          
          <span className="font-medium text-foreground">{question.votes}</span>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onVote(question.id, 'down');
            }}
            className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>

        {/* Question content */}
        <div className="flex-1 min-w-0" onClick={() => onClick(question.id)}>
          {/* Header with company and metadata */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-foreground">{question.company}</span>
              <Badge variant="outline" className={getDifficultyColor(question.difficulty)}>
                {question.difficulty}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{formatTimeAgo(question.timestamp)}</span>
            </div>
          </div>

          {/* Question */}
          <h3 className="text-base font-medium text-foreground hover:text-primary transition-colors mb-3 line-clamp-2">
            {question.question}
          </h3>
          
          {/* Answer preview */}
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {question.answer}
          </p>

          {/* Tags and Type */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              {question.interviewType}
            </Badge>
            <Badge variant="outline" className={`bg-${categoryColors[question.category] || 'category-technical'}/10 text-${categoryColors[question.category] || 'category-technical'} border-${categoryColors[question.category] || 'category-technical'}/20`}>
              {question.category}
            </Badge>
          </div>

          {/* Meta information */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{question.views}</span>
              </div>
              <span>by {question.author}</span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onBookmark(question.id);
              }}
              className={`h-7 w-7 p-0 ${
                question.bookmarked
                  ? 'text-warning hover:text-warning/80'
                  : 'hover:text-warning'
              }`}
            >
              <Bookmark className={`h-4 w-4 ${question.bookmarked ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}