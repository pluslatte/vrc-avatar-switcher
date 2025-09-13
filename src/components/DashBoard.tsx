import AvatarList from '@/components/avatar/AvatarList';
import LogoutButton from '@/components/LogoutButton';
import { useAvatarList } from '@/hooks/useAvatarList';

interface DashBoardProps {
  onLogoutSuccess: () => void;
}
const DashBoard = (props: DashBoardProps) => {
  const { avatarListQuery, handlerAvatarSwitch } = useAvatarList();

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