import { useCallback, useEffect, useMemo, useState } from 'react';
import { availableTagsQueryKey } from './useAvailableTagsQuery';
import { tagAvatarRelationQueryKey } from './useTagAvatarsRelationQuery';
import { createTag, createTagRelation, queryAllTagsAvailable, queryTagExists } from '@/lib/db';
import type { Tag } from '@/lib/db';
import type { Avatar } from '@/lib/models';
import { notifications } from '@mantine/notifications';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface UseTagManagerParams {
    avatars: Array<Avatar>;
    avatarIds: Array<string>;
    tags: Array<Tag>;
    currentUserId: string;
    tagAvatarRelation?: Record<string, Array<Tag>>;
}

export const useTagManager = ({
    avatars,
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
        queryKey: availableTagsQueryKey(currentUserId),
        queryFn: async () => {
            const fetchedTags = await queryAllTagsAvailable(currentUserId);
            return fetchedTags;
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
                notifications.show({
                    title: 'タグ作成',
                    message: `タグ「${tagName}」を新規作成しました`,
                    color: 'green',
                });
                queryClient.invalidateQueries({ queryKey: availableTagsQueryKey(currentUserId) });
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
            notifications.show({
                title: 'タグ追加',
                message: `タグ「${tagName}」を${targetAvatarIds.length}件のアバターに追加しました。`,
                color: 'green',
            });
            queryClient.invalidateQueries({ queryKey: tagAvatarRelationQueryKey(avatars, currentUserId) });
        } catch (error) {
            console.error('Error registering avatar tag:', error);

            let errorMessage = 'タグの登録中にエラーが発生しました';
            if (error instanceof Error && error.message) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }

            notifications.show({
                title: 'タグ登録エラー',
                message: `タグ「${tagName}」: ${errorMessage}`,
                color: 'red',
            });
        } finally {
            setIsRegistering(false);
        }
    }, [avatarIds, avatars, currentUserId, isRegistering, queryClient, resolveTagsOfAvatar]);

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
