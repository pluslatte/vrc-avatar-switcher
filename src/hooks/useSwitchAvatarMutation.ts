/*
 * Copyright (C) 2025 pluslatte
 * This file is part of vrc-avatar-switcher.
 *
 * vrc-avatar-switcher is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * 
 * vrc-avatar-switcher is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with vrc-avatar-switcher. If not, see <https://www.gnu.org/licenses/>. 
*/

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