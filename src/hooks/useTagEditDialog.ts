/*
 * Copyright (C) 2025 pluslatte
 * This file is part of vrc-avatar-switcher.
 *
 * vrc-avatar-switcher is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * 
 * vrc-avatar-switcher is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with vrc-avatar-switcher. If not, see <https://www.gnu.org/licenses/>. 
*/

import { Tag, updateTag, dropTag } from '@/lib/db';
import { Avatar } from '@/lib/models';
import { notifications } from '@mantine/notifications';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import { availableTagsQueryKey } from './useAvailableTagsQuery';
import { tagAvatarRelationQueryKey } from './useTagAvatarsRelationQuery';

export const useTagEditDialog = (onCloseSuper: () => void, avatars: Array<Avatar>, currentUserId: string) => {
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [tagDisplayName, setTagDisplayName] = useState('');
  const [color, setColor] = useState('#868e96');
  const onClose = useCallback(() => {
    setSelectedTag(null);
    setTagDisplayName('');
    setColor('#868e96');
    onCloseSuper();
  }, [onCloseSuper]);

  const queryClient = useQueryClient();
  const updateTagMutation = useMutation({
    mutationFn: async ({
      tag, avatars, newTagDisplayName, newColor, currentUserId
    }: {
      tag: Tag,
      avatars: Array<Avatar>,
      newTagDisplayName: string,
      newColor: string,
      currentUserId: string
    }) => {
      await updateTag(
        tag.display_name,
        newTagDisplayName,
        newColor,
        currentUserId
      );
      return { oldName: tag.display_name, newTagDisplayName, currentUserId, avatars };
    },
    onSuccess: ({ oldName, newTagDisplayName, currentUserId, avatars }) => {
      queryClient.invalidateQueries({ queryKey: availableTagsQueryKey(currentUserId) });
      queryClient.invalidateQueries({ queryKey: tagAvatarRelationQueryKey(avatars, currentUserId) });
      setTagDisplayName('');
      setSelectedTag(null);
      setColor('#868e96');
      notifications.show({
        title: '成功',
        message: `タグ「${oldName}」を更新しました > ${newTagDisplayName}`,
        color: 'green',
      });
    },
    onError: (error, variables) => {
      const { tag } = variables;
      console.error('Error updating tag:', error);

      let errorMessage = 'タグの更新中にエラーが発生しました';
      if (error instanceof Error && error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      notifications.show({
        title: 'エラー',
        message: `タグ「${tag.display_name}」の更新に失敗しました: ${errorMessage}`,
        color: 'red',
      });
    }
  });

  const handleSave = useCallback(() => {
    if (!selectedTag) return;
    if (tagDisplayName.trim() === '') {
      notifications.show({
        title: 'エラー',
        message: 'タグ名を入力してください',
        color: 'red',
      });
      return;
    }

    updateTagMutation.mutate({
      tag: selectedTag,
      avatars,
      newTagDisplayName: tagDisplayName.trim(),
      newColor: color,
      currentUserId,
    });
  }, [selectedTag, tagDisplayName, color, avatars, currentUserId]);

  const dropTagMutation = useMutation({
    mutationFn: async ({
      tagName,
      currentUserId
    }: {
      tagName: string,
      currentUserId: string
    }) => {
      await dropTag(tagName, currentUserId);
      return { tagName, currentUserId };
    },
    onSuccess: ({ tagName, currentUserId }) => {
      queryClient.invalidateQueries({ queryKey: availableTagsQueryKey(currentUserId) });
      queryClient.invalidateQueries({ queryKey: tagAvatarRelationQueryKey(avatars, currentUserId) });
      setTagDisplayName('');
      setSelectedTag(null);
      setColor('#868e96');
      notifications.show({
        title: 'タグ削除',
        message: `タグ「${tagName}」を削除しました（関連付けられたアバターからも削除されました）`,
        color: 'green',
      });
    },
    onError: (error, variables) => {
      const { tagName } = variables;
      console.error('Error dropping tag:', error);

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
    }
  });

  const handleDelete = useCallback(() => {
    if (!selectedTag) return;

    dropTagMutation.mutate({
      tagName: selectedTag.display_name,
      currentUserId,
    });
  }, [selectedTag, currentUserId]);

  return {
    selectedTag,
    setSelectedTag,
    tagDisplayName,
    setTagDisplayName,
    color,
    setColor,
    handleSave,
    handleDelete,
    updateTagMutation,
    dropTagMutation,
    onClose,
  };
};