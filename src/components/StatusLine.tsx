// eslint-disable-next-line quotes
import { Avatar, Divider, Group, Text } from "@mantine/core";
import LogoutButton from '@/components/LogoutButton';

interface StatusBarProps {
  currentUserDisplayName: string;
  currentUserThumbnailImageUrl: string;
  currentUserAvatarName: string;
  onLogoutSuccess: () => void;
}
const StatusLine = (props: StatusBarProps) => {
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
      <LogoutButton onLogoutSuccess={props.onLogoutSuccess} />
    </Group>
  );
};

export default StatusLine;