/*
 * Copyright (C) 2025 pluslatte
 * This file is part of vrc-avatar-switcher.
 *
 * vrc-avatar-switcher is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * 
 * vrc-avatar-switcher is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with vrc-avatar-switcher. If not, see <https://www.gnu.org/licenses/>. 
*/

import { Popover, ActionIcon, Group, Divider, Text, Anchor } from '@mantine/core';
import { IconSettings, IconImageInPicture, IconTableColumn } from '@tabler/icons-react';
import AvatarCardColumnSizeSelector from './AvatarCardColumnSizeSelector';
import AvatarCardImageSizeSelector from './AvatarCardImageSizeSelector';
import LogoutButton from '@/components/LogoutButton';
import { useDisclosure } from '@mantine/hooks';
import LicensePage from '@/components/footer/LicensePage';
import React from 'react';

interface SettingsPopoverProps {
  cardImageSize: number | undefined;
  cardImageSizeLoading: boolean;
  cardNumberPerRow: number | undefined;
  cardNumberPerRowLoading: boolean;
  setCardImageSize: (size: string | null) => void;
  setCardNumberPerRow: (number: string | null) => void;
  onLogoutSuccess: () => void;
}
const SettingsPopover = (props: SettingsPopoverProps) => {
  const [licenseOpened, { open: openLicense, close: closeLicense }] = useDisclosure(false);

  return (
    <React.Fragment>
      <Popover width={300} position="top" withArrow shadow="md">
        <Popover.Target>
          <ActionIcon
            color="gray"
            variant="subtle"
            radius="sm"
          >
            <IconSettings />
          </ActionIcon>
        </Popover.Target>
        <Popover.Dropdown>
          <Group justify="space-between" style={{ width: '100%' }}>
            <Text fz="xs" c="dimmed">
              {'© 2025 pluslatte'}
              <br />
              <Anchor
                onClick={openLicense}
                fz="xs"
                c="dimmed"
                underline="always"
                style={{ cursor: 'pointer' }}
              >
                {'Licensed under GPL-3.0'}
              </Anchor>
            </Text>
          </Group>
          <Divider my="xs" />
          <Group>
            <IconImageInPicture />
            <AvatarCardImageSizeSelector
              cardImageSize={props.cardImageSize}
              cardImageSizeLoading={props.cardImageSizeLoading}
              setCardImageSize={props.setCardImageSize}
            />
          </Group>
          <Divider my="xs" />
          <Group>
            <IconTableColumn />
            <AvatarCardColumnSizeSelector
              cardNumberPerRow={props.cardNumberPerRow}
              cardNumberPerRowLoading={props.cardNumberPerRowLoading}
              setCardNumberPerRow={props.setCardNumberPerRow}
            />
          </Group>
          <Divider my="xs" />
          <Group>
            <Anchor
              href="https://github.com/pluslatte/vrc-avatar-switcher"
              fz="xs"
              c="dimmed"
              target="_blank"
            >
              Source Code
            </Anchor>
            <LogoutButton onLogoutSuccess={props.onLogoutSuccess} />
          </Group>
        </Popover.Dropdown>
      </Popover>
      <LicensePage opened={licenseOpened} onClose={closeLicense} />
    </React.Fragment>
  );
};

export default SettingsPopover;