import AvatarList from '@/components/AvatarList';
import LogoutButton from './LogoutButton';

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