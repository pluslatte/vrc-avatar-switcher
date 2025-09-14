import { queryAllTagsAvailable, Tag } from '@/lib/db';
import { Badge, Box, Button, ColorPicker, DEFAULT_THEME, Divider, Group, Text, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconTagFilled } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

interface TagManagerProps {
  avatarId: string;
  tags: Array<Tag>;
  currentUserId: string;
  handlerRegisterAvatarTag: (tagName: string, currentUserId: string, avatarId: string, color: string) => Promise<void>;
  handlerRemoveAvatarTag: (tagName: string, avatarId: string, currentUserId: string) => Promise<void>;
}
const TagManager = (props: TagManagerProps) => {
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
          {tagsAvailableQuery.data.length > 0 && tagsAvailableQuery.data.map(tag => (
            <Badge
              key={tag.display_name}
              color={tag.color || 'gray'}
              variant="filled"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                notifications.show({
                  message: 'タグを追加しています...',
                  color: 'blue',
                });
                props.handlerRegisterAvatarTag(tag.display_name, props.currentUserId, props.avatarId, tag.color);
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
              message: 'タグを追加しています...',
              color: 'blue',
            });
            props.handlerRegisterAvatarTag(newTagName, props.currentUserId, props.avatarId, newTagColor);
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