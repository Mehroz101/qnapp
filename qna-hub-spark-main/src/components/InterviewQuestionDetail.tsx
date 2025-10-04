import {
  ArrowUp,
  ArrowDown,
  Bookmark,
  Eye,
  Building2,
  Clock,
  ArrowLeft,
  Edit,
  Share,
  MessageSquare,
  User,
} from "lucide-react";
import { InterviewQuestion } from "../types";
import { categoryColors } from "../data/interviewQuestions";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import ReactMarkdown from "react-markdown";
import AddInterviewQuestionDialog from "./AddInterviewQuestionDialog";
import { useEffect, useState } from "react";
import { cn } from "../lib/utils";
import { useQuestions } from "@/hooks/useQuestions";

interface InterviewQuestionDetailProps {
  question: InterviewQuestion;
  onVote: (questionId: string, direction: "up" | "down") => void;
  onBookmark: (questionId: string) => void;
  onBack: () => void;
  userId: string | undefined;
}

type Props = {
  language: string;
  value: string;
};

const CodeBlock: React.FC<Props> = ({ language, value }) => (
  <SyntaxHighlighter
    language={language}
    style={oneDark}
    showLineNumbers
    wrapLines
    customStyle={{
      borderRadius: "12px",
      padding: "1.5rem",
      fontSize: "0.9rem",
      background: "#1a1a1a",
      border: "1px solid #2d2d2d",
      margin: "1rem 0",
    }}
    lineNumberStyle={{
      color: "#6b7280",
      minWidth: "3em",
    }}
  >
    {value.trim()}
  </SyntaxHighlighter>
);

export function InterviewQuestionDetail({
  question,
  onVote,
  onBookmark,
  onBack,
  userId,
}: Readonly<InterviewQuestionDetailProps>) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editInitialValues, setEditInitialValues] = useState(
    null as null | Omit<
      InterviewQuestion,
      "id" | "author" | "timestamp" | "votes" | "bookmarked" | "views"
    >
  );
  const { viewQuestionMutation, editQuestionMutation } = useQuestions({});
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      return "just now";
    }
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }
    if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    }
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  useEffect(() => {
    // Scroll to top when question changes
    window.scrollTo(0, 0);
    viewQuestionMutation.mutate(question._id);
  }, [question._id]);
  const onEdit = () => {
    setEditDialogOpen(true);
    setEditInitialValues(question);
  };

  // const {editQuestionMutation} = useQuestions({})

  const getDifficultyConfig = (difficulty: string) => {
    const config = {
      easy: {
        class:
          "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800",
        label: "Easy",
      },
      medium: {
        class:
          "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800",
        label: "Medium",
      },
      hard: {
        class:
          "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-800",
        label: "Hard",
      },
    };
    return config[difficulty as keyof typeof config] || config.medium;
  };

  const getCategoryColor = (category: string) => {
    return (
      categoryColors[category] ||
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
    );
  };

  const handleAddOrEditQuestion = (
    data: Omit<
      InterviewQuestion,
      "id" | "author" | "timestamp" | "votes" | "bookmarked" | "views"
    > & { _id?: string },
    questionId?: string
  ) => {
    editQuestionMutation.mutate({ ...data, _id: questionId });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: question.question,
          text: `Check out this interview question from ${question.company}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could add a toast notification here
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-900 dark:to-blue-950/20">
      <div className="container mx-auto px-4 py-8 max-sm:px-1 ">
        {/* Header Navigation */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-1">
          <Button
            variant="ghost"
            onClick={onBack}
            className="group hover:bg-white/80 dark:hover:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:scale-105"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="max-sm:hidden">Back to Questions</span>
          </Button>

          <div className="flex items-center gap-3">
            {userId == question.author._id && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
                className="hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/50 dark:hover:text-blue-300 border-blue-200 dark:border-blue-800 flex items-center gap-2 transition-all duration-200 hover:scale-105"
              >
                Edit <Edit className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 transition-all duration-200 hover:scale-105"
            >
              Share <Share className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="p-8 border border-gray-200/80 dark:border-gray-700/80 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 max-sm:p-2">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-950/40 px-4 py-2 rounded-2xl">
                  <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span className="font-semibold text-blue-700 dark:text-blue-300">
                    {question.company}
                  </span>
                </div>

                <Badge
                  variant="outline"
                  className={cn(
                    "font-semibold px-3 py-1.5 border-2 text-sm",
                    getDifficultyConfig(question.difficulty).class
                  )}
                >
                  {getDifficultyConfig(question.difficulty).label}
                </Badge>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 px-3 py-1.5 rounded-lg">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">
                    {formatTimeAgo(question.timestamp)}
                  </span>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onBookmark(question._id)}
                  className={cn(
                    "h-9 w-9 p-0 transition-all duration-200 hover:scale-110",
                    question.bookmarked
                      ? "text-amber-500 hover:text-amber-600 bg-amber-50 dark:bg-amber-950/40"
                      : "text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                  )}
                >
                  <Bookmark
                    className={cn(
                      "h-5 w-5 transition-all",
                      question.bookmarked && "fill-current scale-110"
                    )}
                  />
                </Button>
              </div>
            </div>

            {/* Question Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 leading-tight max-sm:text-lg">
                {question.question}
              </h1>

              <div className="flex flex-wrap gap-3 mb-6">
                <Badge
                  variant="secondary"
                  className="bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800 font-medium px-4 py-2 text-sm"
                >
                  {question.interviewType}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    "font-medium px-4 py-2 text-sm border",
                    getCategoryColor(question.category)
                  )}
                >
                  {question.category}
                </Badge>
              </div>
            </div>

            {/* Answer Section */}
            <div className="border-t border-gray-100 dark:border-gray-800 pt-8">
              <div className="flex items-center gap-2 flex-wrap justify-between mb-8">
                <h2 className="text-2xl max-sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  Solution
                </h2>

                <div className="flex items-center gap-3 bg-white dark:bg-gray-800/50 px-4  py-2 max-sm:py-1 max-sm:px-2 rounded-xl border border-gray-200 dark:border-gray-700 max-sm:w-full max-sm:justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onVote(question._id, "up")}
                    className={cn(
                      "h-8 w-8 p-0 transition-all duration-200 hover:scale-110",
                      question.myVote === "up"
                        ? "bg-green-50 text-green-600 border border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800"
                        : "hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-950/30"
                    )}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>

                  <div className="flex flex-col items-center min-w-[40px] max-sm:flex-row max-sm:gap-1">
                    <span className="font-bold text-lg text-gray-900 dark:text-white">
                      {question.votes}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      votes
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onVote(question._id, "down")}
                    className={cn(
                      "h-8 w-8 p-0 transition-all duration-200 hover:scale-110",
                      question.myVote === "down"
                        ? "bg-red-50 text-red-600 border border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800"
                        : "hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                    )}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Answer Content */}
              <div className="bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl p-8 max-sm:px-2 mb-8 border border-gray-200/50 dark:border-gray-700/50">
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <ReactMarkdown
                    components={{
                      code({ node, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || "");
                        const inline = props.inline;
                        return !inline && match ? (
                          <CodeBlock
                            language={match[1]}
                            value={String(children)}
                          />
                        ) : (
                          <code
                            className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-md text-sm font-mono"
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      },
                      p: ({ children }) => (
                        <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                          {children}
                        </p>
                      ),
                      h1: ({ children }) => (
                        <h1 className="text-2xl font-bold mt-6 mb-4 text-gray-900 dark:text-white">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-xl font-bold mt-5 mb-3 text-gray-900 dark:text-white">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-lg font-bold mt-4 mb-2 text-gray-900 dark:text-white">
                          {children}
                        </h3>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc list-inside mb-4 space-y-1 text-gray-700 dark:text-gray-300">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal list-inside mb-4 space-y-1 text-gray-700 dark:text-gray-300">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="ml-4 mb-1">{children}</li>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold text-gray-900 dark:text-white">
                          {children}
                        </strong>
                      ),
                    }}
                  >
                    {question.answer}
                  </ReactMarkdown>
                </div>
              </div>

              {/* Footer Meta Information */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center flex-wrap gap-6 text-sm">
                  <div className="flex items-center gap-2 bg-white dark:bg-gray-800/50 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
                    <Eye className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {question.views} views
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <User className="h-4 w-4" />
                    <span className="font-medium">
                      shared by{" "}
                      {question.author.username
                        .replace(/[#*`]/g, "")
                        .substring(0, 20)}
                      ...
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Last updated {formatTimeAgo(question.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      {editDialogOpen && (
        <AddInterviewQuestionDialog
          onAddQuestion={(data) => {
            handleAddOrEditQuestion(data, editInitialValues?._id);
            setEditDialogOpen(false);
            setEditInitialValues(null);
            return true;
          }}
          initialValues={editInitialValues}
          open={editDialogOpen}
          setOpen={(v) => {
            setEditDialogOpen(v);
            if (!v) setEditInitialValues(null);
          }}
        />
      )}
      <button
        className="fixed bottom-4 left-4 bg-gray-100 border  w-8 h-8 rounded-full flex items-center justify-center  hover:opacity-100  cursor-pointer hover:scale-110 transition-all duration-200"
        onClick={onBack}
      >
        <ArrowLeft className="h-4 w-4 text-gray-600 dark:text-gray-400 " />
      </button>
    </div>
  );
}
