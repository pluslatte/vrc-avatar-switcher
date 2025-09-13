import AvatarList from '@/components/avatar/AvatarList';
import { useAvatarSwitcher } from '@/hooks/useAvatarSwitcher';
import { AppShell } from '@mantine/core';
import HeaderContents from '@/components/HeaderContents';
import { LoaderFullWindow } from '@/components/LoaderFullWindow';
import FooterContents from '@/components/FooterContents';
import { useCardImageSizeSlider } from '@/hooks/useCardImageSizeSlider';

interface DashBoardProps {
  onLogoutSuccess: () => void;
}
const DashBoard = (props: DashBoardProps) => {
  const { avatarListQuery, switchAvatarMutation, selectedSort, setSelectedSort } = useAvatarSwitcher();
  const { cardImageSize, handleCardImageSizeChange } = useCardImageSizeSlider();

  const handlerAvatarSwitch = (avatarId: string) => {
    switchAvatarMutation.mutate(avatarId);
  };

  const handlerSortOptSwitch = (option: string | null) => {
    if (option === 'Name' || option === 'Updated') {
      setSelectedSort(option);
    }
  };

  const handlerRefetchAvatar = () => {
    avatarListQuery.refetch();
  };

  if (avatarListQuery.isPending || avatarListQuery.isFetching) return <LoaderFullWindow message="Loading avatars..." />;
  if (avatarListQuery.isError) return <div>Error: {(avatarListQuery.error as Error).message}</div>;

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
        <AvatarList
          avatars={avatarListQuery.data.avatars}
          currentUser={avatarListQuery.data.currentUser}
          pendingSwitch={switchAvatarMutation.isPending}
          cardImageSize={cardImageSize}
          handlerAvatarSwitch={handlerAvatarSwitch}
        />
      </AppShell.Main>

      <AppShell.Footer>
        <FooterContents
          selectedSort={selectedSort}
          cardImageSize={cardImageSize}
          setCardImageSize={handleCardImageSizeChange}
          onSelectorChange={handlerSortOptSwitch}
          onRefreshButtonClick={handlerRefetchAvatar}
        />
      </AppShell.Footer>

    </AppShell>
  );
};

export default DashBoard;