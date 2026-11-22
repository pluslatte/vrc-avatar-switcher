import { useState } from 'react';
import { command_new_auth, command_2fa, command_email_2fa } from '@/lib/commands';
import { getErrorMessage, notifyError } from '@/lib/notify';

type LoginStep = 'login' | '2fa' | 'email2fa' | 'done';

export const useLogin = (onLoginSuccess: () => void) => {
  const [step, setStep] = useState<LoginStep>('login');
  const [loginFormData, setLoginFormData] = useState({
    username: '',
    password: '',
    code: '',
  });

  const handleChange = (field: keyof typeof loginFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginFormData({ ...loginFormData, [field]: e.target.value });
  };

  const completeLogin = () => {
    setStep('done');
    onLoginSuccess();
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
      }
    } catch (error) {
      console.error('Login failed:', error);
      notifyError('ログインに失敗しました', getErrorMessage(error, '不明なエラー'));
    }
  };

  const verifyTwoFactorCode = async (verify: typeof command_2fa) => {
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

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    switch (step) {
      case 'login':
        return handleLoginSubmit();
      case '2fa':
        return verifyTwoFactorCode(command_2fa);
      case 'email2fa':
        return verifyTwoFactorCode(command_email_2fa);
      case 'done':
        return;
    }
  };

  return { step, loginFormData, handleChange, submit };
};
