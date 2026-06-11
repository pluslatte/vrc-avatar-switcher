import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LogoutButton from '@/components/LogoutButton';
import { command_logout } from '@/lib/commands';
import { renderWithProviders } from '@/test/testUtils';

vi.mock('@/lib/commands');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('LogoutButton', () => {
  it('クリックするとログアウトコマンドの完了後にコールバックが呼ばれる (A8)', async () => {
    vi.mocked(command_logout).mockResolvedValue(undefined);
    const onLogoutSuccess = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<LogoutButton onLogoutSuccess={onLogoutSuccess} />);

    await user.click(screen.getByRole('button', { name: 'Logout' }));

    await waitFor(() => expect(onLogoutSuccess).toHaveBeenCalledTimes(1));
    expect(command_logout).toHaveBeenCalledTimes(1);
  });
});
