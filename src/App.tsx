import { Button, Input, MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { command_new_auth, command_submit_2fa, command_submit_email_2fa } from '@/lib/commands';
import { loadCookies, saveCookies } from '@/lib/stores';
import AvatarList from '@/components/AvatarList';

const queryClient = new QueryClient();

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'login' | '2fa' | 'email2fa' | 'done'>('login');
  const [authCookie, setAuthCookie] = useState('');
  const [twofaCookie, setTwofaCookie] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const result = await command_new_auth(username, password);
      if (result.status === 'Success') {
        setStep('done');
        saveCookies(result.auth_cookie, result.two_fa_cookie);
      } else if (result.status === 'Requires2FA') {
        setAuthCookie(result.auth_cookie);
        setTwofaCookie(result.two_fa_cookie || '');
        setStep('2fa');
      } else if (result.status === 'RequiresEmail2FA') {
        setAuthCookie(result.auth_cookie);
        setTwofaCookie(result.two_fa_cookie || '');
        setStep('email2fa');
      } else {
        console.error('Unknown login status:', result.status);
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handle2FASubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const result = await command_submit_2fa(
        authCookie, twofaCookie, username, password, code
      );
      setStep('done');
      saveCookies(result.auth_cookie, result.two_fa_cookie);
    } catch (error) {
      console.error('2FA submission failed:', error);
    }
  };
  const handleEmail2FASubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const result = await command_submit_email_2fa(
        authCookie, twofaCookie, username, password, code
      );
      setStep('done');
      saveCookies(result.auth_cookie, result.two_fa_cookie);
    } catch (error) {
      console.error('Email 2FA submission failed:', error);
    }
  };

  const checkStoredAuth = async () => {
    const { authCookie, twofaCookie } = await loadCookies();
    if (authCookie && twofaCookie) {
      setStep('done');
    }
  };

  useEffect(() => {
    checkStoredAuth();
  }, []);

  return (
    <div>
      {step === 'login' && (
        <form onSubmit={handleLoginSubmit}>
          <Input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button type="submit">Login</Button>
        </form>
      )}
      {step === '2fa' && (
        <form onSubmit={handle2FASubmit}>
          <Input placeholder="2FA Code" value={code} onChange={(e) => setCode(e.target.value)} />
          <Button type="submit">Submit 2FA</Button>
        </form>
      )}
      {step === 'email2fa' && (
        <form onSubmit={handleEmail2FASubmit}>
          <Input placeholder="Email 2FA Code" value={code} onChange={(e) => setCode(e.target.value)} />
          <Button type="submit">Submit Email 2FA</Button>
        </form>
      )}
      {step === 'done' && (
        <div>
          <div>Login successful!</div>
          <AvatarList />
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <main>
      <QueryClientProvider client={queryClient}>
        <MantineProvider>
          <h1>Hello World!</h1>
          <LoginForm />
        </MantineProvider>
      </QueryClientProvider>
    </main>
  );
}

export default App;
