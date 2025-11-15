/*
 * Copyright (C) 2025 pluslatte
 * This file is part of vrc-avatar-switcher.
 *
 * vrc-avatar-switcher is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * 
 * vrc-avatar-switcher is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with vrc-avatar-switcher. If not, see <https://www.gnu.org/licenses/>. 
*/

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