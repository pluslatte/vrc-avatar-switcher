import { fetchAvatarsTags } from '@/lib/db';
import { queryKeys } from '@/lib/queryKeys';
import { useQuery } from '@tanstack/react-query';

export const useTagAvatarsRelationQuery = (
  currentUserId: string | undefined,
  avatarIds: Array<string>,
) => {
  const tagAvatarsRelationQuery = useQuery({
    queryKey: queryKeys.tagAvatarRelations(currentUserId, avatarIds),
    queryFn: async () => {
      if (!currentUserId) throw new Error('Current user ID is undefined');
      return await fetchAvatarsTags(avatarIds, currentUserId);
    },
    enabled: !!currentUserId,
  });

  return tagAvatarsRelationQuery;
};
