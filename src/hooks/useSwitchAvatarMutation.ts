import { command_switch_avatar } from '@/lib/commands';
import { loadCookies } from '@/lib/db';
import { AvatarSortOrder } from '@/lib/models';
import { notifications } from '@mantine/notifications';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AvatarListQuery, avatarListQueryKey } from './useAvatarListQuery';

export const useSwitchAvatarMutation = (avatarSortOrder: AvatarSortOrder | undefined) => {
  const queryClient = useQueryClient();
  const switchAvatarMutation = useMutation({
    mutationFn: async (avatarId: string) => {
      const { authCookie, twofaCookie } = await loadCookies();
      return await command_switch_avatar(authCookie, twofaCookie, avatarId);
    },
    onSuccess: (currentUser) => {
      queryClient.setQueryData(
        avatarListQueryKey(avatarSortOrder),
        (oldData: AvatarListQuery) => ({
          ...oldData,
          currentUser
        })
      );
      notifications.show({
        title: '成功',
        message: 'アバターの切り替えに成功しました',
        color: 'green',
      });
    },
    onError: (error) => {
      notifications.show({
        title: 'エラー',
        message: `アバターの切り替えに失敗しました: ${error.message}`,
        color: 'red',
      });
    },
  });

  return switchAvatarMutation;
};