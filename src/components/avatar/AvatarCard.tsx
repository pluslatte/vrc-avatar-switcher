/*
 * Copyright (C) 2025 pluslatte
 * This file is part of vrc-avatar-switcher.
 *
 * vrc-avatar-switcher is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * 
 * vrc-avatar-switcher is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with vrc-avatar-switcher. If not, see <https://www.gnu.org/licenses/>. 
*/

import { Avatar, CurrentUser } from '@/lib/models';
import { BackgroundImage, Box, Button, Card, Checkbox, Divider, Text, Tooltip } from '@mantine/core';
import { Tag } from '@/lib/db';
import AvatarTags from './AvatarTags';

interface AvatarCardProps {
  avatar: Avatar;
  avatars: Array<Avatar>;
  avatarTags: Array<Tag>;
  currentUser: CurrentUser;
  isActiveAvatar: boolean;
  pendingSwitch: boolean;
  imageSize: number | null;
  onAvatarSwitchClicked: (avatarId: string) => void;
  onTagRemove: (params: { tagName: string; avatarId: string; currentUserId: string }) => void;
  isSelected: boolean;
  onSelectionChange: (checked: boolean) => void;
}

const AvatarCard = (props: AvatarCardProps) => {
  const handleSwitch = () => {
    if (props.isActiveAvatar) return;
    props.onAvatarSwitchClicked(props.avatar.id);
  };

  return (
    <Card
      shadow='lg'
      radius="md"
      withBorder
      bg={props.isActiveAvatar ? 'dark' : ''}
      style={props.isActiveAvatar
        ? { border: '2px solid var(--mantine-color-orange-7)' }
        : undefined}
    >
      <Box pos="relative">
        <Box
          style={{
            position: 'absolute',
            top: -6,
            left: -6,
            padding: 11,
            zIndex: 3,
            borderRadius: 'var(--mantine-radius-md)',
            backgroundColor: props.isActiveAvatar ? 'dark' : 'var(--mantine-color-dark-6)',
          }}
        >
          <Checkbox
            aria-label="アバターを選択"
            checked={props.isSelected}
            onChange={(event) => props.onSelectionChange(event.currentTarget.checked)}
          />
        </Box>
        <BackgroundImage
          radius="md"
          src={props.avatar.thumbnailImageUrl}
        >
          <Button
            variant="gradient"
            gradient={{ from: 'transparent', to: 'dark', deg: 180 }}
            fullWidth
            fz="h2"
            radius="sm"
            h={props.imageSize || 120}
            disabled={props.isActiveAvatar}
            loading={props.pendingSwitch && !props.isActiveAvatar}
            onClick={handleSwitch}
            style={{
              color: props.isActiveAvatar
                ? 'var(--mantine-color-orange-7)'
                : undefined,
              textShadow: '0 0 10px rgba(63, 63, 63, 0.8)',
              backgroundColor: props.isActiveAvatar
                ? '#111111AA'
                : undefined,
            }}
          >
            {props.isActiveAvatar ? 'Active' : 'Select'}
          </Button>
        </BackgroundImage>
      </Box>

      <Card.Section p="sm" h="48px">
        <Tooltip label={props.avatar.name}>
          <Text
            fw={500}
            size="md"
            lineClamp={1}
          >
            {props.avatar.name}
          </Text>
        </Tooltip>
      </Card.Section>
      <Divider />
      <Card.Section p="sm">
        <AvatarTags
          avatar={props.avatar}
          avatars={props.avatars}
          avatarTags={props.avatarTags}
          currentUser={props.currentUser}
          onTagRemove={props.onTagRemove}
        />
      </Card.Section>
    </Card>
  );
};

export default AvatarCard;