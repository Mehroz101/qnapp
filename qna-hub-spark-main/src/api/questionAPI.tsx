import { useMutation, useQueryClient } from "@tanstack/react-query";
import { questionsApi } from "@/lib/api";

function useQuestionMutation(
  mutationFn: (questionId: string) => Promise<any>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myQuestions'] });
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
  });
}

// Usage:
export const useUpvoteMutation = () => useQuestionMutation(questionsApi.upvote);
export const useDownvoteMutation = () => useQuestionMutation(questionsApi.downvote);
export const useBookmarkMutation = () => useQuestionMutation(questionsApi.bookmark);
