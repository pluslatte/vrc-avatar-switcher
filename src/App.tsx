/*
 * Copyright 2025 pluslatte
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
