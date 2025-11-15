/*
 * Copyright (C) 2025 pluslatte
 * This file is part of vrc-avatar-switcher.
 *
 * vrc-avatar-switcher is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * 
 * vrc-avatar-switcher is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with vrc-avatar-switcher. If not, see <https://www.gnu.org/licenses/>. 
*/

import { Button, Checkbox, Grid, Group, Indicator, Stack, Text } from '@mantine/core';
import { memo, useMemo } from 'react';
import AvatarCard from './AvatarCard';
import BulkTagManagerDialog from './BulkTagManagerDialog';
import { Avatar, CurrentUser } from '@/lib/models';
import { LoaderFullWindow } from '../LoaderFullWindow';
import { Tag } from '@/lib/db';
import { useAvatarListTagManager } from '@/hooks/useAvatarListTagManager';
import { avatarNameSearchFilterAvatars, avatarTagSearchFilterAvatars } from '@/lib/utils';

interface AvatarListProps {
  avatars: Array<Avatar>;
  tagAvatarRelation: Record<string, Array<Tag>> | undefined;
  tagAvatarRelationLoading: boolean;
  currentUser: CurrentUser;
  pendingSwitch: boolean;
  searchQuery: string;
  cardImageSize: number;
  cardNumberPerRow: number;
  selectedTags: Array<string>;
  handlerAvatarSwitch: (avatarId: string) => void;
}
const AvatarListComponent = (props: AvatarListProps) => {
  const filteredAvatars = useMemo(() => (
    avatarTagSearchFilterAvatars(
      avatarNameSearchFilterAvatars(props.avatars, props.searchQuery),
      props.selectedTags,
      props.tagAvatarRelation,
    )
  ), [props.avatars, props.searchQuery, props.selectedTags, props.tagAvatarRelation]);

  const {
    selectedAvatarIds,
    selectedCount,
    allSelected,
    indeterminate,
    isBulkDialogOpen,
    removingTagName,
    removeTagAvatarsRelation,
    handleAvatarSelectionChange,
    handleSelectAllToggle,
    clearSelection,
    openBulkDialog,
    closeBulkDialog,
    handleBulkTagRemove,
  } = useAvatarListTagManager({
    avatars: props.avatars,
    filteredAvatars,
    currentUser: props.currentUser,
  });

  if (props.tagAvatarRelationLoading) return <LoaderFullWindow message="タグ情報を読み込み中..." withAppShell={true} />;
  if (props.tagAvatarRelation === undefined) return <div>タグ情報の読み込みに失敗しました。</div>;

  const tagAvatarRelation = props.tagAvatarRelation;

  return (
    <Stack gap="md">
      <Group justify="space-between" align="center">
        <Group gap="sm" align="center">
          <Checkbox
            label="全選択"
            checked={allSelected}
            indeterminate={indeterminate}
            onChange={(event) => handleSelectAllToggle(event.currentTarget.checked)}
          />
          <Button
            variant="subtle"
            color="gray"
            onClick={clearSelection}
            disabled={selectedCount === 0}
          >
            全解除
          </Button>
          <Text size="sm" c="dimmed">
            {`選択中: ${selectedCount}件`}
          </Text>
        </Group>
        <Button
          disabled={selectedCount === 0}
          onClick={openBulkDialog}
        >
          タグ一括編集
        </Button>
      </Group>

      <Grid overflow="hidden" gutter="lg">
        {filteredAvatars.map(avatar => {
          const isActive = props.currentUser.currentAvatar === avatar.id;
          const avatarTags = tagAvatarRelation[avatar.id] ?? [];
          const isSelected = selectedAvatarIds.includes(avatar.id);
          const card = (
            <AvatarCard
              avatar={avatar}
              avatars={props.avatars}
              avatarTags={avatarTags}
              currentUser={props.currentUser}
              isActiveAvatar={isActive}
              pendingSwitch={props.pendingSwitch}
              imageSize={props.cardImageSize}
              onAvatarSwitchClicked={props.handlerAvatarSwitch}
              onTagRemove={removeTagAvatarsRelation}
              isSelected={isSelected}
              onSelectionChange={(checked) => handleAvatarSelectionChange(avatar.id, checked)}
            />
          );
          return (
            <Grid.Col span={props.cardNumberPerRow} key={avatar.id}>
              {isActive ? (
                <Indicator
                  processing
                  color="green"
                  size={16}
                  offset={16}
                  withBorder
                  position="top-start"
                >
                  {card}
                </Indicator>
              ) : (
                card
              )}
            </Grid.Col>
          );
        })}
      </Grid>

      <BulkTagManagerDialog
        opened={isBulkDialogOpen}
        onClose={closeBulkDialog}
        avatars={props.avatars}
        selectedAvatarIds={selectedAvatarIds}
        currentUser={props.currentUser}
        tagAvatarRelation={tagAvatarRelation}
        onBulkTagRemove={handleBulkTagRemove}
        removingTagName={removingTagName}
      />
    </Stack>
  );
};

const AvatarList = memo(AvatarListComponent);

export default AvatarList;