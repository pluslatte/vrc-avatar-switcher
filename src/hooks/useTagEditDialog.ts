import { updateTag, dropTag } from '@/lib/db';
import { Tag } from '@/lib/models';
import { getErrorMessage, notifyError, notifySuccess } from '@/lib/notify';
import { queryKeys } from '@/lib/queryKeys';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useState, useCallback } from 'react';

const DEFAULT_COLOR = '#868e96';

export const useTagEditDialog = (onCloseSuper: () => void, currentUserId: string) => {
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [tagDisplayName, setTagDisplayName] = useState('');
  const [color, setColor] = useState(DEFAULT_COLOR);

  const resetForm = useCallback(() => {
    setSelectedTag(null);
    setTagDisplayName('');
    setColor(DEFAULT_COLOR);
  }, []);

  const onClose = useCallback(() => {
    resetForm();
    onCloseSuper();
  }, [onCloseSuper, resetForm]);

  const queryClient = useQueryClient();
  const invalidateTagQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.availableTags(currentUserId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.tagAvatarRelationsAll(currentUserId) });
  }, [queryClient, currentUserId]);

  const updateTagMutation = useMutation({
    mutationFn: async ({
      tag, newTagDisplayName, newColor
    }: {
      tag: Tag,
      newTagDisplayName: string,
      newColor: string,
    }) => {
      await updateTag(
        tag.display_name,
        newTagDisplayName,
        newColor,
        currentUserId
      );
      return { oldName: tag.display_name, newTagDisplayName };
    },
    onSuccess: ({ oldName, newTagDisplayName }) => {
      invalidateTagQueries();
      resetForm();
      notifySuccess('成功', `タグ「${oldName}」を更新しました > ${newTagDisplayName}`);
    },
    onError: (error, variables) => {
      const { tag } = variables;
      console.error('Error updating tag:', error);
      const message = getErrorMessage(error, 'タグの更新中にエラーが発生しました');
      notifyError('エラー', `タグ「${tag.display_name}」の更新に失敗しました: ${message}`);
    }
  });

  const { mutate: mutateUpdateTag } = updateTagMutation;
  const handleSave = useCallback(() => {
    if (!selectedTag) return;
    if (tagDisplayName.trim() === '') {
      notifyError('エラー', 'タグ名を入力してください');
      return;
    }

    mutateUpdateTag({
      tag: selectedTag,
      newTagDisplayName: tagDisplayName.trim(),
      newColor: color,
    });
  }, [selectedTag, tagDisplayName, color, mutateUpdateTag]);

  const dropTagMutation = useMutation({
    mutationFn: async ({ tagName }: { tagName: string }) => {
      await dropTag(tagName, currentUserId);
      return { tagName };
    },
    onSuccess: ({ tagName }) => {
      invalidateTagQueries();
      resetForm();
      notifySuccess('タグ削除', `タグ「${tagName}」を削除しました（関連付けられたアバターからも削除されました）`);
    },
    onError: (error, variables) => {
      const { tagName } = variables;
      console.error('Error dropping tag:', error);
      const message = getErrorMessage(error, 'タグの削除中にエラーが発生しました');
      notifyError('タグ削除エラー', `タグ「${tagName}」: ${message}`);
    }
  });

  const { mutate: mutateDropTag } = dropTagMutation;
  const handleDelete = useCallback(() => {
    if (!selectedTag) return;
    mutateDropTag({ tagName: selectedTag.display_name });
  }, [selectedTag, mutateDropTag]);

  return {
    selectedTag,
    setSelectedTag,
    tagDisplayName,
    setTagDisplayName,
    color,
    setColor,
    resetForm,
    handleSave,
    handleDelete,
    updateTagMutation,
    dropTagMutation,
    onClose,
  };
};
