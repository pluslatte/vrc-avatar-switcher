import { command_check_auth } from '@/lib/commands';
import { loadCookies } from '@/lib/db';
import DashBoard from '@/components/DashBoard';
import LoginForm from '@/components/LoginForm';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LoaderFullWindow } from './components/LoaderFullWindow';

function App() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['auth_check'],
    queryFn: async () => {
      const { authCookie, twofaCookie } = await loadCookies();
      if (authCookie === '' || twofaCookie === '') {
        return false;
      }
      return await command_check_auth(authCookie, twofaCookie);
    }
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
      {query.isError && <div>Error Auth: {(query.error as Error).message}</div>}
      {query.data === true && <DashBoard onLogoutSuccess={onLogoutSuccess} />}
      {query.data === false && <LoginForm onLoginSuccess={onLoginSuccess} />}
    </main>
  );
}

export default App;
