/*
 * Copyright (C) 2025 pluslatte
 * This file is part of vrc-avatar-switcher.
 *
 * vrc-avatar-switcher is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * 
 * vrc-avatar-switcher is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with vrc-avatar-switcher. If not, see <https://www.gnu.org/licenses/>. 
*/

import { Avatar, Box, Divider, Group, Text } from '@mantine/core';
import AvatarListRefreshButton from '@/components/header/AvatarListRefreshButton';
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