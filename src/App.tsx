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
