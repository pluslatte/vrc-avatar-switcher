import { availableTagsQueryKey } from '@/hooks/useAvailableTagsQuery';
import { tagAvatarRelationQueryKey } from '@/hooks/useTagAvatarsRelationQuery';
import { dropTag, Tag } from '@/lib/db';
import { Avatar, CurrentUser } from '@/lib/models';
import { Popover, ActionIcon, Box, Group, Badge } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconTagMinus, IconX } from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';

interface TagsRemovalPopoverProps {
  avatars: Array<Avatar>;
  currentUser: CurrentUser;
  availableTags: Array<Tag>;
}
const TagsRemovalPopover = (props: TagsRemovalPopoverProps) => {
  const queryClient = useQueryClient();
  const handlerDropTag = async (tagName: string, currentUserId: string) => {
    await dropTag(tagName, currentUserId);
    queryClient.invalidateQueries({ queryKey: availableTagsQueryKey(currentUserId) });
    queryClient.invalidateQueries({ queryKey: tagAvatarRelationQueryKey(props.avatars, props.currentUser.id) });
    notifications.show({
      title: 'タグ削除',
      message: `タグ「${tagName}」を削除しました（関連付けられたアバターからも削除されました）`,
      color: 'green',
    });
  };
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
                    handlerDropTag(tag.display_name, props.currentUser.id);
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