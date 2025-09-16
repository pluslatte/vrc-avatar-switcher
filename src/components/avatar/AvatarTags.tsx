import { countTagRelationsOf, dropTag, dropTagRelation, Tag } from '@/lib/db';
import { Avatar, CurrentUser } from '@/lib/models';
import { Group, Badge, ActionIcon, Text } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import TagManagerButton from './TagManagerButton';
import { notifications } from '@mantine/notifications';
import { useQueryClient } from '@tanstack/react-query';
import { availableTagsQueryKey } from '@/hooks/useAvailableTagsQuery';
import { tagAvatarRelationQueryKey } from '@/hooks/useTagAvatarsRelationQuery';

interface AvatarTagsProps {
  avatar: Avatar;
  avatars: Array<Avatar>;
  avatarTags: Array<Tag>;
  currentUser: CurrentUser;
}
const AvatarTags = (props: AvatarTagsProps) => {
  const queryClient = useQueryClient();
  const RemoveAvatarTag = async (tagName: string, avatarId: string, currentUserId: string) => {
    try {
      await dropTagRelation(tagName, avatarId, currentUserId);
      const remainingTagRelations = await countTagRelationsOf(tagName, currentUserId);
      if (remainingTagRelations === 0) {
        await dropTag(tagName, currentUserId);
        notifications.show({
          title: 'タグ削除',
          message: `タグ「${tagName}」は他に関連付けられたアバターがないため削除されました`,
          color: 'green',
        });
        queryClient.invalidateQueries({ queryKey: availableTagsQueryKey(currentUserId) });
      }
      queryClient.invalidateQueries({ queryKey: tagAvatarRelationQueryKey(props.avatars, props.currentUser.id) });
    } catch (error) {
      console.error('Error removing avatar tag:', error);
      notifications.show({
        title: 'タグ削除エラー',
        message: `タグ「${tagName}」の削除中にエラーが発生しました: ${(error as Error).message}`,
        color: 'red',
      });
    }
  };

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
              RemoveAvatarTag(tag.display_name, props.avatar.id, props.currentUser.id);
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