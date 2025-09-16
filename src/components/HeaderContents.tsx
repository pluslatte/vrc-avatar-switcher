import { Avatar, Box, Divider, Group, Text } from '@mantine/core';
import AvatarListRefreshButton from '@/components/AvatarListRefreshButton';
import { AvatarSortOrder } from '@/lib/models';

interface HeaderContentsProps {
  avatarSortOrder: AvatarSortOrder;
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
      <Box style={{ marginLeft: 'auto' }} >
        <AvatarListRefreshButton avatarSortOrder={props.avatarSortOrder} />
      </Box>
    </Group>
  );
};

export default HeaderContents;