/*
 * Copyright (C) 2025 pluslatte
 * This file is part of vrc-avatar-switcher.
 *
 * vrc-avatar-switcher is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * 
 * vrc-avatar-switcher is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with vrc-avatar-switcher. If not, see <https://www.gnu.org/licenses/>. 
*/

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