/*
 * Copyright (C) 2025 pluslatte
 * This file is part of vrc-avatar-switcher.
 *
 * vrc-avatar-switcher is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * 
 * vrc-avatar-switcher is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with vrc-avatar-switcher. If not, see <https://www.gnu.org/licenses/>. 
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
        throw new Error(`Failed to fetch avatar list: ${(error as Error).message}`);
      }
    },
    enabled: !!avatarSortOrder,
  });
  return avatarListQuery;
};

export const avatarListQueryKey = (avatarSortOrder: AvatarSortOrder | undefined) => ['avatarList', avatarSortOrder];