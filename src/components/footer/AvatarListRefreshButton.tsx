import { Tooltip, ActionIcon } from '@mantine/core';
import { IconReload } from '@tabler/icons-react';

const AvatarListRefreshButton = (props: { onRefreshButtonClick: () => void }) => {
  return (
    <Tooltip label="アバターリストを更新" withArrow position="top" bg="dark" c="white">
      <ActionIcon
        variant="outline"
        style={{ marginLeft: 'auto' }}
        size="xl"
        onClick={(e) => {
          e.preventDefault();
          props.onRefreshButtonClick();
        }}
      >
        <IconReload />
      </ActionIcon>
    </Tooltip>
  );
};

export default AvatarListRefreshButton;