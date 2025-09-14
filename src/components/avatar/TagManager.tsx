import { Tag } from '@/lib/db';
import { Badge, Box, Button, ColorPicker, DEFAULT_THEME, Divider, Group, Text, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconTagFilled } from '@tabler/icons-react';
import { useState } from 'react';

interface TagManagerProps {
  avatarId: string;
  tags: Array<Tag>;
  currentUserId: string;
  handlerRegisterAvatarTag: (tagName: string, username: string, avatarId: string, color: string) => void;
  handlerRemoveAvatarTag: (tagName: string, avatarId: string, username: string) => void;
}
const TagManager = (props: TagManagerProps) => {
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#2C2E33');
  return (
    <Box>
      <Text size="sm" mb="xs">タグを選択</Text>
      <Group gap="xs" mb="xs">
        {props.tags.length > 0 && props.tags.map(tag => (
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