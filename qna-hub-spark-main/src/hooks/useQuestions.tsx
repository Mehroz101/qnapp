// hooks/useQuestions.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { questionsApi, userApi } from '@/lib/api';
import type { InterviewQuestion } from '@/types';
import { useDebounce } from 'use-debounce';
interface UseQuestionsProps {
  searchQuery?: string;
  selectedCategories?: string[];
  sortBy?: 'newest' | 'votes' | 'company';
}

export function useQuestions({ searchQuery, selectedCategories, sortBy }: Partial<UseQuestionsProps>) {
  const queryClient = useQueryClient();
  const [debouncedSearch] = useDebounce(searchQuery, 600);

  // Fetch questions
  const { data: questions = [], isLoading, isError, error } = useQuery<InterviewQuestion[]>({
    queryKey: ['myQuestions'],
    queryFn: userApi.getMyQuestions,
    staleTime: 1000 * 60, // 1 minute
    refetchOnWindowFocus: false,
  });
  const {
    data: allQuestions = [],
    isLoading: allIsLoading,
    isError: allIsError,
    error: allError,
  } = useQuery({
    queryKey: ['questions', { searchQuery: debouncedSearch, selectedCategories, sortBy }],
    queryFn: () => questionsApi.list({
      search: debouncedSearch,
      categories: selectedCategories,
      sortBy,
    }),
    staleTime: 1000 * 60, // 1 min cache
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 30, // optional: auto-refresh every 30s
    retry: false,
  });

  const upvoteMutation = useMutation({
    mutationFn: questionsApi.upvote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myQuestions'] })
      queryClient.invalidateQueries({ queryKey: ['questions'] })

    },
  });

  const downvoteMutation = useMutation({
    mutationFn: questionsApi.downvote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myQuestions'] })
      queryClient.invalidateQueries({ queryKey: ['questions'] })

    },
  });
  const viewQuestionMutation = useMutation({
    mutationFn: questionsApi.viewQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myQuestions'] })
      queryClient.invalidateQueries({ queryKey: ['questions'] })

    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: questionsApi.bookmark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myQuestions'] })
      queryClient.invalidateQueries({ queryKey: ['questions'] })

    },
  });
  const addQuestionMutation = useMutation({
    mutationFn: questionsApi.addQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] })
      queryClient.invalidateQueries({ queryKey: ['myQuestions'] })
    },
  });

  return {
    questions,
    isLoading,
    isError,
    error,
    allQuestions,
    allIsLoading,
    allIsError,
    allError,
    upvoteMutation,
    downvoteMutation,
    bookmarkMutation,
    addQuestionMutation,
    viewQuestionMutation
  };
}
