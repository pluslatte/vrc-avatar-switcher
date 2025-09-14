import { ActionIcon, Badge, Box, Divider, Group, MultiSelect, Popover, Text } from '@mantine/core';
import { IconFilter, IconImageInPicture, IconSettings, IconSortAscendingShapes, IconTableColumn, IconTagMinus, IconX } from '@tabler/icons-react';
import SortOrderSelector from './SortOrderSelector';
import AvatarCardImageSizeSelector from './AvatarCardImageSizeSelector';
import AvatarCardColumnSizeSelector from './AvatarCardColumnSizeSelector';
import AvatarListRefreshButton from './AvatarListRefreshButton';
import { AvatarSortOrder, CurrentUser } from '@/lib/models';
import { Tag } from '@/lib/db';

interface FooterContentsProps {
  currentUser: CurrentUser;
  selectedSort: AvatarSortOrder;
  cardImageSize: number | undefined;
  cardImageSizeLoading: boolean;
  cardNumberPerRow: number | undefined;
  cardNumberPerRowLoading: boolean;
  availableTags: Array<Tag>;
  setCardImageSize: (size: string | null) => void;
  onSortSettingChange: (option: string | null) => void;
  setCardNumberPerRow: (number: string | null) => void;
  onRefreshButtonClick: () => void;
  onTagFilterChange: (tags: Array<string>) => void;
  handlerDropTag: (tagName: string, currentUserId: string) => void;
}
const FooterContents = (props: FooterContentsProps) => {

  return (
    <Group px="md" mt="8">
      <AvatarListRefreshButton
        onRefreshButtonClick={props.onRefreshButtonClick}
      />
      <Divider orientation="vertical" />
      <IconSortAscendingShapes />
      <SortOrderSelector
        selectedSort={props.selectedSort}
        onSortSettingChange={props.onSortSettingChange}
      />
      <Divider orientation="vertical" />
      <IconFilter />
      <Box pos="relative">
        <MultiSelect
          placeholder="タグでフィルター"
          data={props.availableTags.map(tag => ({ value: tag.display_name, label: tag.display_name }))}
          searchable
          onChange={props.onTagFilterChange}
        />
      </Box>
      <Divider orientation="vertical" />
      <Popover width={300} position="top" withArrow shadow="md">
        <Popover.Target>
          <ActionIcon
            style={{ marginLeft: 'auto' }}
            color="gray"
            variant="subtle"
            radius="sm"
          >
            <IconTagMinus />
          </ActionIcon>
        </Popover.Target>
        <Popover.Dropdown>
          <Box pos="relative">
            <Group gap="xs">
              {props.availableTags.map((tag) => (
                <Badge color={tag.color || 'gray'} key={tag.display_name}>
                  {tag.display_name}
                  <ActionIcon
                    size={13}
                    color="dark"
                    variant="transparent"
                    onClick={() => {
                      props.handlerDropTag(tag.display_name, props.currentUser.id);
                    }}
                    style={{ marginLeft: 4, paddingTop: 3 }}
                  >
                    <IconX />
                  </ActionIcon>
                </Badge>
              ))}
            </Group>
          </Box>
        </Popover.Dropdown>
      </Popover>
      <Divider orientation="vertical" />
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
          <Text fz="xs" c="dimmed">
              {'(c) 2025 pluslatte'}
          </Text>
        </Popover.Dropdown>
      </Popover>
    </Group>
  );
};

export default FooterContents;