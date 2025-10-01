// hooks/useQuestions.ts
import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/lib/api';

export function useUserProfile() {

  const { data: user, isLoading: loadingUser } = useQuery({
    queryKey: ['profile'],
    queryFn: authApi.getProfile,

  });

  return {
    user,
    loadingUser
  };
}
