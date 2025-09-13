import { Group, Text } from '@mantine/core';
import { IconImageInPicture, IconTableColumn } from '@tabler/icons-react';
import SortOrderSelector from './SortOrderSelector';
import AvatarCardImageSizeSelector from './AvatarCardImageSizeSelector';
import AvatarCardColumnSizeSelector from './AvatarCardColumnSizeSelector';
import AvatarListRefreshButton from './AvatarListRefreshButton';

interface FooterContentsProps {
  selectedSort: 'Name' | 'Updated';
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
      <Text>ソート:</Text>
      <SortOrderSelector
        selectedSort={props.selectedSort}
        onSortSettingChange={props.onSortSettingChange}
      />
      <IconImageInPicture />
      <AvatarCardImageSizeSelector
        cardImageSize={props.cardImageSize}
        cardImageSizeLoading={props.cardImageSizeLoading}
        setCardImageSize={props.setCardImageSize}
      />
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