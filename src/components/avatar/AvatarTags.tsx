import { Tag } from '@/lib/db';
import { Avatar, CurrentUser } from '@/lib/models';
import { Group, Badge, ActionIcon, Text } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import TagManagerButton from './TagManagerButton';
import { useTagAvatarsRelationMutation } from '@/hooks/useTagAvatarsRelationMutation';

interface AvatarTagsProps {
  avatar: Avatar;
  avatars: Array<Avatar>;
  avatarTags: Array<Tag>;
  currentUser: CurrentUser;
}
const AvatarTags = (props: AvatarTagsProps) => {

  const { removeTagAvatarsRelation } = useTagAvatarsRelationMutation(props.avatars);

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
              removeTagAvatarsRelation({
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