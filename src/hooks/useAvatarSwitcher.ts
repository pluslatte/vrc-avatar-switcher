/*
 * Copyright (C) 2025 pluslatte
 * This file is part of vrc-avatar-switcher.
 *
 * vrc-avatar-switcher is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * 
 * vrc-avatar-switcher is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with vrc-avatar-switcher. If not, see <https://www.gnu.org/licenses/>. 
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