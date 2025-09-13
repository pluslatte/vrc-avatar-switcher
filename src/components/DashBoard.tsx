import AvatarList from '@/components/avatar/AvatarList';
import LogoutButton from '@/components/LogoutButton';

interface DashBoardProps {
  onLogoutSuccess: () => void;
}
const DashBoard = (props: DashBoardProps) => {
  return (
    <div>
      <h1>Dashboard</h1>
      <LogoutButton onLogoutSuccess={props.onLogoutSuccess} />
      <AvatarList />
    </div>
  );
};

export default DashBoard;