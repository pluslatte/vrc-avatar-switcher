/*
 * Copyright (C) 2025 pluslatte
 * This file is part of vrc-avatar-switcher.
 *
 * vrc-avatar-switcher is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * 
 * vrc-avatar-switcher is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with vrc-avatar-switcher. If not, see <https://www.gnu.org/licenses/>. 
*/

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
    handleDelete,
    updateTagMutation,
    dropTagMutation,
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
              w="100%"
              value={tagDisplayName}
              onChange={(event) => setTagDisplayName(event.currentTarget.value)}
            />
            <Group gap="xs" justify="space-between" w="100%">
              <Button
                variant="outline"
                color="red"
                onClick={handleDelete}
                loading={dropTagMutation.isPending}
                disabled={updateTagMutation.isPending}
              >
                削除
              </Button>
              <Group gap="xs">
                <Button
                  variant="subtle"
                  color="gray"
                  onClick={() => {
                    setSelectedTag(null);
                    setTagDisplayName('');
                    setColor('#868e96');
                  }}
                  disabled={updateTagMutation.isPending || dropTagMutation.isPending}
                >
                  キャンセル
                </Button>
                <Button
                  color={color}
                  onClick={handleSave}
                  loading={updateTagMutation.isPending}
                  disabled={tagDisplayName.trim() === '' || dropTagMutation.isPending}
                >
                  保存
                </Button>
              </Group>
            </Group>
          </React.Fragment>
        )}
      </Group>
    </Modal>
  );
};

export default TagEditDialog;