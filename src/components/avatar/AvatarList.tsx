import { Button, Checkbox, Grid, Group, Indicator, Stack, Text } from '@mantine/core';
import AvatarCard from './AvatarCard';
import { Avatar, CurrentUser } from '@/lib/models';
import { LoaderFullWindow } from '../LoaderFullWindow';
import { avatarNameSearchFilterAvatars, avatarTagSearchFilterAvatars } from '@/lib/utils';
import { useTagAvatarsRelationMutation } from '@/hooks/useTagAvatarsRelationMutation';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { notifications } from '@mantine/notifications';
import BulkTagManagerDialog from './BulkTagManagerDialog';
import { Tag } from '@/lib/db';

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

  const { removeTagAvatarsRelation, removeTagAvatarsRelationAsync } = useTagAvatarsRelationMutation(props.avatars);
  const [selectedAvatarIds, setSelectedAvatarIds] = useState<Array<string>>([]);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [removingTagName, setRemovingTagName] = useState<string | null>(null);

  const filteredAvatars = useMemo(() => (
    avatarTagSearchFilterAvatars(
      avatarNameSearchFilterAvatars(props.avatars, props.searchQuery),
      props.selectedTags,
      props.tagAvatarRelation
    )
  ), [props.avatars, props.searchQuery, props.selectedTags, props.tagAvatarRelation]);

  const visibleAvatarIds = useMemo(() => filteredAvatars.map(avatar => avatar.id), [filteredAvatars]);

  useEffect(() => {
    setSelectedAvatarIds((prev) => {
      const next = prev.filter(id => visibleAvatarIds.includes(id));
      return next.length === prev.length ? prev : next;
    });
  }, [visibleAvatarIds]);

  useEffect(() => {
    if (selectedAvatarIds.length === 0 && isBulkDialogOpen) {
      setIsBulkDialogOpen(false);
    }
  }, [selectedAvatarIds, isBulkDialogOpen]);

  const handleAvatarSelectionChange = useCallback((avatarId: string, checked: boolean) => {
    setSelectedAvatarIds((prev) => {
      if (checked) {
        if (prev.includes(avatarId)) return prev;
        return [...prev, avatarId];
      }
      return prev.filter(id => id !== avatarId);
    });
  }, []);

  const handleSelectAllToggle = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedAvatarIds(visibleAvatarIds);
    } else {
      setSelectedAvatarIds([]);
    }
  }, [visibleAvatarIds]);

  const handleBulkTagRemove = useCallback(async (tagName: string) => {
    if (selectedAvatarIds.length === 0) return;
    setRemovingTagName(tagName);
    try {
      for (const avatarId of selectedAvatarIds) {
        await removeTagAvatarsRelationAsync({ tagName, avatarId, currentUserId: props.currentUser.id });
      }
      notifications.show({
        title: 'タグ削除',
        message: `タグ「${tagName}」を選択中のアバターから削除しました。`,
        color: 'green',
      });
    } catch (error) {
      // onError inside mutation handles notification
      console.error('Bulk tag removal failed:', error);
    } finally {
      setRemovingTagName(null);
    }
  }, [props.currentUser.id, removeTagAvatarsRelationAsync, selectedAvatarIds]);

  if (props.tagAvatarRelationLoading) return <LoaderFullWindow message="タグ情報を読み込み中..." withAppShell={true} />;
  if (props.tagAvatarRelation === undefined) return <div>タグ情報の読み込みに失敗しました。</div>;

  const tagAvatarRelation = props.tagAvatarRelation;

  const selectedCount = selectedAvatarIds.length;
  const allSelected = filteredAvatars.length > 0 && selectedCount === filteredAvatars.length;
  const indeterminate = selectedCount > 0 && selectedCount < filteredAvatars.length;

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
            onClick={() => setSelectedAvatarIds([])}
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
          onClick={() => setIsBulkDialogOpen(true)}
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
        onClose={() => setIsBulkDialogOpen(false)}
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