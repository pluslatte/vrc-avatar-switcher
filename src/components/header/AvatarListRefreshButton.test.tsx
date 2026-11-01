import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AvatarListRefreshButton from '@/components/header/AvatarListRefreshButton';
import { queryKeys } from '@/lib/queryKeys';
import { createTestQueryClient, renderWithProviders } from '@/test/testUtils';

describe('AvatarListRefreshButton', () => {
  it('invalidates avatar list queries for every sort order when clicked (B3)', async () => {
    const queryClient = createTestQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const user = userEvent.setup();
    renderWithProviders(<AvatarListRefreshButton />, queryClient);

    await user.click(screen.getByRole('button'));

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.avatarListAll });
  });
});
