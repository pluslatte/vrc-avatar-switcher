import { availableTagsQueryKey } from '@/hooks/useAvailableTagsQuery';
import { tagAvatarRelationQueryKey } from '@/hooks/useTagAvatarsRelationQuery';
import { COLOR_SWATCHES } from '@/lib/colorSwatchesPalette';
import { Tag, updateTag } from '@/lib/db';
import { Avatar } from '@/lib/models';
import { ActionIcon, Badge, Button, ColorPicker, Group, Modal, TextInput } from '@mantine/core';
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
  const [tagDisplayName, setTagDisplayName] = useState('');
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
      setTagDisplayName('');
      setSelectedTag(null);
      setColor('#868e96');
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

  const handleSave = () => {
    if (!selectedTag) return;
    if (tagDisplayName.trim() === '') {
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
      newDisplayName: tagDisplayName.trim(),
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
      <Group gap="xs">
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
                  setTagDisplayName(tag.display_name);
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
          swatches={COLOR_SWATCHES}
        />
        <TextInput
          label="タグ名"
          placeholder="タグ名を入力"
          value={tagDisplayName}
          onChange={(event) => setTagDisplayName(event.currentTarget.value)}
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
            disabled={!selectedTag || tagDisplayName.trim() === ''}
          >
            保存
          </Button>
        </Group>
      </Group>
    </Modal>
  );
};

export default TagEditDialog;