/*
 * Copyright (C) 2025 pluslatte
 * This file is part of vrc-avatar-switcher.
 *
 * vrc-avatar-switcher is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * 
 * vrc-avatar-switcher is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with vrc-avatar-switcher. If not, see <https://www.gnu.org/licenses/>. 
*/

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