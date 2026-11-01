import { useCallback, useMemo, useState } from 'react';
import { createTag, createTagRelation, queryTagExists } from '@/lib/db';
import { AvatarTags, commonAvatarTags } from '@/lib/avatarTags';
import { usePendingAvatarTags } from './usePendingAvatarTags';
import { useAvailableTagsQuery } from './useAvailableTagsQuery';
import { getErrorMessage, notifyError, notifySuccess } from '@/lib/notify';
import { queryKeys } from '@/lib/queryKeys';
import { notifications } from '@mantine/notifications';
import { useQueryClient } from '@tanstack/react-query';

interface UseTagManagerParams {
  avatarIds: Array<string>;
  currentUserId: string;
  tagAvatarRelation: AvatarTags;
}

export const useTagManager = ({
  avatarIds,
  currentUserId,
  tagAvatarRelation,
}: UseTagManagerParams) => {
  const queryClient = useQueryClient();
  const [isRegistering, setIsRegistering] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#2C2E33');

  const { tagsOfAvatar, addPendingTag } = usePendingAvatarTags(tagAvatarRelation);
  const tagsAvailableQuery = useAvailableTagsQuery(currentUserId);

  const registerTagToAvatars = useCallback(async (tagName: string, color: string) => {
    if (isRegistering) return;
    const targetAvatarIds = avatarIds.filter((avatarId) => {
      const avatarTags = tagsOfAvatar(avatarId);
      return !avatarTags.some(tag => tag.display_name === tagName);
    });
    if (targetAvatarIds.length === 0) {
      notifications.show({
        title: 'タグ追加',
        message: `タグ「${tagName}」は対象のアバターにすでに割り当て済みです。`,
        color: 'yellow',
      });
      return;
    }
    setIsRegistering(true);
    try {
      const tagExists = await queryTagExists(tagName, currentUserId);
      if (!tagExists) {
        await createTag(tagName, currentUserId, color);
        notifySuccess('タグ作成', `タグ「${tagName}」を新規作成しました`);
        queryClient.invalidateQueries({ queryKey: queryKeys.availableTags(currentUserId) });
      }
      await Promise.all(targetAvatarIds.map(avatarId => createTagRelation(tagName, avatarId, currentUserId)));
      addPendingTag(targetAvatarIds, { display_name: tagName, color });
      setNewTagName('');
      notifySuccess('タグ追加', `タグ「${tagName}」を${targetAvatarIds.length}件のアバターに追加しました。`);
      queryClient.invalidateQueries({ queryKey: queryKeys.tagAvatarRelationsAll(currentUserId) });
    } catch (error) {
      console.error('Error registering avatar tag:', error);
      const message = getErrorMessage(error, 'タグの登録中にエラーが発生しました');
      notifyError('タグ登録エラー', `タグ「${tagName}」: ${message}`);
    } finally {
      setIsRegistering(false);
    }
  }, [avatarIds, currentUserId, isRegistering, queryClient, tagsOfAvatar, addPendingTag]);

  const handleExistingTagClick = useCallback((tagName: string, color: string) => {
    void registerTagToAvatars(tagName, color);
  }, [registerTagToAvatars]);

  const handleCreateNewTag = useCallback(() => {
    if (newTagName.trim() === '') return;
    notifications.show({
      message: 'タグを作成しています...',
      color: 'blue',
    });
    void registerTagToAvatars(newTagName, newTagColor);
  }, [newTagColor, newTagName, registerTagToAvatars]);

  const disabledTagNames = useMemo(() => {
    const relations = Object.fromEntries(avatarIds.map(id => [id, tagsOfAvatar(id)]));
    return commonAvatarTags(avatarIds, relations).map(tag => tag.display_name);
  }, [avatarIds, tagsOfAvatar]);

  const disabledTagNamesUpper = useMemo(
    () => disabledTagNames.map(name => name.toUpperCase()),
    [disabledTagNames]
  );

  return {
    tagsAvailableQuery,
    isRegistering,
    newTagName,
    setNewTagName,
    newTagColor,
    setNewTagColor,
    disabledTagNames,
    disabledTagNamesUpper,
    handleExistingTagClick,
    handleCreateNewTag,
  };
};
