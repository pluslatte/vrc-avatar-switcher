import { queryAllTagsAvailable } from '@/lib/db';
import { queryKeys } from '@/lib/queryKeys';
import { useQuery } from '@tanstack/react-query';

export const useAvailableTagsQuery = (currentUserId: string | undefined) => {
  const availableTagsQuery = useQuery({
    queryKey: queryKeys.availableTags(currentUserId),
    queryFn: async () => {
      if (!currentUserId) throw new Error('Current user ID is undefined');
      return await queryAllTagsAvailable(currentUserId);
    },
    enabled: !!currentUserId,
  });

  return availableTagsQuery;
};
