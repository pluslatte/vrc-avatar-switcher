/*
 * Copyright (C) 2025 pluslatte
 * This file is part of vrc-avatar-switcher.
 *
 * vrc-avatar-switcher is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * 
 * vrc-avatar-switcher is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with vrc-avatar-switcher. If not, see <https://www.gnu.org/licenses/>. 
*/

import { Tag } from '@/lib/db';
import { Avatar, CurrentUser } from '@/lib/models';
import { Group, Badge, ActionIcon, Text } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import TagManagerButton from './TagManagerButton';

interface AvatarTagsProps {
  avatar: Avatar;
  avatars: Array<Avatar>;
  avatarTags: Array<Tag>;
  currentUser: CurrentUser;
  onTagRemove: (params: { tagName: string; avatarId: string; currentUserId: string }) => void;
}
const AvatarTags = (props: AvatarTagsProps) => {
  return (
    <Group gap="xs">
      {props.avatarTags.map((tag) => (
        <Badge color={tag.color || 'gray'} key={tag.display_name}>
          {tag.display_name}
          <ActionIcon
            size={13}
            color="white"
            variant="transparent"
            onClick={() => {
              props.onTagRemove({
                tagName: tag.display_name,
                avatarId: props.avatar.id,
                currentUserId: props.currentUser.id
              });
            }}
            style={{ marginLeft: 4, paddingTop: 3 }}
          >
            <IconX />
          </ActionIcon>
        </Badge>
      ))}
      {props.avatarTags.length === 0 && <Text c="dimmed" fz="sm">タグが設定されていません</Text>}
      <TagManagerButton
        avatars={props.avatars}
        avatarId={props.avatar.id}
        tags={props.avatarTags}
        currentUserId={props.currentUser.id}
      />
    </Group>
  );
};

export default AvatarTags;