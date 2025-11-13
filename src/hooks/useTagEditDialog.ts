import { Tag, updateTag } from '@/lib/db';
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
  }, [selectedTag, tagDisplayName, color, avatars, currentUserId, updateTagMutation.mutate]);


  return {
    selectedTag,
    setSelectedTag,
    tagDisplayName,
    setTagDisplayName,
    color,
    setColor,
    handleSave,
    updateTagMutation,
    onClose,
  };
};