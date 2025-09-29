import { ArrowUp, ArrowDown, Bookmark, Eye, Building2, Clock, ArrowLeft } from 'lucide-react';
import { InterviewQuestion } from '../types';
import { categoryColors } from '../data/interviewQuestions';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import ReactMarkdown from 'react-markdown'

interface InterviewQuestionDetailProps {
  question: InterviewQuestion;
  onVote: (questionId: string, direction: 'up' | 'down') => void;
  onBookmark: (questionId: string) => void;
  onBack: () => void;
}

type Props = {
  language: string
  value: string
}

const CodeBlock: React.FC<Props> = ({ language, value }) => (
  <SyntaxHighlighter
    language={language}
    style={oneDark}
    showLineNumbers
    wrapLines
    customStyle={{
      borderRadius: '12px',
      padding: '1rem',
      fontSize: '0.9rem',
      background: '#1e1e1e',
    }}
  >
    {value.trim()}
  </SyntaxHighlighter>
)
export function InterviewQuestionDetail({
  question,
  onVote,
  onBookmark,
  onBack
}: Readonly<InterviewQuestionDetailProps>) {
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) { return 'just now'; }
    if (diffInHours < 24) { return `${diffInHours}h ago`; }
    if (diffInHours < 168) { return `${Math.floor(diffInHours / 24)}d ago`; }
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4 hover:bg-secondary"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Questions
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="p-8 border border-border/50">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <span className="text-lg font-semibold text-foreground">{question.company}</span>
                <Badge variant="outline" className={getDifficultyColor(question.difficulty)}>
                  {question.difficulty}
                </Badge>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{formatTimeAgo(question.timestamp)}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onBookmark(question._id)}
                  className={`h-8 w-8 p-0 ${question.bookmarked
                    ? 'text-warning hover:text-warning/80'
                    : 'hover:text-warning'
                    }`}
                >
                  <Bookmark className={`h-4 w-4 ${question.bookmarked ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </div>

            {/* Question */}
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-foreground mb-4 leading-relaxed">
                {question.question}
              </h1>

              <div className="flex flex-wrap gap-2 mb-6">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  {question.interviewType}
                </Badge>
                <Badge variant="outline" className={`bg-${categoryColors[question.category] || 'category-technical'}/10 text-${categoryColors[question.category] || 'category-technical'} border-${categoryColors[question.category] || 'category-technical'}/20`}>
                  {question.category}
                </Badge>
              </div>
            </div>

            {/* Answer */}
            <div className="border-t pt-8">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-lg font-medium text-foreground">Answer</h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onVote(question._id, 'up')}
                    className="h-7 w-7 p-0 hover:bg-success/10 hover:text-success transition-colors"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>

                  <span className="font-medium text-foreground min-w-[20px] text-center">{question.votes}</span>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onVote(question._id, 'down')}
                    className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive transition-colors"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="bg-muted/30 rounded-lg p-6 mb-6">
                <pre className="whitespace-pre-wrap font-sans text-foreground leading-relaxed text-sm">
                  <ReactMarkdown
                    components={{
                      code({ node, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '')
                        const inline = props.inline;
                        return !inline && match ? (
                          <CodeBlock language={match[1]} value={String(children)} />
                        ) : (
                          <code {...props}>{children}</code>
                        )
                      }
                    }}
                  >
                    {question.answer}
                  </ReactMarkdown>
                </pre>
              </div>

              {/* Meta information */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{question.views} views</span>
                  </div>
                </div>
                <span>shared by {question.author}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}