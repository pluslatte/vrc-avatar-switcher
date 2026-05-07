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

import { loadAvatarSortOrder, saveAvatarSortOrder } from '@/lib/db';
import { AvatarSortOrder } from '@/lib/models';
import { useQuery } from '@tanstack/react-query';

export const useAvatarSortOrderSelector = () => {
  const storeQuery = useQuery({
    queryKey: ['avatarSortOrder'],
    queryFn: loadAvatarSortOrder,
    staleTime: Infinity,
  });

  const handleAvatarSortOrderChange = async (newOrder: AvatarSortOrder | null) => {
    if (!newOrder) return;
    await saveAvatarSortOrder(newOrder);
    await storeQuery.refetch();
  };

  return {
    avatarSortOrder: storeQuery.data,
    handleAvatarSortOrderChange,
  };
};