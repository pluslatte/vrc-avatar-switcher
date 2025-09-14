import { Box, Divider, Group, LoadingOverlay, MultiSelect } from '@mantine/core';
import { IconImageInPicture, IconSortAscendingShapes, IconTableColumn } from '@tabler/icons-react';
import SortOrderSelector from './SortOrderSelector';
import AvatarCardImageSizeSelector from './AvatarCardImageSizeSelector';
import AvatarCardColumnSizeSelector from './AvatarCardColumnSizeSelector';
import AvatarListRefreshButton from './AvatarListRefreshButton';
import { AvatarSortOrder, CurrentUser } from '@/lib/models';
import { useQuery } from '@tanstack/react-query';
import { queryAllTagsAvailable } from '@/lib/db';

interface FooterContentsProps {
  currentUser: CurrentUser;
  selectedSort: AvatarSortOrder;
  cardImageSize: number | undefined;
  cardImageSizeLoading: boolean;
  cardNumberPerRow: number | undefined;
  cardNumberPerRowLoading: boolean;
  setCardImageSize: (size: string | null) => void;
  onSortSettingChange: (option: string | null) => void;
  setCardNumberPerRow: (number: string | null) => void;
  onRefreshButtonClick: () => void;
  onTagFilterChange: (tags: Array<string>) => void;
}
const FooterContents = (props: FooterContentsProps) => {
  const tagQuery = useQuery({
    queryKey: ['tags', props.currentUser.id],
    queryFn: async () => {
      const tags = await queryAllTagsAvailable(props.currentUser.id);
      return tags;
    }
  });

  return (
    <Group px="md" mt="8">
      <AvatarListRefreshButton
        onRefreshButtonClick={props.onRefreshButtonClick}
      />
      <Divider orientation="vertical" />
      <Box pos="relative">
        <LoadingOverlay visible={tagQuery.isPending} overlayProps={{ radius: 'md', blur: 2 }} />
        <MultiSelect
          placeholder="タグでフィルター"
          data={tagQuery.data ? tagQuery.data.map(tag => ({ value: tag.display_name, label: tag.display_name })) : []}
          searchable
          onChange={props.onTagFilterChange}
        />
      </Box>
      <Divider orientation="vertical" />
      <IconSortAscendingShapes />
      <SortOrderSelector
        selectedSort={props.selectedSort}
        onSortSettingChange={props.onSortSettingChange}
      />
      <Divider orientation="vertical" />
      <IconImageInPicture />
      <AvatarCardImageSizeSelector
        cardImageSize={props.cardImageSize}
        cardImageSizeLoading={props.cardImageSizeLoading}
        setCardImageSize={props.setCardImageSize}
      />
      <Divider orientation="vertical" />
      <IconTableColumn />
      <AvatarCardColumnSizeSelector
        cardNumberPerRow={props.cardNumberPerRow}
        cardNumberPerRowLoading={props.cardNumberPerRowLoading}
        setCardNumberPerRow={props.setCardNumberPerRow}
      />
    </Group>
  );
};

export default FooterContents;