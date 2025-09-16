import { availableTagsQueryKey } from '@/hooks/useAvailableTagsQuery';
import { tagAvatarRelationQueryKey } from '@/hooks/useTagAvatarsRelationQuery';
import { createTag, createTagRelation, queryAllTagsAvailable, queryTagExists, Tag } from '@/lib/db';
import { Avatar } from '@/lib/models';
import { Badge, Box, Button, ColorPicker, DEFAULT_THEME, Divider, Group, Text, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconTagFilled } from '@tabler/icons-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

interface TagManagerProps {
  avatars: Array<Avatar>;
  avatarId: string;
  tags: Array<Tag>;
  currentUserId: string;
}
const TagManager = (props: TagManagerProps) => {
  const queryClient = useQueryClient();
  const handlerRegisterAvatarTag = async (tagName: string, currentUserId: string, avatarId: string, color: string) => {
    const tagExists = await queryTagExists(tagName, currentUserId);
    try {
      if (!tagExists) {
        await createTag(tagName, currentUserId, color);
        notifications.show({
          title: 'タグ作成',
          message: `タグ「${tagName}」を新規作成しました`,
          color: 'green',
        });
        queryClient.invalidateQueries({ queryKey: availableTagsQueryKey(currentUserId) });
      }
      await createTagRelation(tagName, avatarId, currentUserId);
      queryClient.invalidateQueries({ queryKey: tagAvatarRelationQueryKey(props.avatars, props.currentUserId) });
    } catch (error) {
      console.error('Error registering avatar tag:', error);
      notifications.show({
        title: 'タグ登録エラー',
        message: `タグ「${tagName}」の登録中にエラーが発生しました: ${(error as Error).message}`,
        color: 'red',
      });
    }
  };

  const tagsAvailableQuery = useQuery({
    queryKey: ['availableTags', props.currentUserId, props.avatarId],
    queryFn: async () => {
      const tags = await queryAllTagsAvailable(props.currentUserId);
      return tags;
    }
  });

  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#2C2E33');
  return (
    <Box>
      <Text size="sm" mb="xs">タグを選択</Text>
      {tagsAvailableQuery.isPending && <Text c="dimmed" mb="xs">タグを読み込み中...</Text>}
      {tagsAvailableQuery.data && tagsAvailableQuery.data.length === 0 && <Text c="dimmed" fz="xs" mb="xs">利用可能なタグがありません</Text>}
      {tagsAvailableQuery.data && tagsAvailableQuery.data.length > 0 && (
        <Group gap="xs" mb="xs">
          {tagsAvailableQuery.data.length > 0 && tagsAvailableQuery.data
            .filter(tag => !(props.tags.map(t => t.display_name).includes(tag.display_name)))
            .map(tag => (
              <Badge
                key={tag.display_name}
                color={tag.color || 'gray'}
                variant="filled"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  handlerRegisterAvatarTag(tag.display_name, props.currentUserId, props.avatarId, tag.color);
                }}
              >
                {tag.display_name}
              </Badge>
            ))}
        </Group>
      )}
      <Divider mb="xs" />
      <Text size="sm" mb="xs">新規タグ</Text>
      <Group gap="xs">
        <ColorPicker
          format="hex"
          value={newTagColor}
          onChange={(color) => setNewTagColor(color)}
          withPicker={false}
          fullWidth
          swatches={[
            ...DEFAULT_THEME.colors.red.slice(3, 10),
            ...DEFAULT_THEME.colors.green.slice(3, 10),
            ...DEFAULT_THEME.colors.blue.slice(3, 10),
            ...DEFAULT_THEME.colors.yellow.slice(3, 10),
            ...DEFAULT_THEME.colors.dark.slice(3, 10),
          ]}
        />
        <TextInput
          placeholder="タグ名"
          value={newTagName}
          onChange={(event) => setNewTagName(event.currentTarget.value)}
        />
        <Button
          color={newTagColor}
          variant="gradient"
          gradient={{ from: 'dark', to: newTagColor, deg: 45 }}
          disabled={newTagName.trim() === '' ||
            props.tags.some(tag => tag.display_name.toUpperCase() === newTagName.toUpperCase())}
          fullWidth
          onClick={() => {
            notifications.show({
              message: 'タグを作成しています...',
              color: 'blue',
            });
            handlerRegisterAvatarTag(newTagName, props.currentUserId, props.avatarId, newTagColor);
          }}
        >
          追加
          <IconTagFilled style={{ marginLeft: 5 }} />
        </Button>
      </Group>
    </Box>
  );
};

export default TagManager;