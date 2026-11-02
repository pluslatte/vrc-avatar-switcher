import { Button, Divider, PasswordInput, Stack, Text, TextInput } from '@mantine/core';
import { useLogin } from '@/hooks/useLogin';

interface LoginFormProps {
  onLoginSuccess: () => void;
  fullHeight: boolean;
}
const LoginForm = (props: LoginFormProps) => {
  const { step, loginFormData, handleChange, submit } = useLogin(props.onLoginSuccess);

  return (
    <Stack align="center" justify="center" style={{ height: props.fullHeight ? '100vh' : undefined }}>
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
        <form onSubmit={submit}>
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
        <form onSubmit={submit}>
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
        <form onSubmit={submit}>
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
