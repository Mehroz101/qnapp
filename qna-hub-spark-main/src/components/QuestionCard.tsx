import { ArrowUp, ArrowDown, Bookmark, Eye, Building2, Clock, MessageSquare } from 'lucide-react';
import { InterviewQuestion } from '../types';
import { categoryColors } from '../data/interviewQuestions';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { cn } from '../lib/utils';

interface QuestionCardProps {
  question: InterviewQuestion;
  onVote: (questionId: string, direction: 'up' | 'down') => void;
  onBookmark: (questionId: string) => void;
  onClick: (questionId: string) => void;
}

export function QuestionCard({ question, onVote, onBookmark, onClick }: Readonly<QuestionCardProps>) {
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getDifficultyConfig = (difficulty: string) => {
    const config = {
      easy: {
        class: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800',
        label: 'Easy'
      },
      medium: {
        class: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800',
        label: 'Medium'
      },
      hard: {
        class: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-800',
        label: 'Hard'
      }
    };
    return config[difficulty as keyof typeof config] || config.medium;
  };

  const getCategoryColor = (category: string) => {
    return categoryColors[category] || 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
  };

  return (
    <Card
      className="group p-6 hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 bg-white dark:bg-gray-900/50 backdrop-blur-sm"
      onClick={() => onClick(question._id)}
    >
      <div className="flex flex-wrap-reverse gap-4">
        {/* Voting Section - Enhanced */}
        <div className="flex flex-col  max-sm:flex-row items-center gap-3 min-w-[60px] max-sm:bg-muted/30 max-sm:p-2 max-sm:rounded-lg max-sm:w-full max-sm:justify-center max-sm:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onVote(question._id, 'up');
            }}
            className={cn(
              "h-9 w-9 p-0 transition-all duration-200 hover:scale-105",
              question.myVote === 'up'
                ? "bg-green-50 text-green-600 border border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800"
                : "hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-950/30"
            )}
          >
            <ArrowUp className="h-5 w-5" />
          </Button>

          <div className="flex flex-col max-sm:flex-row gap-1 items-center">
            <span className="font-bold text-lg text-gray-900 dark:text-white max-sm:text-base">
              {question.votes}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 max-sm:text-xs">votes</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onVote(question._id, 'down');
            }}
            className={cn(
              "h-9 w-9 p-0 transition-all duration-200 hover:scale-105",
              question.myVote === 'down'
                ? "bg-red-50 text-red-600 border border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800"
                : "hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
            )}
          >
            <ArrowDown className="h-5 w-5" />
          </Button>
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-[250px]">
          {/* Header with Company and Metadata */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/30 px-3 py-1 rounded-full">
                <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold text-blue-700 dark:text-blue-300 text-sm">
                  {question.company}
                </span>
              </div>

              <Badge
                variant="outline"
                className={cn(
                  "font-medium px-2 py-1 text-xs border-2",
                  getDifficultyConfig(question.difficulty).class
                )}
              >
                {getDifficultyConfig(question.difficulty).label}
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Clock className="h-4 w-4" />
              <span className="font-medium">{formatTimeAgo(question.timestamp)}</span>
            </div>
          </div>

          {/* Question Title */}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-3 line-clamp-2 leading-relaxed">
            {question.question}
          </h3>

          {/* Answer Preview */}
          <div className="mb-4 max-sm:hidden">
            <p className="text-sm text-gray-600  dark:text-gray-300 line-clamp-3 leading-6">
              {question.answer.replace(/[#*`]/g, '').substring(0, 150)}...
            </p>
            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1 inline-block">
              Read full answer →
            </span>
          </div>

          {/* Tags and Categories */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge
              variant="secondary"
              className="bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800 font-medium px-3 py-1"
            >
              {question.interviewType}
            </Badge>
            <Badge
              variant="outline"
              className={cn(
                "font-medium px-3 py-1 border",
                getCategoryColor(question.category)
              )}
            >
              {question.category}
            </Badge>
          </div>

          {/* Footer with Stats and Actions */}
          <div className="flex items-center justify-between  pt-3 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-4 flex-wrap text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/50 px-2 py-1 rounded-md">
                <Eye className="h-4 w-4" />
                <span className="font-medium">{question.views} views</span>
              </div>


              <span className="text-gray-600 dark:text-gray-300 font-medium max-w-xs truncate">
                by {question.author.username.replace(/[#*`]/g, '').substring(0, 10)}...
              </span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onBookmark(question._id);
              }}
              className={cn(
                "h-8 w-8 p-0 transition-all duration-200 hover:scale-110",
                question.bookmarked
                  ? "text-amber-500 hover:text-amber-600 bg-amber-50 dark:bg-amber-950/40"
                  : "text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30"
              )}
            >
              <Bookmark
                className={cn(
                  "h-4 w-4 transition-all",
                  question.bookmarked && "fill-current scale-110"
                )}
              />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}