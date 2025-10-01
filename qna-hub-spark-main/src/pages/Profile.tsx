import { useQueryClient } from '@tanstack/react-query';
import { QuestionCard } from '../components/QuestionCard';
import { InterviewQuestion } from '../types';
import { useMemo, useState } from 'react';
import { Button } from '../components/ui/button';
import { InterviewQuestionDetail } from '@/components/InterviewQuestionDetail';
import AddInterviewQuestionDialog from '../components/AddInterviewQuestionDialog';
import { User, Mail, IdCard, Plus, BookOpen, BarChart3, Calendar } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { useQuestions } from '@/hooks/useQuestions';
import { useUserProfile } from '@/hooks/useProfile';

export default function Profile() {
  const queryClient = useQueryClient();
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [showAddQuestionDialog, setShowAddQuestionDialog] = useState(false);

  const { user, loadingUser } = useUserProfile()

  const isAuthenticated = !!user?.data?.id;
  const {
    questions,
    isLoading,
    upvoteMutation,
    downvoteMutation,
    bookmarkMutation,
  } = useQuestions({});

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

  const selectedQuestion = selectedQuestionId
    ? questions?.find((q: InterviewQuestion) => q._id === selectedQuestionId)
    : null;

  // Calculate stats
  const totalQuestions = questions?.length || 0;
  const totalVotes = useMemo(() => questions?.reduce((sum: number, q: InterviewQuestion) => sum + (q.votes || 0), 0) || 0, [questions]);
  const totalViews = useMemo(() => questions?.reduce((sum: number, q: InterviewQuestion) => sum + (q.views || 0), 0) || 0, [questions]);






  if (loadingUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-900 dark:to-blue-950/20 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="animate-pulse space-y-8">
            <Skeleton className="h-12 w-64 rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-8 w-48 rounded-xl" />
            <div className="space-y-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-900 dark:to-blue-950/20 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <Card className="p-8 text-center border-2 border-dashed border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Not Logged In</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Please log in to view your profile</p>
            <Button
              id="open-auth-dialog"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Login to Continue
            </Button>
          </Card>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-900 dark:to-blue-950/20 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 max-sm:text-lg">Your Profile</h1>
          <p className="text-gray-600 dark:text-gray-400 max-sm:text-sm">Manage your questions and track your contributions</p>
        </div>

        {/* User Info Card */}
        <Card className="p-6 mb-8 border border-gray-200/80 dark:border-gray-700/80 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center flex-wrap gap-4">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {user?.data?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="text-2xl max-sm:text-base font-bold text-gray-900 dark:text-white mb-2">
                  {user?.data?.username}
                </h2>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{user?.data?.email || user?.data?.username} </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IdCard className="h-4 w-4" />
                    <span className="font-mono">{user?.data?.id.slice(0, 8)}...</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">

              <Button
                onClick={() => setShowAddQuestionDialog(true)}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                <Plus className="h-4 w-4" />
                Add Question
              </Button>
            </div>
          </div>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 border border-gray-200/80 dark:border-gray-700/80 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm hover:shadow-lg transition-all duration-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Questions Posted</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalQuestions}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-gray-200/80 dark:border-gray-700/80 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm hover:shadow-lg transition-all duration-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Votes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalVotes}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-gray-200/80 dark:border-gray-700/80 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm hover:shadow-lg transition-all duration-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Views</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalViews}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Questions Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl max-sm:text-lg font-bold text-gray-900 dark:text-white">Your Questions</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1 max-sm:text-sm">
                Questions you've shared with the community
              </p>
            </div>
            <Badge variant="secondary" className="px-3 py-1 text-sm font-medium">
              {totalQuestions} {totalQuestions === 1 ? 'Question' : 'Questions'}
            </Badge>
          </div>

          {/* Extracted conditional rendering for questions section */}
          {(() => {
            if (isLoading) {
              return (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <Card key={i} className="p-6 animate-pulse">
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center gap-2 min-w-[50px]">
                          <Skeleton className="h-7 w-7 rounded" />
                          <Skeleton className="h-4 w-8 rounded" />
                          <Skeleton className="h-7 w-7 rounded" />
                        </div>
                        <div className="flex-1 space-y-3">
                          <Skeleton className="h-4 w-3/4 rounded" />
                          <Skeleton className="h-4 w-full rounded" />
                          <Skeleton className="h-4 w-2/3 rounded" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              );
            } else if (!questions || questions.length === 0) {
              return (
                <Card className="p-12 text-center border-2 border-dashed border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Questions Yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                    You haven't shared any interview questions yet. Start contributing to help others prepare for their interviews!
                  </p>
                  <Button
                    onClick={() => setShowAddQuestionDialog(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Share Your First Question
                  </Button>
                </Card>
              );
            } else {
              return (
                <div className="space-y-4">
                  {questions.map((question: InterviewQuestion) => (
                    <QuestionCard
                      key={question._id}
                      question={question}
                      onVote={handleVote}
                      onBookmark={handleBookmark}
                      onClick={setSelectedQuestionId}
                    />
                  ))}
                </div>
              );
            }
          })()}
        </div>
      </div>

      {/* Add Question Dialog */}
      {showAddQuestionDialog && (
        <AddInterviewQuestionDialog
          onAddQuestion={(data) => {
            setShowAddQuestionDialog(false);
            queryClient.invalidateQueries({ queryKey: ['myQuestions'] });
            return true;
          }}
          open={showAddQuestionDialog}
          setOpen={setShowAddQuestionDialog}
        />
      )}
    </div>
  );
}