import { useCallback, useEffect, useMemo, useState } from 'react';
import { createTag, createTagRelation, queryAllTagsAvailable, queryTagExists } from '@/lib/db';
import type { Tag } from '@/lib/models';
import { getErrorMessage, notifyError, notifySuccess } from '@/lib/notify';
import { queryKeys } from '@/lib/queryKeys';
import { notifications } from '@mantine/notifications';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface UseTagManagerParams {
  avatarIds: Array<string>;
  tags: Array<Tag>;
  currentUserId: string;
  tagAvatarRelation?: Record<string, Array<Tag>>;
}

export const useTagManager = ({
  avatarIds,
  tags,
  currentUserId,
  tagAvatarRelation,
}: UseTagManagerParams) => {
  const queryClient = useQueryClient();
  const [isRegistering, setIsRegistering] = useState(false);
  const [pendingAssignments, setPendingAssignments] = useState<Record<string, Record<string, string>>>({});
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#2C2E33');

  const resolveTagsOfAvatar = useCallback((avatarId: string) => {
    const baseSource = tagAvatarRelation && tagAvatarRelation[avatarId]
      ? tagAvatarRelation[avatarId]
      : (avatarIds.length === 1 && avatarIds[0] === avatarId ? tags : []);
    const merged = [...baseSource];
    const pendingForAvatar = pendingAssignments[avatarId];
    if (pendingForAvatar) {
      const existingNames = new Set(merged.map(tag => tag.display_name));
      Object.entries(pendingForAvatar).forEach(([tagName, color]) => {
        if (!existingNames.has(tagName)) {
          merged.push({ display_name: tagName, color });
        }
      });
    }
    return merged;
  }, [avatarIds, pendingAssignments, tagAvatarRelation, tags]);

  useEffect(() => {
    if (!tagAvatarRelation) return;
    setPendingAssignments((prev) => {
      let updated = false;
      const next: Record<string, Record<string, string>> = {};
      Object.entries(prev).forEach(([avatarId, tagMap]) => {
        const baseNames = new Set(
          (tagAvatarRelation?.[avatarId] ?? [])
            .map(tag => tag.display_name)
        );
        const filteredEntries = Object.entries(tagMap).filter(([name]) => !baseNames.has(name));
        if (filteredEntries.length > 0) {
          next[avatarId] = Object.fromEntries(filteredEntries);
        }
        if (filteredEntries.length !== Object.keys(tagMap).length) {
          updated = true;
        }
      });
      return updated ? next : prev;
    });
  }, [tagAvatarRelation]);

  const tagsAvailableQuery = useQuery({
    queryKey: queryKeys.availableTags(currentUserId),
    queryFn: async () => {
      return await queryAllTagsAvailable(currentUserId);
    },
  });

  const registerTagToAvatars = useCallback(async (tagName: string, color: string) => {
    if (isRegistering) return;
    const targetAvatarIds = avatarIds.filter((avatarId) => {
      const avatarTags = resolveTagsOfAvatar(avatarId);
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
    const tagExists = await queryTagExists(tagName, currentUserId);
    try {
      if (!tagExists) {
        await createTag(tagName, currentUserId, color);
        notifySuccess('タグ作成', `タグ「${tagName}」を新規作成しました`);
        queryClient.invalidateQueries({ queryKey: queryKeys.availableTags(currentUserId) });
      }
      await Promise.all(targetAvatarIds.map(avatarId => createTagRelation(tagName, avatarId, currentUserId)));
      setPendingAssignments((prev) => {
        const next: Record<string, Record<string, string>> = { ...prev };
        targetAvatarIds.forEach((avatarId) => {
          const current = { ...(next[avatarId] ?? {}) };
          current[tagName] = color;
          next[avatarId] = current;
        });
        return next;
      });
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
  }, [avatarIds, currentUserId, isRegistering, queryClient, resolveTagsOfAvatar]);

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
    if (avatarIds.length === 0) return [];
    return avatarIds.reduce<Array<string>>((common, avatarId, index) => {
      const names = resolveTagsOfAvatar(avatarId).map(tag => tag.display_name);
      if (index === 0) return names;
      const nameSet = new Set(names);
      return common.filter(name => nameSet.has(name));
    }, []);
  }, [avatarIds, resolveTagsOfAvatar]);

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
