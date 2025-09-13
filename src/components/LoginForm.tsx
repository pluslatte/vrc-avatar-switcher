import { Button, Input, InputLabel } from '@mantine/core';
import { useState } from 'react';
import { command_new_auth, command_submit_2fa, command_submit_email_2fa } from '@/lib/commands';
import { saveCookies } from '@/lib/stores';

interface LoginFormProps {
  onLoginSuccess: () => void;
}
const LoginForm = (props: LoginFormProps) => {
  const [step, setStep] = useState<'login' | '2fa' | 'email2fa' | 'done'>('login');
  const [loginFormData, setLoginFormData] = useState({
    username: '',
    password: '',
    code: '',
    authCookie: '',
    twofaCookie: ''
  });

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginFormData({ ...loginFormData, [field]: e.target.value });
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
    action: Promise<void>
  ) => {
    e.preventDefault();
    try {
      await action;
    } catch (error) {
      console.error('Submission failed:', error);
    }
  };

  const handleLoginSubmit = async () => {
    const result = await command_new_auth(loginFormData.username, loginFormData.password);
    if (result.status === 'Success') {
      setStep('done');
      await saveCookies(result.auth_cookie, result.two_fa_cookie);
      props.onLoginSuccess();
    } else if (result.status === 'Requires2FA') {
      setLoginFormData({ ...loginFormData, authCookie: result.auth_cookie, twofaCookie: result.two_fa_cookie || '' });
      setStep('2fa');
    } else if (result.status === 'RequiresEmail2FA') {
      setLoginFormData({ ...loginFormData, authCookie: result.auth_cookie, twofaCookie: result.two_fa_cookie || '' });
      setStep('email2fa');
    } else {
      console.error('Unknown login status:', result.status);
    }
  };

  const handle2FASubmit = async () => {
    const result = await command_submit_2fa(
      loginFormData.authCookie,
      loginFormData.twofaCookie,
      loginFormData.username,
      loginFormData.password,
      loginFormData.code
    );
    setStep('done');
    await saveCookies(result.auth_cookie, result.two_fa_cookie);
    props.onLoginSuccess();
  };
  const handleEmail2FASubmit = async () => {
    const result = await command_submit_email_2fa(
      loginFormData.authCookie,
      loginFormData.twofaCookie,
      loginFormData.username,
      loginFormData.password,
      loginFormData.code
    );
    setStep('done');
    await saveCookies(result.auth_cookie, result.two_fa_cookie);
    props.onLoginSuccess();
  };

  return (
    <div>
      {step === 'login' && (
        <form onSubmit={e => handleSubmit(e, handleLoginSubmit())}>
          <InputLabel htmlFor="username">Username</InputLabel>
          <Input
            id="username"
            name="username"
            value={loginFormData.username}
            onChange={handleChange('username')}
          />
          <InputLabel htmlFor="password">Password</InputLabel>
          <Input
            type="password"
            id="password"
            name="password"
            value={loginFormData.password}
            onChange={handleChange('password')}
          />
          <Button type="submit">Login</Button>
        </form>
      )}
      {step === '2fa' && (
        <form onSubmit={e => handleSubmit(e, handle2FASubmit())}>
          <InputLabel htmlFor="2fa-code">2FA Code</InputLabel>
          <Input
            id="2fa-code"
            name="2fa-code"
            value={loginFormData.code}
            onChange={handleChange('code')}
          />
          <Button type="submit">Submit 2FA</Button>
        </form>
      )}
      {step === 'email2fa' && (
        <form onSubmit={e => handleSubmit(e, handleEmail2FASubmit())}>
          <InputLabel htmlFor="email-2fa-code">Email 2FA Code</InputLabel>
          <Input
            id="email-2fa-code"
            name="email-2fa-code"
            value={loginFormData.code}
            onChange={handleChange('code')}
          />
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