import AvatarList from '@/components/avatar/AvatarList';
import { useAvatarSwitcher } from '@/hooks/useAvatarSwitcher';
import { AppShell } from '@mantine/core';
import HeaderContents from '@/components/HeaderContents';
import { LoaderFullWindow } from '@/components/LoaderFullWindow';
import FooterContents from '@/components/footer/FooterContents';
import { useCardImageSizeSelector } from '@/hooks/useCardImageSizeSelector';
import { useCardNumberPerRowSelector } from '@/hooks/useCardNumberPerRowSelector';
import { isAvatarSortOrder } from '@/lib/models';
import { notifications } from '@mantine/notifications';
import { countTagRelationsOf, createTag, createTagRelation, dropTag, dropTagRelation, queryTagExists } from '@/lib/db';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

interface DashBoardProps {
  onLogoutSuccess: () => void;
}
const DashBoard = (props: DashBoardProps) => {
  const { avatarListQuery, switchAvatarMutation, avatarSortOrder, handleAvatarSortOrderChange } = useAvatarSwitcher();
  const { loading: cardImageSizeLoading, cardImageSize, handleCardImageSizeChange } = useCardImageSizeSelector();
  const { loading: cardNumberPerRowLoading, cardNumberPerRow, handleCardNumberPerRow } = useCardNumberPerRowSelector();
  const [selectedTags, setSelectedTags] = useState<Array<string>>([]);

  const queryClient = useQueryClient();

  const handlerAvatarSwitch = (avatarId: string) => {
    switchAvatarMutation.mutate(avatarId);
  };

  const handlerSortOptSwitch = (option: string | null) => {
    // check if option is AvatarSortOrder
    if (isAvatarSortOrder(option)) {
      handleAvatarSortOrderChange(option);
    }
  };

  const handlerRefetchAvatar = async () => {
    await avatarListQuery.refetch();
  };

  const handleRegisterAvatarTag = async (tagName: string, currentUserId: string, avatarId: string, color: string) => {
    const tagExists = await queryTagExists(tagName, currentUserId);
    try {
      if (!tagExists) {
        await createTag(tagName, currentUserId, color);
        notifications.show({
          title: 'タグ作成',
          message: `タグ「${tagName}」を新規作成しました`,
          color: 'green',
        });
        await queryClient.invalidateQueries({ queryKey: ['tags', currentUserId] });
      }
      await createTagRelation(tagName, avatarId, currentUserId);
    } catch (error) {
      console.error('Error registering avatar tag:', error);
      notifications.show({
        title: 'タグ登録エラー',
        message: `タグ「${tagName}」の登録中にエラーが発生しました: ${(error as Error).message}`,
        color: 'red',
      });
    }
  };

  const handleRemoveAvatarTag = async (tagName: string, avatarId: string, currentUserId: string) => {
    try {
      await dropTagRelation(tagName, avatarId, currentUserId);
      const remainingTagRelations = await countTagRelationsOf(tagName, currentUserId);
      if (remainingTagRelations === 0) {
        await dropTag(tagName, currentUserId);
        notifications.show({
          title: 'タグ削除',
          message: `タグ「${tagName}」は他に関連付けられたアバターがないため削除されました`,
          color: 'green',
        });
        await queryClient.invalidateQueries({ queryKey: ['tags', currentUserId] });
      }
    } catch (error) {
      console.error('Error removing avatar tag:', error);
      notifications.show({
        title: 'タグ削除エラー',
        message: `タグ「${tagName}」の削除中にエラーが発生しました: ${(error as Error).message}`,
        color: 'red',
      });
    }
  };

  if (
    avatarListQuery.isPending ||
    avatarListQuery.isFetching
  ) return <LoaderFullWindow message="アバターを読み込んでいます..." />;
  if (avatarListQuery.isError) return <div>Error: {(avatarListQuery.error as Error).message}</div>;
  if (avatarSortOrder === undefined) return <div>Error: avatarSortOrder is undefined</div>;

  return (
    <AppShell
      padding="md"
      header={{ height: 60 }}
      footer={{ height: 60 }}
    >
      <AppShell.Header>
        <HeaderContents
          currentUserDisplayName={avatarListQuery.data.currentUser.displayName}
          currentUserThumbnailImageUrl={avatarListQuery.data.currentUser.currentAvatarThumbnailImageUrl}
          currentUserAvatarName={avatarListQuery.data.avatars.find(avatar => avatar.id === avatarListQuery.data.currentUser.currentAvatar)?.name || 'No Avatar'}
          onLogoutSuccess={props.onLogoutSuccess}
        />
      </AppShell.Header>

      <AppShell.Main>
        {cardImageSize === undefined || cardNumberPerRow === undefined && <LoaderFullWindow message="設定を読み込んでいます..." />}
        {cardImageSize !== undefined && cardNumberPerRow !== undefined && <AvatarList
          avatars={avatarListQuery.data.avatars}
          currentUser={avatarListQuery.data.currentUser}
          pendingSwitch={switchAvatarMutation.isPending}
          cardImageSize={cardImageSize}
          cardNumberPerRow={cardNumberPerRow}
          selectedTags={selectedTags}
          handlerAvatarSwitch={handlerAvatarSwitch}
          handlerRegisterAvatarTag={handleRegisterAvatarTag}
          handlerRemoveAvatarTag={handleRemoveAvatarTag}
        />}
      </AppShell.Main>

      <AppShell.Footer>
        <FooterContents
          currentUser={avatarListQuery.data.currentUser}
          selectedSort={avatarSortOrder}
          cardImageSize={cardImageSize}
          cardImageSizeLoading={cardImageSizeLoading}
          cardNumberPerRow={cardNumberPerRow}
          cardNumberPerRowLoading={cardNumberPerRowLoading}
          setCardImageSize={handleCardImageSizeChange}
          setCardNumberPerRow={handleCardNumberPerRow}
          onSortSettingChange={handlerSortOptSwitch}
          onRefreshButtonClick={handlerRefetchAvatar}
          onTagFilterChange={setSelectedTags}
        />
      </AppShell.Footer>

    </AppShell>
  );
};

export default DashBoard;