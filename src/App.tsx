/*
 * Copyright (C) 2025 pluslatte
 * This file is part of vrc-avatar-switcher.
 *
 * vrc-avatar-switcher is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * 
 * vrc-avatar-switcher is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with vrc-avatar-switcher. If not, see <https://www.gnu.org/licenses/>. 
*/

import { command_check_auth } from '@/lib/commands';
import { loadCookies } from '@/lib/db';
import MainAppShell from '@/components/MainAppShell';
import LoginForm from '@/components/LoginForm';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LoaderFullWindow } from './components/LoaderFullWindow';
import { notifications } from '@mantine/notifications';

function App() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['auth_check'],
    queryFn: async () => {
      try {
        const { authCookie, twofaCookie } = await loadCookies();
        if (authCookie === '' || twofaCookie === '') {
          return false;
        }
        return await command_check_auth(authCookie, twofaCookie);
      } catch (error) {
        console.error('Error during auth check:', error);
        notifications.show({
          title: '認証に失敗しました',
          message: (error as Error).message,
          color: 'red',
        });
        return false;
      }
    },
  });

  const onLoginSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['auth_check'] });
  };
  const onLogoutSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['auth_check'] });
  };

  return (
    <main>
      {query.isPending && <LoaderFullWindow message="認証情報を確認しています..." />}
      {query.data === true && <MainAppShell onLogoutSuccess={onLogoutSuccess} />}
      {query.data === false && <LoginForm onLoginSuccess={onLoginSuccess} />}
    </main>
  );
}

export default App;
