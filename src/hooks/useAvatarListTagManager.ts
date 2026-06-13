import { useCallback, useEffect, useMemo, useState } from 'react';
import { Avatar } from '@/lib/models';
import { getErrorMessage, notifyError, notifySuccess } from '@/lib/notify';
import { useTagAvatarsRelationMutation } from './useTagAvatarsRelationMutation';

interface UseAvatarListTagManagerParams {
  filteredAvatars: Array<Avatar>;
  currentUserId: string;
}

export const useAvatarListTagManager = ({
  filteredAvatars,
  currentUserId,
}: UseAvatarListTagManagerParams) => {
  const { removeTagAvatarsRelation, removeTagAvatarsRelationAsync, isRemovingTagRelation } = useTagAvatarsRelationMutation();

  const [selectedAvatarIds, setSelectedAvatarIds] = useState<Array<string>>([]);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [removingTagName, setRemovingTagName] = useState<string | null>(null);

  const visibleAvatarIds = useMemo(() => filteredAvatars.map(avatar => avatar.id), [filteredAvatars]);

  useEffect(() => {
    setSelectedAvatarIds(prev => {
      const next = prev.filter(id => visibleAvatarIds.includes(id));
      return next.length === prev.length ? prev : next;
    });
  }, [visibleAvatarIds]);

  useEffect(() => {
    if (selectedAvatarIds.length === 0 && isBulkDialogOpen) {
      setIsBulkDialogOpen(false);
    }
  }, [selectedAvatarIds, isBulkDialogOpen]);

  const handleAvatarSelectionChange = useCallback((avatarId: string, checked: boolean) => {
    setSelectedAvatarIds(prev => {
      if (checked) {
        if (prev.includes(avatarId)) return prev;
        return [...prev, avatarId];
      }
      return prev.filter(id => id !== avatarId);
    });
  }, []);

  const handleSelectAllToggle = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedAvatarIds(visibleAvatarIds);
    } else {
      setSelectedAvatarIds([]);
    }
  }, [visibleAvatarIds]);

  const clearSelection = useCallback(() => {
    setSelectedAvatarIds([]);
  }, []);

  const openBulkDialog = useCallback(() => {
    setIsBulkDialogOpen(true);
  }, []);

  const closeBulkDialog = useCallback(() => {
    setIsBulkDialogOpen(false);
  }, []);

  const handleBulkTagRemove = useCallback(async (tagName: string) => {
    if (selectedAvatarIds.length === 0) return;
    setRemovingTagName(tagName);
    try {
      for (const avatarId of selectedAvatarIds) {
        await removeTagAvatarsRelationAsync({ tagName, avatarId, currentUserId });
      }
      notifySuccess('タグ削除', `タグ「${tagName}」を選択中のアバターから削除しました。`);
    } catch (error) {
      console.error('Bulk tag removal failed:', error);
      const message = getErrorMessage(error, 'タグの一括削除中にエラーが発生しました');
      notifyError('タグ一括削除エラー', `タグ「${tagName}」: ${message}`);
    } finally {
      setRemovingTagName(null);
    }
  }, [currentUserId, removeTagAvatarsRelationAsync, selectedAvatarIds]);

  const selectedCount = selectedAvatarIds.length;
  const allSelected = filteredAvatars.length > 0 && selectedCount === filteredAvatars.length;
  const indeterminate = selectedCount > 0 && selectedCount < filteredAvatars.length;

  return {
    selectedAvatarIds,
    selectedCount,
    allSelected,
    indeterminate,
    isBulkDialogOpen,
    removingTagName,
    isRemovingTagRelation,
    removeTagAvatarsRelation,
    handleAvatarSelectionChange,
    handleSelectAllToggle,
    clearSelection,
    openBulkDialog,
    closeBulkDialog,
    handleBulkTagRemove,
  };
};
