import { Tag } from '@/lib/db';
import { CurrentUser } from '@/lib/models';
import { Popover, ActionIcon, Box, Group, Badge } from '@mantine/core';
import { IconTagMinus, IconX } from '@tabler/icons-react';

interface TagsRemovalPopoverProps {
  currentUser: CurrentUser;
  availableTags: Array<Tag>;
  handlerDropTag: (tagName: string, currentUserId: string) => void;
}
const TagsRemovalPopover = (props: TagsRemovalPopoverProps) => {
  return (
    <Popover width={300} position="top" withArrow shadow="md">
      <Popover.Target>
        <ActionIcon
          style={{ marginLeft: 'auto' }}
          color="gray"
          variant="subtle"
          radius="sm"
        >
          <IconTagMinus />
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown>
        <Box pos="relative">
          <Group gap="xs">
            {props.availableTags.map((tag) => (
              <Badge color={tag.color || 'gray'} key={tag.display_name}>
                {tag.display_name}
                <ActionIcon
                  size={13}
                  color="dark"
                  variant="transparent"
                  onClick={() => {
                    props.handlerDropTag(tag.display_name, props.currentUser.id);
                  }}
                  style={{ marginLeft: 4, paddingTop: 3 }}
                >
                  <IconX />
                </ActionIcon>
              </Badge>
            ))}
          </Group>
        </Box>
      </Popover.Dropdown>
    </Popover>
  );
};

export default TagsRemovalPopover;