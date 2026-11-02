import { ActionIcon, Box, Divider, Group, MultiSelect } from '@mantine/core';
import { IconFilter, IconSearch, IconSortAscendingShapes, IconTags } from '@tabler/icons-react';
import SortOrderSelector from './SortOrderSelector';
import { AvatarSortOrder, Tag } from '@/lib/models';
import SettingsPopover from './SettingsPopover';
import AvatarSearchBox from './AvatarSearchBox';
import TagEditDialog from '../avatar/TagEditDialog';
import { useDisclosure } from '@mantine/hooks';

interface AvatarToolbarProps {
  currentUserId: string;
  selectedSort: AvatarSortOrder;
  cardImageSize: number | undefined;
  cardImageSizeLoading: boolean;
  cardColumnSpan: number | undefined;
  cardColumnSpanLoading: boolean;
  updateAvatarSearchInputString: (input: string) => void;
  availableTags: Array<Tag>;
  setCardImageSize: (size: number) => void;
  onSortSettingChange: (option: string | null) => void;
  setCardColumnSpan: (number: number) => void;
  onTagFilterChange: (tags: Array<string>) => void;
  onLogoutSuccess: () => void;
}
const AvatarToolbar = (props: AvatarToolbarProps) => {
  const [tagEditDialogOpened, { open: openTagEditDialog, close: closeTagEditDialog }] = useDisclosure(false);

  return (
    <Group mih={60} px="md" py="xs" align="center">
      <IconSortAscendingShapes />
      <SortOrderSelector
        selectedSort={props.selectedSort}
        onSortSettingChange={props.onSortSettingChange}
      />
      <Divider orientation="vertical" />
      <IconFilter />
      <Box
        pos="relative"
        style={{ marginRight: 'auto' }}
      >
        <MultiSelect
          placeholder="タグでフィルター"
          data={props.availableTags.map(tag => ({ value: tag.display_name, label: tag.display_name }))}
          searchable
          onChange={props.onTagFilterChange}
        />
      </Box>
      <Divider orientation="vertical" />
      <IconSearch />
      <AvatarSearchBox
        onChange={props.updateAvatarSearchInputString}
      />
      <Divider orientation="vertical" />
      <ActionIcon
        color="gray"
        variant="subtle"
        radius="sm"
        onClick={() => { openTagEditDialog(); }}
      >
        <IconTags />
      </ActionIcon>
      <TagEditDialog
        opened={tagEditDialogOpened}
        onClose={closeTagEditDialog}
        tags={props.availableTags}
        currentUserId={props.currentUserId}
      />
      <Divider orientation="vertical" />
      <SettingsPopover
        cardImageSize={props.cardImageSize}
        cardImageSizeLoading={props.cardImageSizeLoading}
        cardColumnSpan={props.cardColumnSpan}
        cardColumnSpanLoading={props.cardColumnSpanLoading}
        setCardImageSize={props.setCardImageSize}
        setCardColumnSpan={props.setCardColumnSpan}
        onLogoutSuccess={props.onLogoutSuccess}
      />
    </Group>
  );
};

export default AvatarToolbar;
