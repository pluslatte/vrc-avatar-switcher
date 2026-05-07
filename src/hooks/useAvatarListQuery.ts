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

import { command_fetch_avatars, command_fetch_current_user } from '@/lib/commands';
import { loadCookies } from '@/lib/db';
import { Avatar, AvatarSortOrder, CurrentUser } from '@/lib/models';
import { notifications } from '@mantine/notifications';
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
      try {
        const { authCookie, twofaCookie } = await loadCookies();
        return {
          avatars: await command_fetch_avatars(authCookie, twofaCookie, avatarSortOrder),
          currentUser: await command_fetch_current_user(authCookie, twofaCookie),
        };
      } catch (error) {
        console.error(error);
        notifications.show({
          title: 'アバターの読み込みに失敗しました',
          message: (error as Error).message,
          color: 'red',
        });
        throw error;
      }
    },
    enabled: !!avatarSortOrder,
  });
  return avatarListQuery;
};

export const avatarListQueryKey = (avatarSortOrder: AvatarSortOrder | undefined) => ['avatarList', avatarSortOrder];