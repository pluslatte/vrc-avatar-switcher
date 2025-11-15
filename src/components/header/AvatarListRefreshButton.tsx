import { avatarListQueryKey } from '@/hooks/useAvatarListQuery';
import { AvatarSortOrder } from '@/lib/models';
import { Tooltip, ActionIcon } from '@mantine/core';
import { IconReload } from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';

interface AvatarListRefreshButtonProps {
  avatarSortOrder: AvatarSortOrder;
}
const AvatarListRefreshButton = (props: AvatarListRefreshButtonProps) => {
  const queryClient = useQueryClient();
  return (
    <Tooltip label="アバターリストを更新" withArrow position="top" bg="dark" c="white">
      <ActionIcon
        variant="outline"
        size="xl"
        onClick={(e) => {
          e.preventDefault();
          queryClient.invalidateQueries({ queryKey: avatarListQueryKey(props.avatarSortOrder) });
        }}
      >
        <IconReload />
      </ActionIcon>
    </Tooltip>
  );
};

export default AvatarListRefreshButton;