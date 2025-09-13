import { Popover, Tooltip, ActionIcon } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import TagManager from './TagManager';

interface TagManagerButtonProps {
  tags: Record<string, string[]>;
  tagColors: Record<string, string>;
  handlerRegisterAvatarTag: (tags: Record<string, string[]>, tagName: string, avatarId: string) => void;
  handlerRemoveAvatarTag: (tags: Record<string, string[]>, tagName: string, avatarId: string) => void;
  handlerRegisterAvatarTagColor: (tagColors: Record<string, string>, tagName: string, color: string) => void;
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
          tags={props.tags}
          tagColors={props.tagColors}
          handlerRegisterAvatarTag={props.handlerRegisterAvatarTag}
          handlerRemoveAvatarTag={props.handlerRemoveAvatarTag}
          handlerRegisterAvatarTagColor={props.handlerRegisterAvatarTagColor}
        />
      </Popover.Dropdown>
    </Popover>
  );
};

export default TagManagerButton;