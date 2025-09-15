import { Box, Divider, Group, MultiSelect } from '@mantine/core';
import { IconFilter, IconSortAscendingShapes } from '@tabler/icons-react';
import SortOrderSelector from './SortOrderSelector';
import { AvatarSortOrder, CurrentUser } from '@/lib/models';
import { Tag } from '@/lib/db';
import TagsRemovalPopover from './TagsRemovalPopover';
import SettingsPopover from './SettingsPopover';

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
  onTagFilterChange: (tags: Array<string>) => void;
  handlerDropTag: (tagName: string, currentUserId: string) => void;
  onLogoutSuccess: () => void;
}
const FooterContents = (props: FooterContentsProps) => {

  return (
    <Group px="md" mt="8">
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
      <TagsRemovalPopover
        currentUser={props.currentUser}
        availableTags={props.availableTags}
        handlerDropTag={props.handlerDropTag}
      />
      <Divider orientation="vertical" />
      <SettingsPopover
        cardImageSize={props.cardImageSize}
        cardImageSizeLoading={props.cardImageSizeLoading}
        cardNumberPerRow={props.cardNumberPerRow}
        cardNumberPerRowLoading={props.cardNumberPerRowLoading}
        setCardImageSize={props.setCardImageSize}
        setCardNumberPerRow={props.setCardNumberPerRow}
        onLogoutSuccess={props.onLogoutSuccess}
      />
    </Group>
  );
};

export default FooterContents;