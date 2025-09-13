import '@mantine/core/styles.css';
import { command_check_auth } from '@/lib/commands';
import { loadCookies } from '@/lib/stores';
import AvatarList from '@/components/AvatarList';
import LoginForm from '@/components/LoginForm';
import { useQuery } from '@tanstack/react-query';


function App() {
  const query = useQuery({
    queryKey: ['auth_check'], queryFn: async () => {
      const { authCookie, twofaCookie } = await loadCookies();
      if (authCookie === '' || twofaCookie === '') {
        return false;
      }

      return await command_check_auth(authCookie, twofaCookie);
    }
  });

  return (
    <main>
      {query.isPending && <div>Loading...</div>}
      {query.isError && <div>Error: {(query.error as Error).message}</div>}
      {query.data === true && <AvatarList />}
      {query.data === false && <LoginForm />}
    </main>
  );
}

export default App;
