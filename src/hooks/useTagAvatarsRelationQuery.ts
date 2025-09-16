import { fetchAvatarsTags } from '@/lib/db';
import { useQuery } from '@tanstack/react-query';
import { AvatarListQuery } from './useAvatarListQuery';
import { Avatar } from '@/lib/models';

export const useTagAvatarsRelationQuery = (avatarListQuery: AvatarListQuery | undefined) => {
  const tagAvatarsRelationQuery = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: tagAvatarRelationQueryKey(avatarListQuery?.avatars || [], avatarListQuery?.currentUser.id || ''),
    queryFn: () => {
      if (!avatarListQuery?.avatars.length || !avatarListQuery?.currentUser.id) throw new Error('Avatars or Current user ID is undefined');
      const tagAvatarsRelation = fetchAvatarsTags(avatarListQuery.avatars.map(a => a.id), avatarListQuery.currentUser.id);
      return tagAvatarsRelation;
    },
    enabled: !!avatarListQuery,
  });

  return tagAvatarsRelationQuery;
};

export const tagAvatarRelationQueryKey = (avatars: Array<Avatar>, currentUserId: string) => {
  return ['tags', currentUserId, avatars.map(a => a.id), avatars.length];
};