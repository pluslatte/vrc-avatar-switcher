/*
 * Copyright (C) 2025 pluslatte
 * This file is part of vrc-avatar-switcher.
 *
 * vrc-avatar-switcher is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * 
 * vrc-avatar-switcher is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with vrc-avatar-switcher. If not, see <https://www.gnu.org/licenses/>. 
*/

import { dropTagRelation, countTagRelationsOf, dropTag } from '@/lib/db';
import { notifications } from '@mantine/notifications';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { availableTagsQueryKey } from './useAvailableTagsQuery';
import { tagAvatarRelationQueryKey } from './useTagAvatarsRelationQuery';
import { Avatar } from '@/lib/models';

export const useTagAvatarsRelationMutation = (avatars: Array<Avatar>) => {
  const queryClient = useQueryClient();
  const removeTagAvatarsRelationMutation = useMutation({
    mutationFn: async (params: { tagName: string; avatarId: string; currentUserId: string }) => {
      await dropTagRelation(params.tagName, params.avatarId, params.currentUserId);
      return { tagName: params.tagName, currentUserId: params.currentUserId };
    },
    onSuccess: async (variables) => {
      const { tagName, currentUserId } = variables;
      const remainingTagRelations = await countTagRelationsOf(tagName, currentUserId);
      if (remainingTagRelations === 0) {
        await dropTag(tagName, currentUserId);
        notifications.show({
          title: 'タグ削除',
          message: `タグ「${tagName}」は他に関連付けられたアバターがないため削除されました`,
          color: 'green',
        });
        queryClient.invalidateQueries({ queryKey: availableTagsQueryKey(currentUserId) });
      }
      queryClient.invalidateQueries({ queryKey: tagAvatarRelationQueryKey(avatars, currentUserId) });
    },
    onError: (error, variables) => {
      const { tagName } = variables;
      console.error('Error removing avatar tag:', error);

      let errorMessage = 'タグの削除中にエラーが発生しました';
      if (error instanceof Error && error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      notifications.show({
        title: 'タグ削除エラー',
        message: `タグ「${tagName}」: ${errorMessage}`,
        color: 'red',
      });
    },
  });

  return {
    removeTagAvatarsRelation: removeTagAvatarsRelationMutation.mutate,
    removeTagAvatarsRelationAsync: removeTagAvatarsRelationMutation.mutateAsync,
    isRemovingTagRelation: removeTagAvatarsRelationMutation.isPending,
  };
};