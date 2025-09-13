import AvatarList from '@/components/avatar/AvatarList';
import LogoutButton from '@/components/LogoutButton';
import { useAvatarSwitcher } from '@/hooks/useAvatarSwitcher';

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
    <div>
      <h1>Dashboard</h1>
      <LogoutButton onLogoutSuccess={props.onLogoutSuccess} />
      <AvatarList
        avatars={avatarListQuery.data.avatars}
        currentUser={avatarListQuery.data.currentUser}
        handlerAvatarSwitch={handlerAvatarSwitch}
      />
    </div>
  );
};

export default DashBoard;