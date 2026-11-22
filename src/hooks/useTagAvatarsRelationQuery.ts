import { fetchAvatarsTags } from '@/lib/db';
import { queryKeys } from '@/lib/queryKeys';
import { skipToken, useQuery } from '@tanstack/react-query';

export const useTagAvatarsRelationQuery = (
  currentUserId: string | undefined,
  avatarIds: Array<string>,
) => {
  const tagAvatarsRelationQuery = useQuery({
    queryKey: queryKeys.tagAvatarRelations(currentUserId, avatarIds),
    queryFn: currentUserId === undefined
      ? skipToken
      : () => fetchAvatarsTags(avatarIds, currentUserId),
  });

  return tagAvatarsRelationQuery;
};
