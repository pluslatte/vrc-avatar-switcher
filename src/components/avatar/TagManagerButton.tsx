/*
 * Copyright (C) 2025 pluslatte
 * This file is part of vrc-avatar-switcher.
 *
 * vrc-avatar-switcher is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * 
 * vrc-avatar-switcher is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with vrc-avatar-switcher. If not, see <https://www.gnu.org/licenses/>. 
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
      <Popover.Dropdown>
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