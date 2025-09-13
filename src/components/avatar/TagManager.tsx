import { Box, Divider, Group, Pill, Text } from '@mantine/core';

interface TagManagerProps {
  tags: Record<string, string[]>;
  tagColors: Record<string, string>;
  handlerRegisterAvatarTag: (tags: Record<string, string[]>, tagName: string, avatarId: string) => void;
  handlerRemoveAvatarTag: (tags: Record<string, string[]>, tagName: string, avatarId: string) => void;
  handlerRegisterAvatarTagColor: (tagColors: Record<string, string>, tagName: string, color: string) => void;
}
const TagManager = (props: TagManagerProps) => {
  return (
    <Box>
      <Text size="sm" mb="xs">タグを選択</Text>
      <Group gap="xs" mb="xs">
        {Object.keys(props.tags).map((tag) => (
          <Pill
            key={tag}
            color={props.tagColors[tag] || 'gray'}
            variant="filled"
            style={{ cursor: 'pointer' }}
            onClick={() => {
              props.handlerRegisterAvatarTag(props.tags, tag, 'avatarId');
            }}
          />
        ))}
      </Group>
      <Divider mb="xs" />
      <Text size="sm" mb="xs">新規タグ</Text>
    </Box>
  );
};

export default TagManager;