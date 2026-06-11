import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '@/App';
import { command_check_auth, command_new_auth } from '@/lib/commands';
import { renderWithProviders } from '@/test/testUtils';
import { MainAppShellProps } from '@/components/MainAppShell';

vi.mock('@/lib/commands');

// MainAppShell はアバター一覧や DB アクセスを抱えた重いコンポーネントなので、
// App の画面分岐の検証ではスタブに差し替える
vi.mock('@/components/MainAppShell', () => ({
  default: (props: MainAppShellProps) => (
    <div data-testid="main-app-shell">
      <div data-testid="auth-status">{props.authStatus}</div>
      <button type="button" onClick={props.onLoginClick}>再ログイン</button>
    </div>
  ),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('App', () => {
  it('認証確認中でも初めからメイン画面が表示される', () => {
    vi.mocked(command_check_auth).mockImplementation(() => new Promise(() => {}));
    renderWithProviders(<App />);

    expect(screen.getByTestId('main-app-shell')).toBeInTheDocument();
    expect(screen.getByTestId('auth-status')).toHaveTextContent('checking');
    expect(screen.queryByText('ログインしてください')).not.toBeInTheDocument();
  });

  it('有効なセッションがあればログイン画面を経ずにメイン画面が表示される (A1)', async () => {
    vi.mocked(command_check_auth).mockResolvedValue(true);
    renderWithProviders(<App />);

    expect(await screen.findByTestId('main-app-shell')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated'));
    expect(screen.queryByText('ログインしてください')).not.toBeInTheDocument();
  });

  it('セッションがなくてもメイン画面を表示し、再ログインボタンからログインフォームを開く (A2)', async () => {
    vi.mocked(command_check_auth).mockResolvedValue(false);
    const user = userEvent.setup();
    renderWithProviders(<App />);

    await waitFor(() => expect(screen.getByTestId('auth-status')).toHaveTextContent('unauthenticated'));
    expect(screen.getByTestId('main-app-shell')).toBeInTheDocument();
    expect(screen.queryByText('ログインしてください')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '再ログイン' }));

    expect(await screen.findByText('ログインしてください')).toBeInTheDocument();
  });

  it('認証チェック自体が失敗した場合もメイン画面を表示して未認証として扱う (A2)', async () => {
    vi.mocked(command_check_auth).mockRejectedValue('network error');
    renderWithProviders(<App />);

    await waitFor(() => expect(screen.getByTestId('auth-status')).toHaveTextContent('unauthenticated'));
    expect(screen.getByTestId('main-app-shell')).toBeInTheDocument();
  });

  it('ログイン成功後に認証状態が再確認されメイン画面へ遷移する (A3)', async () => {
    vi.mocked(command_check_auth)
      .mockResolvedValueOnce(false)
      .mockResolvedValue(true);
    vi.mocked(command_new_auth).mockResolvedValue('Success');
    const user = userEvent.setup();
    renderWithProviders(<App />);

    await user.click(await screen.findByRole('button', { name: '再ログイン' }));
    await user.type(await screen.findByLabelText('Username'), 'alice');
    await user.type(screen.getByLabelText('Password'), 'hunter2');
    await user.click(screen.getByRole('button', { name: 'Login' }));

    expect(await screen.findByTestId('main-app-shell')).toBeInTheDocument();
    await waitFor(() => expect(command_check_auth).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated'));
  });
});
