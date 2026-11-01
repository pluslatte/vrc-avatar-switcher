import { queryAllTagsAvailable } from '@/lib/db';
import { queryKeys } from '@/lib/queryKeys';
import { skipToken, useQuery } from '@tanstack/react-query';

export const useAvailableTagsQuery = (currentUserId: string | undefined) => {
  const availableTagsQuery = useQuery({
    queryKey: queryKeys.availableTags(currentUserId),
    queryFn: currentUserId === undefined
      ? skipToken
      : () => queryAllTagsAvailable(currentUserId),
  });

  return availableTagsQuery;
};
