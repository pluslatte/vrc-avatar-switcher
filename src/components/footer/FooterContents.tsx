import { Divider, Group, MultiSelect } from '@mantine/core';
import { IconImageInPicture, IconSortAscendingShapes, IconTableColumn } from '@tabler/icons-react';
import SortOrderSelector from './SortOrderSelector';
import AvatarCardImageSizeSelector from './AvatarCardImageSizeSelector';
import AvatarCardColumnSizeSelector from './AvatarCardColumnSizeSelector';
import AvatarListRefreshButton from './AvatarListRefreshButton';
import { AvatarSortOrder } from '@/lib/models';

interface FooterContentsProps {
  registeredTagNames: string[];
  selectedSort: AvatarSortOrder;
  cardImageSize: number | undefined;
  cardImageSizeLoading: boolean;
  cardNumberPerRow: number | undefined;
  cardNumberPerRowLoading: boolean;
  setCardImageSize: (size: string | null) => void;
  onSortSettingChange: (option: string | null) => void;
  setCardNumberPerRow: (number: string | null) => void;
  onRefreshButtonClick: () => void;
}
const FooterContents = (props: FooterContentsProps) => {
  return (
    <Group px="md" mt="8">
      <AvatarListRefreshButton
        onRefreshButtonClick={props.onRefreshButtonClick}
      />
      <Divider orientation="vertical" />
      <MultiSelect
        placeholder="タグでフィルター"
        data={props.registeredTagNames}
        searchable
      />
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