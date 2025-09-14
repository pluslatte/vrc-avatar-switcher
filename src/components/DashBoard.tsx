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

interface DashBoardProps {
  onLogoutSuccess: () => void;
}
const DashBoard = (props: DashBoardProps) => {
  const { avatarListQuery, switchAvatarMutation, avatarSortOrder, handleAvatarSortOrderChange } = useAvatarSwitcher();
  const { loading: cardImageSizeLoading, cardImageSize, handleCardImageSizeChange } = useCardImageSizeSelector();
  const { loading: cardNumberPerRowLoading, cardNumberPerRow, handleCardNumberPerRow } = useCardNumberPerRowSelector();

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

  const handleRegisterAvatarTag = async (tagName: string, username: string, avatarId: string, color: string) => {
    const tagExists = await queryTagExists(tagName, username);
    if (!tagExists) {
      await createTag(tagName, username, color);
    }
    await createTagRelation(tagName, avatarId, username);
    notifications.show({
      title: '成功',
      message: `タグ「${tagName}」を紐づけました`,
      color: 'green',
    });
  };

  const handleRemoveAvatarTag = async (tagName: string, avatarId: string, username: string) => {
    await dropTagRelation(tagName, avatarId, username);
    notifications.show({
      title: '成功',
      message: `タグ「${tagName}」を取り外しました`,
      color: 'green',
    });
    const remainingTagRelations = await countTagRelationsOf(tagName, username);
    if (remainingTagRelations === 0) {
      await dropTag(tagName, username);
      notifications.show({
        title: 'タグ削除',
        message: `タグ「${tagName}」は他に関連付けられたアバターがないため削除されました`,
        color: 'yellow',
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
        />
      </AppShell.Footer>

    </AppShell>
  );
};

export default DashBoard;