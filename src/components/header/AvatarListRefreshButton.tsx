/*
 * Copyright (C) 2025 pluslatte
 * This file is part of vrc-avatar-switcher.
 *
 * vrc-avatar-switcher is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * 
 * vrc-avatar-switcher is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with vrc-avatar-switcher. If not, see <https://www.gnu.org/licenses/>. 
*/

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