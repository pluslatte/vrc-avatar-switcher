/*
 * Copyright 2025 pluslatte
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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