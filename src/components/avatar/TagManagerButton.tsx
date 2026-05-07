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

import { Popover, Tooltip, ActionIcon } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import TagManager from './TagManager';
import { Tag } from '@/lib/db';
import { Avatar } from '@/lib/models';

interface TagManagerButtonProps {
  avatars: Array<Avatar>;
  avatarId: string;
  tags: Array<Tag>;
  currentUserId: string;
}
const TagManagerButton = (props: TagManagerButtonProps) => {
  return (
    <Popover width={200} position="bottom" withArrow shadow="md">
      <Popover.Target>
        <Tooltip
          label="タグを追加"
        >
          <ActionIcon
            style={{ marginLeft: 'auto' }}
            size={20}
            color="gray"
            variant="subtle"
            radius="sm"
          >
            <IconPlus />
          </ActionIcon>
        </Tooltip>
      </Popover.Target>
      <Popover.Dropdown w={300}>
        <TagManager
          avatars={props.avatars}
          avatarIds={[props.avatarId]}
          tags={props.tags}
          currentUserId={props.currentUserId}
        />
      </Popover.Dropdown>
    </Popover>
  );
};

export default TagManagerButton;