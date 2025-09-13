import { command_fetch_avatars, command_fetch_current_user, command_switch_avatar } from '@/lib/commands';
import { Avatar, CurrentUser } from '@/lib/models';
import { loadCookies } from '@/lib/stores';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

interface AvatarListQuery {
  avatars: Array<Avatar>,
  currentUser: CurrentUser,
}
export const useAvatarSwitcher = () => {
  const queryClient = useQueryClient();
  const [selectedSort, setSelectedSort] = useState<'Name' | 'Updated'>('Name');

  const avatarListQuery = useQuery<AvatarListQuery>({
    queryKey: ['avatarList', selectedSort],
    queryFn: async () => {
      const { authCookie, twofaCookie } = await loadCookies();
      return {
        avatars: await command_fetch_avatars(authCookie, twofaCookie, selectedSort),
        currentUser: await command_fetch_current_user(authCookie, twofaCookie),
      };
    }
  });

  const switchAvatarMutation = useMutation({
    mutationFn: async (avatarId: string) => {
      const { authCookie, twofaCookie } = await loadCookies();
      return await command_switch_avatar(authCookie, twofaCookie, avatarId);
    },
    onSuccess: (currentUser) => {
      queryClient.setQueryData(['avatarList', selectedSort], (oldData: AvatarListQuery) => ({
        ...oldData,
        currentUser
      }));
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

  return { avatarListQuery, switchAvatarMutation, selectedSort, setSelectedSort };
};