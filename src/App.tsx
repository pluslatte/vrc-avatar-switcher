import '@mantine/core/styles.css';
import { command_check_auth } from '@/lib/commands';
import { loadCookies } from '@/lib/stores';
import DashBoard from '@/components/DashBoard';
import LoginForm from '@/components/LoginForm';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<'unknown' | 'yes' | 'no'>('unknown');
  const query = useQuery({
    queryKey: ['auth_check'], queryFn: async () => {
      const { authCookie, twofaCookie } = await loadCookies();
      if (authCookie === '' || twofaCookie === '') {
        setIsLoggedIn('no');
        return false;
      }

      const check = await command_check_auth(authCookie, twofaCookie);
      setIsLoggedIn(check ? 'yes' : 'no');
      return check;
    }
  });
  const onLoginSuccess = () => {
    setIsLoggedIn('yes');
  };
  const onLogoutSuccess = () => {
    setIsLoggedIn('no');
  };

  return (
    <main>
      {query.isPending && <div>Checking authentication...</div>}
      {query.isError && <div>Error: {(query.error as Error).message}</div>}
      {isLoggedIn === 'yes' && <DashBoard onLogoutSuccess={onLogoutSuccess} />}
      {isLoggedIn === 'no' && <LoginForm onLoginSuccess={onLoginSuccess} />}
    </main>
  );
}

export default App;
