import { useQuery } from '@tanstack/react-query';
import { authApi, userApi } from '../lib/api';
import { QuestionCard } from '../components/QuestionCard';
import { InterviewQuestion } from '../types';
import { useEffect, useState } from 'react';
import { Button } from '../components/ui/button';

export default function Profile() {
  const { data: user, isLoading: loadingUser } = useQuery({
    queryKey: ['profile'],
    queryFn: authApi.getProfile,
    retry: false,
  });

  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  useEffect(() => {
    async function fetchQuestions() {
      setLoadingQuestions(true);
      try {
        const qList = await userApi.getMyQuestions();
        setQuestions(qList);
      } catch {
        setQuestions([]);
      } finally {
        setLoadingQuestions(false);
      }
    }
    fetchQuestions();
  }, []);

  if (loadingUser) return <div className="p-8 text-center">Loading profile...</div>;
  if (!user) return <div className="p-8 text-center">Not logged in.</div>;

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
                key={question.id}
                question={question}
                onVote={() => {}}
                onBookmark={() => {}}
                onClick={() => {}}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
