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