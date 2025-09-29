import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi, questionsApi, userApi } from '../lib/api';
import { QuestionCard } from '../components/QuestionCard';
import { InterviewQuestion } from '../types';
import { useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import { InterviewQuestionDetail } from '@/components/InterviewQuestionDetail';
import AddInterviewQuestionDialog from '../components/AddInterviewQuestionDialog';

export default function Profile() {
  const queryClient = useQueryClient();
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);


  const { data: user, isLoading: loadingUser } = useQuery({
    queryKey: ['profile'],
    queryFn: authApi.getProfile,
    retry: false,
  });
  const isAuthenticated = !!user?.data?.id;

  // Upvote mutation
  const upvoteMutation = useMutation({
    mutationFn: questionsApi.upvote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myQuestions'] });
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
  });

  // Downvote mutation
  const downvoteMutation = useMutation({
    mutationFn: questionsApi.downvote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myQuestions'] });
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
  });

  // Bookmark mutation
  const bookmarkMutation = useMutation({
    mutationFn: questionsApi.bookmark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myQuestions'] });
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
  });

  const { data: questions, isLoading: loadingQuestions } = useQuery({
    queryKey: ['myQuestions'],
    queryFn: userApi.getMyQuestions,
  });


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
    ? questions.find((q: InterviewQuestion) => q._id === selectedQuestionId)
    : null;
  if (loadingUser) return <div className="p-8 text-center">Loading profile...</div>;
  if (!user) return <div className="p-8 text-center">Not logged in.</div>;
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Account</h2>
        <div className="mb-4">Username: <span className="font-mono">{user?.data?.username}</span></div>
        <div className="mb-4">ID: <span className="font-mono">{user?.data?.id}</span></div>
        <Button variant="outline" onClick={() => window.location.reload()}>Refresh</Button>
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-4">Your Questions</h2>
        {loadingQuestions ? (
          <div>Loading questions...</div>
        ) : questions.length === 0 ? (
          <div>No questions found.</div>
        ) : (
          <div className="space-y-4">
            {questions.map((question: InterviewQuestion) => (
              <QuestionCard
                question={question}
                onVote={handleVote}
                onBookmark={handleBookmark}
                onClick={setSelectedQuestionId}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
