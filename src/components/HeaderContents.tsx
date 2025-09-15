// eslint-disable-next-line quotes
import { Avatar, Divider, Group, Text } from "@mantine/core";

interface HeaderContentsProps {
  currentUserDisplayName: string;
  currentUserThumbnailImageUrl: string;
  currentUserAvatarName: string;
}
const HeaderContents = (props: HeaderContentsProps) => {
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
    </Group>
  );
};

export default HeaderContents;