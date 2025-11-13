import { Box, Button, Divider, Group, MultiSelect } from '@mantine/core';
import { IconFilter, IconSearch, IconSortAscendingShapes, IconTags } from '@tabler/icons-react';
import SortOrderSelector from './SortOrderSelector';
import { Avatar, AvatarSortOrder, CurrentUser } from '@/lib/models';
import { Tag } from '@/lib/db';
import SettingsPopover from './SettingsPopover';
import AvatarSearchBox from './AvatarSearchBox';
import TagEditDialog from '../avatar/TagEditDialog';
import { useDisclosure } from '@mantine/hooks';

interface FooterContentsProps {
  avatars: Array<Avatar>;
  currentUser: CurrentUser;
  selectedSort: AvatarSortOrder;
  cardImageSize: number | undefined;
  cardImageSizeLoading: boolean;
  cardNumberPerRow: number | undefined;
  cardNumberPerRowLoading: boolean;
  updateAvatarSearchInputString: (input: string) => void;
  availableTags: Array<Tag>;
  setCardImageSize: (size: string | null) => void;
  onSortSettingChange: (option: string | null) => void;
  setCardNumberPerRow: (number: string | null) => void;
  onTagFilterChange: (tags: Array<string>) => void;
  onLogoutSuccess: () => void;
}
const FooterContents = (props: FooterContentsProps) => {
  const [tagEditDialogOpened, { open: openTagEditDialog, close: closeTagEditDialog }] = useDisclosure(false);

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
      <Button
        variant="outline"
        size="xs"
        onClick={() => { openTagEditDialog(); }}
        style={{ marginLeft: 'auto' }}
      >
        <IconTags />
      </Button>
      <TagEditDialog
        opened={tagEditDialogOpened}
        onClose={closeTagEditDialog}
        avatars={props.avatars}
        tags={props.availableTags}
        currentUserId={props.currentUser.id}
      />
      <Divider orientation="vertical" />
      <IconSearch />
      <AvatarSearchBox
        onChange={props.updateAvatarSearchInputString}
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