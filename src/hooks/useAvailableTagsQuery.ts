import { queryAllTagsAvailable } from '@/lib/db';
import { useQuery } from '@tanstack/react-query';
import { AvatarListQuery } from './useAvatarListQuery';

export const useAvailableTagsQuery = (avatarListQuery: AvatarListQuery | undefined) => {
  const availableTagsQuery = useQuery({
    queryKey: availableTagsQueryKey(avatarListQuery?.currentUser.id),
    queryFn: async () => {
      if (!avatarListQuery?.currentUser?.id) throw new Error('Current user ID is undefined');
      const tags = await queryAllTagsAvailable(avatarListQuery?.currentUser.id || '');
      return tags;
    },
    enabled: !!avatarListQuery,
  });

  return availableTagsQuery;
};

export const availableTagsQueryKey = (currentUserId: string | undefined) => {
  return ['tags', currentUserId];
};