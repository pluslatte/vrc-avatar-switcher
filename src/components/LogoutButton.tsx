import { dropCookies } from '@/lib/stores';
import { Button } from '@mantine/core';

interface LogoutButtonProps {
  onLogoutSuccess: () => void;
}
const LogoutButton = (props: LogoutButtonProps) => {
  const handleLogout = async () => {
    await dropCookies();
    props.onLogoutSuccess();
  };

  return <Button onClick={handleLogout} color="red">Logout</Button>;
};

export default LogoutButton;