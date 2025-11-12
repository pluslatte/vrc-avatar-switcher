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