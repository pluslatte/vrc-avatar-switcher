import { command_check_auth } from '@/lib/commands';
import { queryKeys } from '@/lib/queryKeys';
import MainAppShell from '@/components/MainAppShell';
import LoginForm from '@/components/LoginForm';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { AuthStatus } from '@/lib/authStatus';

function App() {
  const queryClient = useQueryClient();
  const [loginModalOpened, { open: openLoginModal, close: closeLoginModal }] = useDisclosure(false);
  const query = useQuery({
    queryKey: queryKeys.authCheck,
    queryFn: async () => {
      try {
        return await command_check_auth();
      } catch (error) {
        console.error('Error during auth check:', error);
        return false;
      }
    },
  });

  const invalidateAuthCheck = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.authCheck });
  };

  const handleLoginSuccess = () => {
    closeLoginModal();
    invalidateAuthCheck();
    queryClient.invalidateQueries({ queryKey: queryKeys.avatarListAll });
  };

  const authStatus: AuthStatus = query.isPending
    ? 'checking'
    : query.data === true
      ? 'authenticated'
      : 'unauthenticated';

  return (
    <main>
      <MainAppShell
        authStatus={authStatus}
        onLoginClick={openLoginModal}
        onLogoutSuccess={invalidateAuthCheck}
      />
      <Modal
        opened={loginModalOpened}
        onClose={closeLoginModal}
        closeOnClickOutside={false}
        title="再ログイン"
        centered
      >
        <LoginForm onLoginSuccess={handleLoginSuccess} fullHeight={false} />
      </Modal>
    </main>
  );
}

export default App;
