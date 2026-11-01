import { Group, Text } from '@mantine/core';
import { AuthStatus } from '@/lib/authStatus';

interface AuthStatusBarProps {
  authStatus: AuthStatus;
}

const AuthStatusBar = (props: AuthStatusBarProps) => {
  const authStatusLabel = {
    checking: 'loading...',
    authenticated: 'valid',
    'needs-reauth': 'needs reauth',
    'logged-out': 'logged out',
  }[props.authStatus];

  return (
    <Group
      h={28}
      px="md"
      role="status"
      style={{ borderTop: '1px solid var(--mantine-color-default-border)', flexShrink: 0 }}
    >
      <Text size="xs" c="dimmed">
        Auth status: {authStatusLabel}
      </Text>
    </Group>
  );
};

export default AuthStatusBar;
