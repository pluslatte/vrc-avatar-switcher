// eslint-disable-next-line quotes
import { Avatar, Text } from "@mantine/core";

interface StatusBarProps {
  currentUserDisplayName: string;
  currentUserThumbnailImageUrl: string;
  currentUserAvatarName: string;
  onLogoutSuccess: () => void;
}
const StatusLine = (props: StatusBarProps) => {
  return (
    <div>
      <Text>{props.currentUserDisplayName}</Text>
      <Text>{props.currentUserAvatarName}</Text>
      <Avatar src={props.currentUserThumbnailImageUrl} alt="Current User Avatar" />
    </div>
  );
};

export default StatusLine;