import { Popover, ActionIcon, Group, Divider, Text } from '@mantine/core';
import { IconSettings, IconImageInPicture, IconTableColumn } from '@tabler/icons-react';
import AvatarCardColumnSizeSelector from './AvatarCardColumnSizeSelector';
import AvatarCardImageSizeSelector from './AvatarCardImageSizeSelector';
import LogoutButton from '@/components/LogoutButton';

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
  return (
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
        <Group>
          <Text fz="xs" c="dimmed">
            {'(c) 2025 pluslatte'}
          </Text>
          <LogoutButton onLogoutSuccess={props.onLogoutSuccess} />
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
      </Popover.Dropdown>
    </Popover>
  );
};

export default SettingsPopover;