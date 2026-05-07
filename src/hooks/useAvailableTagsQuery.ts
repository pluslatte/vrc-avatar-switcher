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