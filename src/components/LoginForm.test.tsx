import { notifications } from '@mantine/notifications';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '@/components/LoginForm';
import { command_2fa, command_email_2fa, command_new_auth } from '@/lib/commands';
import { renderWithProviders } from '@/test/testUtils';

vi.mock('@/lib/commands');

beforeEach(() => {
  vi.clearAllMocks();
});

const fillAndSubmitLogin = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText('Username'), 'alice');
  await user.type(screen.getByLabelText('Password'), 'hunter2');
  await user.click(screen.getByRole('button', { name: 'Login' }));
};

describe('LoginForm', () => {
  it('ユーザー名とパスワードでログインに成功するとログイン完了する (A3)', async () => {
    vi.mocked(command_new_auth).mockResolvedValue('Success');
    const onLoginSuccess = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<LoginForm onLoginSuccess={onLoginSuccess} />);

    await fillAndSubmitLogin(user);

    await waitFor(() => expect(onLoginSuccess).toHaveBeenCalledTimes(1));
    expect(command_new_auth).toHaveBeenCalledWith('alice', 'hunter2');
  });

  it('2FA が要求されるとコード入力に切り替わり、正しいコードでログイン完了する (A4)', async () => {
    vi.mocked(command_new_auth).mockResolvedValue('Requires2FA');
    vi.mocked(command_2fa).mockResolvedValue(undefined);
    const onLoginSuccess = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<LoginForm onLoginSuccess={onLoginSuccess} />);

    await fillAndSubmitLogin(user);

    expect(await screen.findByText('2FAコードを入力してください')).toBeInTheDocument();
    expect(onLoginSuccess).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText('2FA Code'), '123456');
    await user.click(screen.getByRole('button', { name: 'Submit 2FA' }));

    await waitFor(() => expect(onLoginSuccess).toHaveBeenCalledTimes(1));
    expect(command_2fa).toHaveBeenCalledWith('alice', 'hunter2', '123456');
  });

  it('メール 2FA が要求されると専用のコード入力に切り替わる (A5)', async () => {
    vi.mocked(command_new_auth).mockResolvedValue('RequiresEmail2FA');
    vi.mocked(command_email_2fa).mockResolvedValue(undefined);
    const onLoginSuccess = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<LoginForm onLoginSuccess={onLoginSuccess} />);

    await fillAndSubmitLogin(user);

    expect(await screen.findByText('メールで送信された2FAコードを入力してください')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Email 2FA Code'), '654321');
    await user.click(screen.getByRole('button', { name: 'Submit Email 2FA' }));

    await waitFor(() => expect(onLoginSuccess).toHaveBeenCalledTimes(1));
    expect(command_email_2fa).toHaveBeenCalledWith('alice', 'hunter2', '654321');
  });

  it('ログイン失敗時はエラー通知が表示されログイン画面に留まる (A6)', async () => {
    const showSpy = vi.spyOn(notifications, 'show');
    // Tauri コマンドは string で reject する
    vi.mocked(command_new_auth).mockRejectedValue('Invalid Username/Email or Password');
    const onLoginSuccess = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<LoginForm onLoginSuccess={onLoginSuccess} />);

    await fillAndSubmitLogin(user);

    await waitFor(() => expect(showSpy).toHaveBeenCalledWith(expect.objectContaining({
      title: 'ログインに失敗しました',
      message: 'Invalid Username/Email or Password',
      color: 'red',
    })));
    expect(screen.getByText('ログインしてください')).toBeInTheDocument();
    expect(onLoginSuccess).not.toHaveBeenCalled();
  });

  it('2FA コードが誤っているとエラー通知が表示され再入力できる (A7)', async () => {
    const showSpy = vi.spyOn(notifications, 'show');
    vi.mocked(command_new_auth).mockResolvedValue('Requires2FA');
    vi.mocked(command_2fa).mockRejectedValue('Invalid two-factor code');
    const onLoginSuccess = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<LoginForm onLoginSuccess={onLoginSuccess} />);

    await fillAndSubmitLogin(user);
    await user.type(await screen.findByLabelText('2FA Code'), '000000');
    await user.click(screen.getByRole('button', { name: 'Submit 2FA' }));

    await waitFor(() => expect(showSpy).toHaveBeenCalledWith(expect.objectContaining({
      title: '二段階認証に失敗しました。コードが間違っている可能性があります',
      message: 'Invalid two-factor code',
      color: 'red',
    })));
    // 2FA ステップに留まり再入力できる
    expect(screen.getByText('2FAコードを入力してください')).toBeInTheDocument();
    expect(onLoginSuccess).not.toHaveBeenCalled();
  });
});
