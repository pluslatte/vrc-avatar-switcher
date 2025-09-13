import { Badge, Box, Button, ColorPicker, DEFAULT_THEME, Divider, Group, Text, TextInput } from '@mantine/core';
import { IconTagFilled } from '@tabler/icons-react';
import { useState } from 'react';

interface TagManagerProps {
  avatarId: string;
  tags: Record<string, string[]>;
  tagColors: Record<string, string>;
  handlerRegisterAvatarTag: (tags: Record<string, string[]>, tagName: string, avatarId: string) => void;
  handlerRemoveAvatarTag: (tags: Record<string, string[]>, tagName: string, avatarId: string) => void;
  handlerRegisterAvatarTagColor: (tagColors: Record<string, string>, tagName: string, color: string) => void;
}
const TagManager = (props: TagManagerProps) => {
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#C1C2C5');
  return (
    <Box>
      <Text size="sm" mb="xs">タグを選択</Text>
      <Group gap="xs" mb="xs">
        {Object.keys(props.tags).map((tag) => (
          <Badge
            key={tag}
            color={props.tagColors[tag] || 'gray'}
            variant="filled"
            style={{ cursor: 'pointer' }}
            onClick={() => {
              props.handlerRegisterAvatarTag(props.tags, tag, props.avatarId);
            }}
          >
            {tag}
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
          variant="outline"
          fullWidth
          onClick={() => {
            props.handlerRegisterAvatarTag(props.tags, newTagName, props.avatarId);
            props.handlerRegisterAvatarTagColor(props.tagColors, newTagName, newTagColor);
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