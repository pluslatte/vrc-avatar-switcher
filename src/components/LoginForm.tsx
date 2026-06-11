import { Button, Divider, PasswordInput, Stack, Text, TextInput } from '@mantine/core';
import { useState } from 'react';
import { command_new_auth, command_2fa, command_email_2fa } from '@/lib/commands';
import { getErrorMessage, notifyError } from '@/lib/notify';

type LoginStep = 'login' | '2fa' | 'email2fa' | 'done';

interface LoginFormProps {
  onLoginSuccess: () => void;
  fullHeight?: boolean;
}
const LoginForm = (props: LoginFormProps) => {
  const [step, setStep] = useState<LoginStep>('login');
  const [loginFormData, setLoginFormData] = useState({
    username: '',
    password: '',
    code: '',
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

  const completeLogin = () => {
    setStep('done');
    props.onLoginSuccess();
  };

  const handleLoginSubmit = async () => {
    try {
      const status = await command_new_auth(loginFormData.username, loginFormData.password);
      if (status === 'Success') {
        completeLogin();
      } else if (status === 'Requires2FA') {
        setStep('2fa');
      } else if (status === 'RequiresEmail2FA') {
        setStep('email2fa');
      } else {
        console.error('Unknown login status:', status);
      }
    } catch (error) {
      console.error('Login failed:', error);
      notifyError('ログインに失敗しました', getErrorMessage(error, '不明なエラー'));
    }
  };

  const handle2FASubmit = (verify: typeof command_2fa) => async () => {
    try {
      await verify(
        loginFormData.username,
        loginFormData.password,
        loginFormData.code
      );
      completeLogin();
    } catch (error) {
      console.error('2FA login failed:', error);
      notifyError(
        '二段階認証に失敗しました。コードが間違っている可能性があります',
        getErrorMessage(error, '不明なエラー')
      );
    }
  };

  return (
    <Stack align="center" justify="center" style={{ height: props.fullHeight === false ? undefined : '100vh' }}>
      {step === '2fa' && (
        <Text size="xl" fw={700}>2FAコードを入力してください</Text>
      )}
      {step === 'email2fa' && (
        <Text size="xl" fw={700}>メールで送信された2FAコードを入力してください</Text>
      )}
      {step === 'login' && (
        <Text size="xl" fw={700}>ログインしてください</Text>
      )}

      {step === 'login' && (
        <form onSubmit={e => handleSubmit(e, handleLoginSubmit())}>
          <TextInput
            type="text"
            id="username"
            name="username"
            label="Username"
            value={loginFormData.username}
            onChange={handleChange('username')}
          />
          <PasswordInput
            id="password"
            name="password"
            label="Password"
            value={loginFormData.password}
            onChange={handleChange('password')}
          />
          <Divider my="sm" />
          <Button type="submit" fullWidth>Login</Button>
        </form>
      )}
      {step === '2fa' && (
        <form onSubmit={e => handleSubmit(e, handle2FASubmit(command_2fa)())}>
          <TextInput
            id="2fa-code"
            name="2fa-code"
            value={loginFormData.code}
            label="2FA Code"
            onChange={handleChange('code')}
          />
          <Divider my="sm" />
          <Button type="submit" fullWidth>Submit 2FA</Button>
        </form>
      )}
      {step === 'email2fa' && (
        <form onSubmit={e => handleSubmit(e, handle2FASubmit(command_email_2fa)())}>
          <TextInput
            id="email-2fa-code"
            name="email-2fa-code"
            value={loginFormData.code}
            label="Email 2FA Code"
            onChange={handleChange('code')}
          />
          <Divider my="sm" />
          <Button type="submit" fullWidth>Submit Email 2FA</Button>
        </form>
      )}
      {step === 'done' && (
        <div>
          <div>Login successful!</div>
        </div>
      )}
    </Stack>
  );
};

export default LoginForm;
