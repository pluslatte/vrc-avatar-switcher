import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '@/App';
import { command_check_auth, command_new_auth } from '@/lib/commands';
import { renderWithProviders, createTestQueryClient } from '@/test/testUtils';
import { MainAppShellProps } from '@/components/MainAppShell';

vi.mock('@/lib/commands');

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
  it('shows the main screen while checking authentication', () => {
    vi.mocked(command_check_auth).mockImplementation(() => new Promise(() => {}));
    renderWithProviders(<App />, createTestQueryClient());

    expect(screen.getByTestId('main-app-shell')).toBeInTheDocument();
    expect(screen.getByTestId('auth-status')).toHaveTextContent('checking');
    expect(screen.queryByText('ログインしてください')).not.toBeInTheDocument();
  });

  it('shows the main screen without a login form for a valid session (A1)', async () => {
    vi.mocked(command_check_auth).mockResolvedValue('Authenticated');
    renderWithProviders(<App />, createTestQueryClient());

    expect(await screen.findByTestId('main-app-shell')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated'));
    expect(screen.queryByText('ログインしてください')).not.toBeInTheDocument();
  });

  it('treats a missing session as logged out (A2)', async () => {
    vi.mocked(command_check_auth).mockResolvedValue('LoggedOut');
    const user = userEvent.setup();
    renderWithProviders(<App />, createTestQueryClient());

    await waitFor(() => expect(screen.getByTestId('auth-status')).toHaveTextContent('logged-out'));
    expect(screen.getByTestId('main-app-shell')).toBeInTheDocument();
    expect(screen.queryByText('ログインしてください')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '再ログイン' }));

    expect(await screen.findByText('ログインしてください')).toBeInTheDocument();
  });

  it('requires login again when the session is invalid (A2)', async () => {
    vi.mocked(command_check_auth).mockResolvedValue('NeedsReauth');
    renderWithProviders(<App />, createTestQueryClient());

    await waitFor(() => expect(screen.getByTestId('auth-status')).toHaveTextContent('needs-reauth'));
    expect(screen.getByTestId('main-app-shell')).toBeInTheDocument();
  });

  it('treats a failed authentication check as logged out (A2)', async () => {
    vi.mocked(command_check_auth).mockRejectedValue('network error');
    renderWithProviders(<App />, createTestQueryClient());

    await waitFor(() => expect(screen.getByTestId('auth-status')).toHaveTextContent('logged-out'));
    expect(screen.getByTestId('main-app-shell')).toBeInTheDocument();
  });

  it('checks authentication again after login and shows the main screen (A3)', async () => {
    vi.mocked(command_check_auth)
      .mockResolvedValueOnce('LoggedOut')
      .mockResolvedValue('Authenticated');
    vi.mocked(command_new_auth).mockResolvedValue('Success');
    const user = userEvent.setup();
    renderWithProviders(<App />, createTestQueryClient());

    await user.click(await screen.findByRole('button', { name: '再ログイン' }));
    await user.type(await screen.findByLabelText('Username'), 'alice');
    await user.type(screen.getByLabelText('Password'), 'hunter2');
    await user.click(screen.getByRole('button', { name: 'Login' }));

    expect(await screen.findByTestId('main-app-shell')).toBeInTheDocument();
    await waitFor(() => expect(command_check_auth).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated'));
  });
});
