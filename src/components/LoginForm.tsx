import { Button, Input } from '@mantine/core';
import { useState } from 'react';
import { command_new_auth, command_submit_2fa, command_submit_email_2fa } from '@/lib/commands';
import { saveCookies } from '@/lib/stores';

interface LoginFormProps {
  onLoginSuccess: () => void;
}
const LoginForm = (props: LoginFormProps) => {
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
        await saveCookies(result.auth_cookie, result.two_fa_cookie);
        props.onLoginSuccess();
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
      await saveCookies(result.auth_cookie, result.two_fa_cookie);
      props.onLoginSuccess();
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
      await saveCookies(result.auth_cookie, result.two_fa_cookie);
      props.onLoginSuccess();
    } catch (error) {
      console.error('Email 2FA submission failed:', error);
    }
  };

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
        </div>
      )}
    </div>
  );
};

export default LoginForm;