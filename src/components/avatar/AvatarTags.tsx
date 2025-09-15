import { Tag } from '@/lib/db';
import { Avatar, CurrentUser } from '@/lib/models';
import { Group, Badge, ActionIcon, Text } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import TagManagerButton from './TagManagerButton';

interface AvatarTagsProps {
  avatar: Avatar;
  avatarTags: Array<Tag>;
  currentUser: CurrentUser;
  handlerRegisterAvatarTag: (tagName: string, currentUserId: string, avatarId: string, color: string) => Promise<void>;
  handlerRemoveAvatarTag: (tagName: string, avatarId: string, currentUserId: string) => Promise<void>;
}
const AvatarTags = (props: AvatarTagsProps) => {
  return (
  <Group gap="xs">
    {props.avatarTags.map((tag) => (
      <Badge color={tag.color || 'gray'} key={tag.display_name}>
        {tag.display_name}
        <ActionIcon
          size={13}
          color="dark"
          variant="transparent"
          onClick={() => {
            props.handlerRemoveAvatarTag(tag.display_name, props.avatar.id, props.currentUser.id);
          }}
          style={{ marginLeft: 4, paddingTop: 3 }}
        >
          <IconX />
        </ActionIcon>
      </Badge>
    ))}
    {props.avatarTags.length === 0 && <Text c="dimmed" fz="sm">タグが設定されていません</Text>}
    <TagManagerButton
      avatarId={props.avatar.id}
      tags={props.avatarTags}
      currentUserId={props.currentUser.id}
      handlerRegisterAvatarTag={props.handlerRegisterAvatarTag}
      handlerRemoveAvatarTag={props.handlerRemoveAvatarTag}
    />
  </Group>
  );
};

export default AvatarTags;