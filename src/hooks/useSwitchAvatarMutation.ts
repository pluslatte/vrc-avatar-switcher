/*
 * Copyright 2025 pluslatte
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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