import { availableTagsQueryKey } from '@/hooks/useAvailableTagsQuery';
import { tagAvatarRelationQueryKey } from '@/hooks/useTagAvatarsRelationQuery';
import { COLOR_SWATCHES } from '@/lib/colorSwatchesPalette';
import { Tag, updateTag } from '@/lib/db';
import { Avatar } from '@/lib/models';
import { Button, ColorPicker, Group, Modal, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconEdit } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useCallback } from 'react';
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
  const onClose = useCallback(() => {
    setSelectedTag(null);
    setTagDisplayName('');
    setColor('#868e96');
    props.onClose();
  }, [setSelectedTag, setTagDisplayName, setColor, props.onClose]);

  const queryClient = useQueryClient();
  const updateTagMutation = useMutation({
    mutationFn: async ({
      tag, avatars, newTagDisplayName, newColor, currentUserId
    }: {
      tag: Tag,
      avatars: Array<Avatar>,
      newTagDisplayName: string,
      newColor: string,
      currentUserId: string
    }) => {
      await updateTag(
        tag.display_name,
        newTagDisplayName,
        newColor,
        currentUserId
      );
      return { oldName: tag.display_name, newTagDisplayName, currentUserId, avatars };
    },
    onSuccess: ({ oldName, newTagDisplayName, currentUserId, avatars }) => {
      queryClient.invalidateQueries({ queryKey: availableTagsQueryKey(currentUserId) });
      queryClient.invalidateQueries({ queryKey: tagAvatarRelationQueryKey(avatars, currentUserId) });
      setTagDisplayName('');
      setSelectedTag(null);
      setColor('#868e96');
      notifications.show({
        title: '成功',
        message: `タグ「${oldName}」を更新しました > ${newTagDisplayName}`,
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

  const handleSave = useCallback(() => {
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
      newTagDisplayName: tagDisplayName.trim(),
      newColor: color,
      currentUserId: props.currentUserId,
    });
  }, [selectedTag, tagDisplayName, color, props.avatars, props.currentUserId, updateTagMutation.mutate]);

  return (
    <Modal
      opened={props.opened}
      onClose={onClose}
      title="タグを編集"
      centered
      size="md"
    >
      <Group gap="xs">
        {!selectedTag && props.tags.map(tag => (
          <Button
            key={tag.display_name}
            color={tag.color || 'gray'}
            onClick={() => {
              setSelectedTag(tag);
              setTagDisplayName(tag.display_name);
              setColor(tag.color || '#868e96');
            }}
            rightSection={(
              <IconEdit size={16} />
            )}
          >
            {tag.display_name}
          </Button>
        ))}
        {selectedTag && (
          <React.Fragment>
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
                onClick={() => {
                  setSelectedTag(null);
                  setTagDisplayName('');
                  setColor('#868e96');
                }}
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
          </React.Fragment>
        )}
      </Group>
    </Modal>
  );
};

export default TagEditDialog;