import { command_fetch_avatars, command_fetch_current_user } from '@/lib/commands';
import { Avatar, AvatarSortOrder, CurrentUser } from '@/lib/models';
import { getErrorMessage, notifyError } from '@/lib/notify';
import { queryKeys } from '@/lib/queryKeys';
import { useQuery } from '@tanstack/react-query';

export interface AvatarListData {
  avatars: Array<Avatar>;
  currentUser: CurrentUser;
}

export const useAvatarListQuery = (
  avatarSortOrder: AvatarSortOrder | undefined,
  enabled = true,
) => {
  const avatarListQuery = useQuery<AvatarListData>({
    queryKey: queryKeys.avatarList(avatarSortOrder),
    queryFn: async () => {
      if (!avatarSortOrder) throw new Error('avatarSortOrder is undefined');
      try {
        return {
          avatars: await command_fetch_avatars(avatarSortOrder),
          currentUser: await command_fetch_current_user(),
        };
      } catch (error) {
        console.error(error);
        const message = getErrorMessage(error, '不明なエラー');
        notifyError('アバターの読み込みに失敗しました', message);
        throw new Error(`Failed to fetch avatar list: ${message}`);
      }
    },
    enabled: enabled && !!avatarSortOrder,
  });
  return avatarListQuery;
};
