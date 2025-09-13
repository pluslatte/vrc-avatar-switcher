import AvatarList from '@/components/avatar/AvatarList';
import { useAvatarSwitcher } from '@/hooks/useAvatarSwitcher';
import { AppShell } from '@mantine/core';
import HeaderContents from '@/components/HeaderContents';
import { LoaderFullWindow } from '@/components/LoaderFullWindow';
import FooterContents from '@/components/footer/FooterContents';
import { useCardImageSizeSelector } from '@/hooks/useCardImageSizeSelector';
import { useCardNumberPerRowSelector } from '@/hooks/useCardNumberPerRowSelector';
import { isAvatarSortOrder } from '@/lib/models';
import { useQuery } from '@tanstack/react-query';
import { loadAvatarTagColors, loadAvatarTags, saveAvatarTagColors, saveAvatarTags } from '@/lib/stores';

interface DashBoardProps {
  onLogoutSuccess: () => void;
}
const DashBoard = (props: DashBoardProps) => {
  const { avatarListQuery, switchAvatarMutation, avatarSortOrder, handleAvatarSortOrderChange } = useAvatarSwitcher();
  const { loading: cardImageSizeLoading, cardImageSize, handleCardImageSizeChange } = useCardImageSizeSelector();
  const { loading: cardNumberPerRowLoading, cardNumberPerRow, handleCardNumberPerRow } = useCardNumberPerRowSelector();
  const tagStoreQuery = useQuery({
    queryKey: ['tagStore'],
    queryFn: loadAvatarTags,
    staleTime: Infinity,
  });
  const tagColorsStoreQuery = useQuery({
    queryKey: ['tagColorsStore'],
    queryFn: loadAvatarTagColors,
    staleTime: Infinity,
  });

  const handlerAvatarSwitch = (avatarId: string) => {
    switchAvatarMutation.mutate(avatarId);
  };

  const handlerSortOptSwitch = (option: string | null) => {
    // check if option is AvatarSortOrder
    if (isAvatarSortOrder(option)) {
      handleAvatarSortOrderChange(option);
    }
  };

  const handlerRefetchAvatar = () => {
    avatarListQuery.refetch();
  };

  const handleRegisterAvatarTag = async (tags: Record<string, string[]>, tagName: string, avatarId: string) => {
    const newTags = { ...tags };
    if (newTags[tagName]) {
      if (!newTags[tagName].includes(avatarId)) {
        newTags[tagName].push(avatarId);
      }
    } else {
      newTags[tagName] = [avatarId];
    }
    await saveAvatarTags(newTags);
    tagStoreQuery.refetch();
  };

  const handleRemoveAvatarTag = async (tags: Record<string, string[]>, tagName: string, avatarId: string) => {
    const newTags = { ...tags };
    if (newTags[tagName]) {
      newTags[tagName] = newTags[tagName].filter(id => id !== avatarId);
      if (newTags[tagName].length === 0) {
        delete newTags[tagName];
      }
      await saveAvatarTags(newTags);
      tagStoreQuery.refetch();
    }
  };

  const handleRegisterAvatarTagColor = async (tags: Record<string, string>, tagName: string, color: string) => {
    const newTags = { ...tags };
    newTags[tagName] = color;
    await saveAvatarTagColors(newTags);
    tagColorsStoreQuery.refetch();
  };

  if (
    avatarListQuery.isPending ||
    avatarListQuery.isFetching ||
    tagStoreQuery.isPending ||
    tagColorsStoreQuery.isPending
  ) return <LoaderFullWindow message="Loading avatars..." />;
  if (avatarListQuery.isError) return <div>Error: {(avatarListQuery.error as Error).message}</div>;
  if (tagStoreQuery.isError) return <div>Error: {(tagStoreQuery.error as Error).message}</div>;
  if (tagColorsStoreQuery.isError) return <div>Error: {(tagColorsStoreQuery.error as Error).message}</div>;
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
        {cardImageSize === undefined || cardNumberPerRow === undefined && <LoaderFullWindow message="Loading settings..." />}
        {cardImageSize !== undefined && cardNumberPerRow !== undefined && <AvatarList
          avatars={avatarListQuery.data.avatars}
          tags={tagStoreQuery.data}
          tagColors={tagColorsStoreQuery.data}
          currentUser={avatarListQuery.data.currentUser}
          pendingSwitch={switchAvatarMutation.isPending}
          cardImageSize={cardImageSize}
          cardNumberPerRow={cardNumberPerRow}
          handlerAvatarSwitch={handlerAvatarSwitch}
          handlerRegisterAvatarTag={handleRegisterAvatarTag}
          handlerRemoveAvatarTag={handleRemoveAvatarTag}
          handlerRegisterAvatarTagColor={handleRegisterAvatarTagColor}
        />}
      </AppShell.Main>

      <AppShell.Footer>
        <FooterContents
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