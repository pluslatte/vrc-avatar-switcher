/*
 * Copyright (C) 2025 pluslatte
 * This file is part of vrc-avatar-switcher.
 *
 * vrc-avatar-switcher is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * 
 * vrc-avatar-switcher is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with vrc-avatar-switcher. If not, see <https://www.gnu.org/licenses/>. 
*/

import TagManager from './TagManager';
import { Avatar, CurrentUser } from '@/lib/models';
import { Tag } from '@/lib/db';
import { ActionIcon, Badge, Divider, Group, Modal, Stack, Text } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { useMemo } from 'react';

interface BulkTagManagerDialogProps {
  opened: boolean;
  onClose: () => void;
  avatars: Array<Avatar>;
  selectedAvatarIds: Array<string>;
  currentUser: CurrentUser;
  tagAvatarRelation: Record<string, Array<Tag>>;
  onBulkTagRemove: (tagName: string) => Promise<void>;
  removingTagName: string | null;
}

const BulkTagManagerDialog = (props: BulkTagManagerDialogProps) => {
  const { opened, onClose, avatars, selectedAvatarIds, currentUser, tagAvatarRelation, onBulkTagRemove, removingTagName } = props;
  const selectedCount = selectedAvatarIds.length;

  const selectedAvatars = useMemo(
    () => avatars.filter(avatar => selectedAvatarIds.includes(avatar.id)),
    [avatars, selectedAvatarIds]
  );

  const commonTags = useMemo(() => {
    if (selectedAvatarIds.length === 0) return [] as Array<Tag>;
    const [firstId, ...restIds] = selectedAvatarIds;
    const firstTags = [...(tagAvatarRelation[firstId] ?? [])];
    return restIds.reduce<Array<Tag>>((acc, avatarId) => {
      const tags = tagAvatarRelation[avatarId] ?? [];
      return acc.filter(tag => tags.some(t => t.display_name === tag.display_name));
    }, firstTags);
  }, [selectedAvatarIds, tagAvatarRelation]);

  if (selectedCount === 0) {
    return null;
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`タグ一括編集（${selectedCount}件）`}
      centered
      size="lg"
    >
      <Stack gap="md">
        <Stack gap={4}>
          <Text size="sm" c="dimmed">
            選択中のアバター
          </Text>
          <Group gap="xs">
            {selectedAvatars.map(avatar => (
              <Badge key={avatar.id} variant="light" color="gray">
                {avatar.name}
              </Badge>
            ))}
          </Group>
        </Stack>

        <Stack gap={4}>
          <Text size="sm" c="dimmed">
            共通タグ
          </Text>
          {commonTags.length > 0 ? (
            <Group gap="xs">
              {commonTags.map(tag => (
                <Badge
                  key={tag.display_name}
                  color={tag.color || 'gray'}
                  rightSection={
                    <ActionIcon
                      size={16}
                      variant="subtle"
                      color="gray"
                      onClick={async () => {
                        await onBulkTagRemove(tag.display_name);
                      }}
                      disabled={removingTagName === tag.display_name}
                    >
                      <IconX size={12} />
                    </ActionIcon>
                  }
                >
                  {tag.display_name}
                </Badge>
              ))}
            </Group>
          ) : (
            <Text size="sm" c="dimmed">
              共通のタグはありません。
            </Text>
          )}
        </Stack>

        <Divider />

        <TagManager
          avatars={avatars}
          avatarIds={selectedAvatarIds}
          tags={commonTags}
          currentUserId={currentUser.id}
          tagAvatarRelation={tagAvatarRelation}
        />
      </Stack>
    </Modal>
  );
};

export default BulkTagManagerDialog;
