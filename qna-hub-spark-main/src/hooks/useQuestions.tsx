// hooks/useQuestions.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { questionsApi, userApi } from "@/lib/api";
import type { InterviewQuestion } from "@/types";
import { useDebounce } from "use-debounce";
interface UseQuestionsProps {
  searchQuery?: string;
  selectedCategories?: string[];
  sortBy?: "newest" | "votes" | "company";
  cursor?: string | null;
}

export function useQuestions({
  searchQuery,
  selectedCategories,
  sortBy,
  cursor,
}: Partial<UseQuestionsProps>) {
  const queryClient = useQueryClient();
  const [debouncedSearch] = useDebounce(searchQuery, 600);

  // Fetch questions
  const {
    data: questions = [],
    isLoading,
    isError,
    error,
  } = useQuery<InterviewQuestion[]>({
    queryKey: ["myQuestions"],
    queryFn: userApi.getMyQuestions,
    staleTime: 1000 * 60, // 1 minute
    refetchOnWindowFocus: false,
    retry: false,
  });
  const {
    data: allQuestions = [],
    isLoading: allIsLoading,
    isError: allIsError,
    error: allError,
  } = useQuery({
    queryKey: [
      "questions",
      {
        searchQuery: debouncedSearch,
        selectedCategories,
        sortBy,
        cursor,
      },
    ],
    queryFn: () => {
      console.log("Fetching questions with:", {
        search: debouncedSearch,
        categories: selectedCategories,
        sortBy,
        cursor,
      });
      return questionsApi.list({
        search: debouncedSearch,
        categories: selectedCategories,
        sortBy,
        limit: 15,
        cursor: cursor || null,
      });
    },
    staleTime: 1000 * 60, // 1 min cache
    refetchOnWindowFocus: false,
    refetchInterval: 1000 * 30, // optional: auto-refresh every 30s
    retry: false,
  });

  const upvoteMutation = useMutation({
    mutationFn: questionsApi.upvote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myQuestions"] });
      queryClient.invalidateQueries({ queryKey: ["questions"] });
    },
  });

  const downvoteMutation = useMutation({
    mutationFn: questionsApi.downvote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myQuestions"] });
      queryClient.invalidateQueries({ queryKey: ["questions"] });
    },
  });
  const viewQuestionMutation = useMutation({
    mutationFn: questionsApi.viewQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myQuestions"] });
      queryClient.invalidateQueries({ queryKey: ["questions"] });
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: questionsApi.bookmark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myQuestions"] });
      queryClient.invalidateQueries({ queryKey: ["questions"] });
    },
  });
  const addQuestionMutation = useMutation({
    mutationFn: questionsApi.addQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      queryClient.invalidateQueries({ queryKey: ["myQuestions"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
  const editQuestionMutation = useMutation({
    mutationFn: (
      data: { _id: string } & Omit<
        InterviewQuestion,
        "id" | "author" | "timestamp" | "votes" | "bookmarked" | "views"
      >
    ) => questionsApi.editQuestion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      queryClient.invalidateQueries({ queryKey: ["myQuestions"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      return true;
    },
  });
  const { data: getCategories } = useQuery<[string]>({
    queryKey: ["categories"],
    queryFn: questionsApi.getCategories,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    retry: false,
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
    viewQuestionMutation,
    getCategories,
    editQuestionMutation,
  };
}
