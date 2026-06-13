import { queryKeys } from '@/lib/queryKeys';
import { Tooltip, ActionIcon } from '@mantine/core';
import { IconReload } from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';

const AvatarListRefreshButton = () => {
  const queryClient = useQueryClient();
  return (
    <Tooltip label="アバターリストを更新" withArrow position="top" bg="dark" c="white">
      <ActionIcon
        variant="outline"
        size="xl"
        onClick={(e) => {
          e.preventDefault();
          queryClient.invalidateQueries({ queryKey: queryKeys.avatarListAll });
        }}
      >
        <IconReload />
      </ActionIcon>
    </Tooltip>
  );
};

export default AvatarListRefreshButton;
