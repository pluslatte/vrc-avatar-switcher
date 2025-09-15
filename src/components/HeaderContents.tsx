import { Avatar, Box, Divider, Group, Text } from '@mantine/core';
import AvatarListRefreshButton from '@/components/AvatarListRefreshButton';

interface HeaderContentsProps {
  currentUserDisplayName: string;
  currentUserThumbnailImageUrl: string;
  currentUserAvatarName: string;
  onRefreshButtonClick: () => void;
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
      <Box style={{ marginLeft: 'auto' }} >
        <AvatarListRefreshButton
          onRefreshButtonClick={props.onRefreshButtonClick}
        />
      </Box>
    </Group>
  );
};

export default HeaderContents;