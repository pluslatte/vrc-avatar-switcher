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