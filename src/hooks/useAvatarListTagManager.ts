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

import { useCallback, useEffect, useMemo, useState } from 'react';
import { notifications } from '@mantine/notifications';
import { Avatar, CurrentUser } from '@/lib/models';
import { useTagAvatarsRelationMutation } from './useTagAvatarsRelationMutation';

interface UseAvatarListTagManagerParams {
    avatars: Array<Avatar>;
    filteredAvatars: Array<Avatar>;
    currentUser: CurrentUser;
}

export const useAvatarListTagManager = ({
    avatars,
    filteredAvatars,
    currentUser,
}: UseAvatarListTagManagerParams) => {
    const { removeTagAvatarsRelation, removeTagAvatarsRelationAsync, isRemovingTagRelation } = useTagAvatarsRelationMutation(avatars);

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
                await removeTagAvatarsRelationAsync({ tagName, avatarId, currentUserId: currentUser.id });
            }
            notifications.show({
                title: 'タグ削除',
                message: `タグ「${tagName}」を選択中のアバターから削除しました。`,
                color: 'green',
            });
        } catch (error) {
            console.error('Bulk tag removal failed:', error);

            let errorMessage = 'タグの一括削除中にエラーが発生しました';
            if (error instanceof Error && error.message) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }

            notifications.show({
                title: 'タグ一括削除エラー',
                message: `タグ「${tagName}」: ${errorMessage}`,
                color: 'red',
            });
        } finally {
            setRemovingTagName(null);
        }
    }, [currentUser.id, removeTagAvatarsRelationAsync, selectedAvatarIds]);

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
