import { checkAuth } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import MainAppShell from '@/components/MainAppShell';
import LoginForm from '@/components/LoginForm';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LoaderFullWindow } from './components/LoaderFullWindow';

function App() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: queryKeys.authCheck,
    queryFn: async () => {
      try {
        return await checkAuth();
      } catch (error) {
        console.error('Error during auth check:', error);
        return false;
      }
    },
  });

  const invalidateAuthCheck = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.authCheck });
  };

  return (
    <main>
      {query.isPending && <LoaderFullWindow message="認証情報を確認しています..." />}
      {query.isError && <div>Error Auth: {(query.error as Error).message}</div>}
      {query.data === true && <MainAppShell onLogoutSuccess={invalidateAuthCheck} />}
      {query.data === false && <LoginForm onLoginSuccess={invalidateAuthCheck} />}
    </main>
  );
}

export default App;
