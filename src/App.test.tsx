import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '@/App';
import { command_check_auth, command_new_auth } from '@/lib/commands';
import { renderWithProviders } from '@/test/testUtils';

vi.mock('@/lib/commands');

// MainAppShell はアバター一覧や DB アクセスを抱えた重いコンポーネントなので、
// App の画面分岐の検証ではスタブに差し替える
vi.mock('@/components/MainAppShell', () => ({
  default: () => <div data-testid="main-app-shell" />,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('App', () => {
  it('有効なセッションがあればログイン画面を経ずにメイン画面が表示される (A1)', async () => {
    vi.mocked(command_check_auth).mockResolvedValue(true);
    renderWithProviders(<App />);

    // 確認中はローダーが表示される
    expect(screen.getByText(/認証情報を確認しています/)).toBeInTheDocument();

    expect(await screen.findByTestId('main-app-shell')).toBeInTheDocument();
    expect(screen.queryByText('ログインしてください')).not.toBeInTheDocument();
  });

  it('セッションがなければログインフォームが表示される (A2)', async () => {
    vi.mocked(command_check_auth).mockResolvedValue(false);
    renderWithProviders(<App />);

    expect(await screen.findByText('ログインしてください')).toBeInTheDocument();
    expect(screen.queryByTestId('main-app-shell')).not.toBeInTheDocument();
  });

  it('認証チェック自体が失敗した場合もログインフォームにフォールバックする (A2)', async () => {
    vi.mocked(command_check_auth).mockRejectedValue('network error');
    renderWithProviders(<App />);

    expect(await screen.findByText('ログインしてください')).toBeInTheDocument();
  });

  it('ログイン成功後に認証状態が再確認されメイン画面へ遷移する (A3)', async () => {
    vi.mocked(command_check_auth)
      .mockResolvedValueOnce(false)
      .mockResolvedValue(true);
    vi.mocked(command_new_auth).mockResolvedValue('Success');
    const user = userEvent.setup();
    renderWithProviders(<App />);

    await user.type(await screen.findByLabelText('Username'), 'alice');
    await user.type(screen.getByLabelText('Password'), 'hunter2');
    await user.click(screen.getByRole('button', { name: 'Login' }));

    expect(await screen.findByTestId('main-app-shell')).toBeInTheDocument();
    await waitFor(() => expect(command_check_auth).toHaveBeenCalledTimes(2));
  });
});
