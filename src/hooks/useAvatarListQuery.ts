import { command_fetch_avatars, command_fetch_current_user } from '@/lib/commands';
import { loadCookies } from '@/lib/db';
import { Avatar, AvatarSortOrder, CurrentUser } from '@/lib/models';
import { useQuery } from '@tanstack/react-query';

export interface AvatarListQuery {
  avatars: Array<Avatar>,
  currentUser: CurrentUser,
}
export const useAvatarListQuery = (avatarSortOrder: AvatarSortOrder | undefined) => {
  const avatarListQuery = useQuery<AvatarListQuery>({
    queryKey: avatarListQueryKey(avatarSortOrder),
    queryFn: async () => {
      if (!avatarSortOrder) throw new Error('avatarSortOrder is undefined');
      const { authCookie, twofaCookie } = await loadCookies();
      return {
        avatars: await command_fetch_avatars(authCookie, twofaCookie, avatarSortOrder),
        currentUser: await command_fetch_current_user(authCookie, twofaCookie),
      };
    },
    enabled: !!avatarSortOrder,
  });
  return avatarListQuery;
};

export const avatarListQueryKey = (avatarSortOrder: AvatarSortOrder | undefined) => ['avatarList', avatarSortOrder];