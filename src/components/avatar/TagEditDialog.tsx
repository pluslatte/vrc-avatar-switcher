import { useTagEditDialog } from '@/hooks/useTagEditDialog';
import { COLOR_SWATCHES } from '@/lib/colorSwatchesPalette';
import { Tag } from '@/lib/db';
import { Avatar } from '@/lib/models';
import { Button, ColorPicker, Group, Modal, TextInput } from '@mantine/core';
import { IconEdit } from '@tabler/icons-react';
import React from 'react';

interface TagEditDialogProps {
  opened: boolean;
  onClose: () => void;
  avatars: Array<Avatar>;
  tags: Array<Tag>;
  currentUserId: string;
}
const TagEditDialog = (props: TagEditDialogProps) => {
  const {
    selectedTag,
    setSelectedTag,
    tagDisplayName,
    setTagDisplayName,
    color,
    setColor,
    handleSave,
    updateTagMutation,
    onClose,
  } = useTagEditDialog(
    props.onClose,
    props.avatars,
    props.currentUserId
  );

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
                disabled={tagDisplayName.trim() === ''}
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