import { Avatar, Badge, Box, Button, Divider, Group, Text } from '@mantine/core';
import AvatarListRefreshButton from '@/components/header/AvatarListRefreshButton';
import { AuthStatus } from '@/lib/authStatus';

interface HeaderContentsProps {
  authStatus: AuthStatus;
  onLoginClick: () => void;
  currentUserDisplayName: string;
  currentUserThumbnailImageUrl?: string;
  currentUserAvatarName: string;
}
const HeaderContents = (props: HeaderContentsProps) => {
  const authStatusView = {
    checking: { label: '認証確認中', color: 'blue' },
    authenticated: { label: '認証済み', color: 'green' },
    'needs-reauth': { label: '再ログインが必要', color: 'yellow' },
    'logged-out': { label: '未ログイン', color: 'gray' },
  }[props.authStatus];

  return (
    <Group h="100%" px="md">
      <Avatar src={props.currentUserThumbnailImageUrl} alt="Current User Avatar" />
      <Text
        size="lg"
        fw={500}
      >
        {props.currentUserDisplayName}
      </Text>
      <Divider orientation="vertical" />
      <Text
        size="md"
        c="dimmed"
        fw={400}
      >
        現在のアバター: {props.currentUserAvatarName}
      </Text>
      <Badge color={authStatusView.color} variant="light">
        {authStatusView.label}
      </Badge>
      <Box style={{ marginLeft: 'auto' }} >
        <Group gap="xs">
          {(props.authStatus === 'needs-reauth' || props.authStatus === 'logged-out') && (
            <Button size="xs" variant="light" onClick={props.onLoginClick}>
              {props.authStatus === 'needs-reauth' ? '再ログイン' : 'ログイン'}
            </Button>
          )}
          <AvatarListRefreshButton />
        </Group>
      </Box>
    </Group>
  );
};

export default HeaderContents;
