import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/lib/auth/AuthProvider';
import { fetchProfile, updateProfile } from '@/lib/api/profiles';
import type { Profile } from '@/types/database';

export function useProfile() {
  const { session } = useAuth();
  const userId = session?.user.id;

  return useQuery({
    queryKey: ['profile', userId],
    queryFn: () => fetchProfile(userId as string),
    enabled: !!userId,
  });
}

export function useUpdateProfile() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: Partial<Profile>) => updateProfile(userId as string, updates),
    onSuccess: (profile) => {
      queryClient.setQueryData(['profile', userId], profile);
    },
  });
}
