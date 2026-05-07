/*
 * Copyright 2025 pluslatte
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { Tag } from '@/lib/db';
import type { Avatar } from '@/lib/models';
import { Badge, Box, Button, ColorPicker, Divider, Group, Stack, Text, TextInput } from '@mantine/core';
import { IconTagFilled } from '@tabler/icons-react';
import { useTagManager } from '@/hooks/useTagManager';
import { COLOR_SWATCHES } from '@/lib/colorSwatchesPalette';

interface TagManagerProps {
  avatars: Array<Avatar>;
  avatarIds: Array<string>;
  tags: Array<Tag>;
  currentUserId: string;
  tagAvatarRelation?: Record<string, Array<Tag>>;
}
const TagManager = (props: TagManagerProps) => {
  const {
    tagsAvailableQuery,
    isRegistering,
    newTagName,
    setNewTagName,
    newTagColor,
    setNewTagColor,
    disabledTagNames,
    disabledTagNamesUpper,
    handleExistingTagClick,
    handleCreateNewTag,
  } = useTagManager({
    avatars: props.avatars,
    avatarIds: props.avatarIds,
    tags: props.tags,
    currentUserId: props.currentUserId,
    tagAvatarRelation: props.tagAvatarRelation,
  });

  return (
    <Box>
      <Text size="sm" mb="xs">タグを選択</Text>
      {tagsAvailableQuery.isPending && <Text c="dimmed" mb="xs">タグを読み込み中...</Text>}
      {tagsAvailableQuery.data && tagsAvailableQuery.data.length === 0 && <Text c="dimmed" fz="xs" mb="xs">利用可能なタグがありません</Text>}
      {tagsAvailableQuery.data && tagsAvailableQuery.data.length > 0 && (
        <Group gap="xs" mb="xs">
          {tagsAvailableQuery.data.length > 0 && tagsAvailableQuery.data
            .filter(tag => !(disabledTagNames.includes(tag.display_name)))
            .map(tag => (
              <Badge
                key={tag.display_name}
                color={tag.color || 'gray'}
                variant="filled"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  if (isRegistering) return;
                  handleExistingTagClick(tag.display_name, tag.color);
                }}
              >
                {tag.display_name}
              </Badge>
            ))}
        </Group>
      )}
      <Divider mb="xs" />
      <Text size="sm" mb="xs">新規タグ</Text>
      <Stack gap="xs">
        <ColorPicker
          format="hex"
          value={newTagColor}
          onChange={(color) => setNewTagColor(color)}
          withPicker={false}
          fullWidth
          maw={300}
          swatchesPerRow={7}
          swatches={COLOR_SWATCHES}
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
            disabledTagNamesUpper.includes(newTagName.trim().toUpperCase())}
          fullWidth
          onClick={handleCreateNewTag}
          loading={isRegistering}
        >
          追加
          <IconTagFilled style={{ marginLeft: 5 }} />
        </Button>
      </Stack>
    </Box>
  );
};

export default TagManager;