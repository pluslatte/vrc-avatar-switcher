import { Popover, Tooltip, ActionIcon } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import TagManager from './TagManager';
import { Tag } from '@/lib/db';

interface TagManagerButtonProps {
  avatarId: string;
  tags: Array<Tag>;
  currentUsername: string;
  handlerRegisterAvatarTag: (tagName: string, username: string, avatarId: string, color: string) => void;
  handlerRemoveAvatarTag: (tagName: string, avatarId: string, username: string) => void;
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
          avatarId={props.avatarId}
          tags={props.tags}
          currentUsername={props.currentUsername}
          handlerRegisterAvatarTag={props.handlerRegisterAvatarTag}
          handlerRemoveAvatarTag={props.handlerRemoveAvatarTag}
        />
      </Popover.Dropdown>
    </Popover>
  );
};

export default TagManagerButton;