import { command_logout } from '@/lib/commands';
import { Button } from '@mantine/core';

interface LogoutButtonProps {
  onLogoutSuccess: () => void;
}
const LogoutButton = (props: LogoutButtonProps) => {
  const handleLogout = async () => {
    await command_logout();
    props.onLogoutSuccess();
  };

  return (
    <Button
      onClick={handleLogout}
      variant="outline"
      color="red"
      style={{ marginLeft: 'auto' }}
    >
      Logout
    </Button>
  );
};

export default LogoutButton;
