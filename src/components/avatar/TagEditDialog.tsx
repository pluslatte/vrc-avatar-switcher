import { availableTagsQueryKey } from '@/hooks/useAvailableTagsQuery';
import { tagAvatarRelationQueryKey } from '@/hooks/useTagAvatarsRelationQuery';
import { Tag, updateTag } from '@/lib/db';
import { Avatar } from '@/lib/models';
import { ActionIcon, Badge, Button, ColorPicker, DEFAULT_THEME, Group, Modal, Stack, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconEdit } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

interface TagEditDialogProps {
  opened: boolean;
  onClose: () => void;
  avatars: Array<Avatar>;
  tags: Array<Tag>;
  currentUserId: string;
}
const TagEditDialog = (props: TagEditDialogProps) => {
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [color, setColor] = useState('#868e96');

  const queryClient = useQueryClient();
  const updateTagMutation = useMutation({
    mutationFn: async ({
      tag, avatars, newDisplayName, newColor, currentUserId
    }: {
      tag: Tag,
      avatars: Array<Avatar>,
      newDisplayName: string,
      newColor: string,
      currentUserId: string
    }) => {
      await updateTag(
        tag.display_name,
        newDisplayName,
        newColor,
        currentUserId
      );
      return { oldName: tag.display_name, newDisplayName, currentUserId, avatars };
    },
    onSuccess: ({ oldName, currentUserId, avatars }) => {
      queryClient.invalidateQueries({ queryKey: availableTagsQueryKey(currentUserId) });
      queryClient.invalidateQueries({ queryKey: tagAvatarRelationQueryKey(avatars, currentUserId) });
      notifications.show({
        title: '成功',
        message: `タグ「${oldName}」を更新しました`,
        color: 'green',
      });
    },
    onError: (error, variables) => {
      const { tag } = variables;
      console.error('Error updating tag:', error);
      notifications.show({
        title: 'エラー',
        message: `タグ「${tag.display_name}」の更新中にエラーが発生しました: ${error.message}`,
        color: 'red',
      });
    }
  });

  const colorNamesA = [
    'red', 'pink', 'grape', 'violet', 'indigo', 'blue', 'cyan',
  ] as const;
  const colorNamesB = [
    'teal', 'green', 'lime', 'yellow', 'orange', 'gray', 'dark'
  ] as const;
  const colorSwatches: string[] = [];
  for (let shade = 2; shade <= 7; shade += 2) {
    for (const colorName of colorNamesA) {
      colorSwatches.push(DEFAULT_THEME.colors[colorName][shade]);
    }
  }
  for (let shade = 2; shade <= 7; shade += 2) {
    for (const colorName of colorNamesB) {
      colorSwatches.push(DEFAULT_THEME.colors[colorName][shade]);
    }
  }

  const handleSave = () => {
    if (!selectedTag) return;
    if (displayName.trim() === '') {
      notifications.show({
        title: 'エラー',
        message: 'タグ名を入力してください',
        color: 'red',
      });
      return;
    }

    updateTagMutation.mutate({
      tag: selectedTag,
      avatars: props.avatars,
      newDisplayName: displayName.trim(),
      newColor: color,
      currentUserId: props.currentUserId,
    });
  };

  return (
    <Modal
      opened={props.opened}
      onClose={props.onClose}
      title="タグを編集"
      centered
      size="md"
    >
      <Stack gap="md">
        {props.tags.map(tag => (
          <Badge
            key={tag.display_name}
            color={tag.color || 'gray'}
            rightSection={
              <ActionIcon
                size={16}
                variant="subtle"
                color="gray"
                onClick={() => {
                  setSelectedTag(tag);
                  setDisplayName(tag.display_name);
                  setColor(tag.color || '#868e96');
                }}
              >
                <IconEdit size={12} />
              </ActionIcon>
            }
          >
            {tag.display_name}
          </Badge>
        ))}
        <ColorPicker
          format="hex"
          value={color}
          onChange={setColor}
          withPicker={false}
          fullWidth
          swatchesPerRow={7}
          swatches={colorSwatches}
        />
        <TextInput
          label="タグ名"
          placeholder="タグ名を入力"
          value={displayName}
          onChange={(event) => setDisplayName(event.currentTarget.value)}
        />
        <Group justify="flex-end" gap="xs">
          <Button
            variant="subtle"
            color="gray"
            onClick={props.onClose}
            disabled={updateTagMutation.isPending}
          >
            キャンセル
          </Button>
          <Button
            color={color}
            onClick={handleSave}
            loading={updateTagMutation.isPending}
            disabled={!selectedTag || displayName.trim() === ''}
          >
            保存
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default TagEditDialog;