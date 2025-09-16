import { dropCookies } from '@/lib/db';
import { Button } from '@mantine/core';

interface LogoutButtonProps {
  onLogoutSuccess: () => void;
}
const LogoutButton = (props: LogoutButtonProps) => {
  const handleLogout = async () => {
    await dropCookies();
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