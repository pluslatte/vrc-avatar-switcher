import AvatarList from '@/components/avatar/AvatarList';
import { useAvatarSwitcher } from '@/hooks/useAvatarSwitcher';
import { AppShell, LoadingOverlay, ScrollArea } from '@mantine/core';
import HeaderContents from '@/components/HeaderContents';
import { LoaderFullWindow } from '@/components/LoaderFullWindow';
import FooterContents from '@/components/footer/FooterContents';
import { useCardImageSizeSelector } from '@/hooks/useCardImageSizeSelector';
import { useCardNumberPerRowSelector } from '@/hooks/useCardNumberPerRowSelector';
import { isAvatarSortOrder } from '@/lib/models';
import { useState } from 'react';
import { useAvatarSearchByName } from '@/hooks/useAvatarSearchByName';

interface DashBoardProps {
  onLogoutSuccess: () => void;
}
const DashBoard = (props: DashBoardProps) => {
  const {
    avatarListQuery,
    switchAvatarMutation,
    avatarSortOrder,
    tagsLoading,
    availableTags,
    tagAvatarRelationLoading,
    tagAvatarRelation,
    handleAvatarSortOrderChange,
    handlerAvatarSwitch,
  } = useAvatarSwitcher();
  const { loading: cardImageSizeLoading, cardImageSize, handleCardImageSizeChange } = useCardImageSizeSelector();
  const { loading: cardNumberPerRowLoading, cardNumberPerRow, handleCardNumberPerRow } = useCardNumberPerRowSelector();
  const avatarSearchQuery = useAvatarSearchByName();
  const [selectedTags, setSelectedTags] = useState<Array<string>>([]);

  const handlerSortOptSwitch = (option: string | null) => {
    // check if option is AvatarSortOrder
    if (isAvatarSortOrder(option)) {
      handleAvatarSortOrderChange(option);
    }
  };

  if (avatarListQuery.isPending || avatarListQuery.isFetching) return <LoaderFullWindow message="アバターを読み込んでいます..." />;
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
          avatarSortOrder={avatarSortOrder}
          currentUserDisplayName={avatarListQuery.data.currentUser.displayName}
          currentUserThumbnailImageUrl={avatarListQuery.data.currentUser.currentAvatarThumbnailImageUrl}
          currentUserAvatarName={avatarListQuery.data.avatars.find(avatar => avatar.id === avatarListQuery.data.currentUser.currentAvatar)?.name || 'No Avatar'}
        />
      </AppShell.Header>

      <AppShell.Main>
        {cardImageSize === undefined || cardNumberPerRow === undefined &&
          <LoaderFullWindow message="設定を読み込んでいます..." />}
        {cardImageSize !== undefined && cardNumberPerRow !== undefined &&
          <AvatarList
            avatars={avatarListQuery.data.avatars}
            tagAvatarRelation={tagAvatarRelation}
            tagAvatarRelationLoading={tagAvatarRelationLoading}
            currentUser={avatarListQuery.data.currentUser}
            pendingSwitch={switchAvatarMutation.isPending}
            searchQuery={avatarSearchQuery.value}
            cardImageSize={cardImageSize}
            cardNumberPerRow={cardNumberPerRow}
            selectedTags={selectedTags}
            handlerAvatarSwitch={handlerAvatarSwitch}
          />}
      </AppShell.Main>

      <AppShell.Footer>
        <ScrollArea h="100%">
          {<LoadingOverlay visible={tagsLoading} overlayProps={{ radius: 'md', blur: 2 }} />}
          {availableTags !== undefined && (
            <FooterContents
              avatars={avatarListQuery.data.avatars}
              currentUser={avatarListQuery.data.currentUser}
              selectedSort={avatarSortOrder}
              avatarSearchQuery={avatarSearchQuery}
              cardImageSize={cardImageSize}
              cardImageSizeLoading={cardImageSizeLoading}
              cardNumberPerRow={cardNumberPerRow}
              cardNumberPerRowLoading={cardNumberPerRowLoading}
              availableTags={availableTags}
              setCardImageSize={handleCardImageSizeChange}
              setCardNumberPerRow={handleCardNumberPerRow}
              onSortSettingChange={handlerSortOptSwitch}
              onTagFilterChange={setSelectedTags}
              onLogoutSuccess={props.onLogoutSuccess}
            />
          )}
        </ScrollArea>
      </AppShell.Footer>

    </AppShell>
  );
};

export default DashBoard;