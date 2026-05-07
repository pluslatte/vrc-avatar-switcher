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

import { useAvatarSortOrderSelector } from './useAvatarSortOrderSelector';
import { useAvatarListQuery } from './useAvatarListQuery';
import { useSwitchAvatarMutation } from './useSwitchAvatarMutation';
import { useAvailableTagsQuery } from './useAvailableTagsQuery';
import { useTagAvatarsRelationQuery } from './useTagAvatarsRelationQuery';

export const useAvatarSwitcher = () => {
  const { avatarSortOrder, handleAvatarSortOrderChange } = useAvatarSortOrderSelector();

  const avatarListQuery = useAvatarListQuery(avatarSortOrder);
  const switchAvatarMutation = useSwitchAvatarMutation(avatarSortOrder);
  const availableTagsQuery = useAvailableTagsQuery(avatarListQuery.data);
  const tagAvatarsRelationQuery = useTagAvatarsRelationQuery(avatarListQuery.data);

  return {
    avatarListQuery,
    switchAvatarMutation,
    avatarSortOrder,
    tagsLoading: availableTagsQuery.isPending,
    availableTags: availableTagsQuery.data,
    tagAvatarRelationLoading: tagAvatarsRelationQuery.isPending,
    tagAvatarRelation: tagAvatarsRelationQuery.data,
    handleAvatarSortOrderChange,
    handlerAvatarSwitch: switchAvatarMutation.mutate,
    // https://github.com/pluslatte/vrc-avatar-switcher/pull/3#issuecomment-3522684051 
  };
};