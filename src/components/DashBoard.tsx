import AvatarList from '@/components/avatar/AvatarList';
import { useAvatarSwitcher } from '@/hooks/useAvatarSwitcher';
import { AppShell } from '@mantine/core';
import HeaderContents from './HeaderContents';

interface DashBoardProps {
  onLogoutSuccess: () => void;
}
const DashBoard = (props: DashBoardProps) => {
  const { avatarListQuery, switchAvatarMutation } = useAvatarSwitcher();

  const handlerAvatarSwitch = (avatarId: string) => {
    switchAvatarMutation.mutate(avatarId);
  };

  if (avatarListQuery.isPending) return <div>Loading...</div>;
  if (avatarListQuery.isError) return <div>Error: {(avatarListQuery.error as Error).message}</div>;

  return (
    <AppShell
      padding="md"
      header={{ height: 60 }}
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
          handlerAvatarSwitch={handlerAvatarSwitch}
        />
      </AppShell.Main>
    </AppShell>
  );
};

export default DashBoard;