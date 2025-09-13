import { ActionIcon, Group, SegmentedControl, Select, Text } from '@mantine/core';
import { IconImageInPicture, IconReload, IconTableRow } from '@tabler/icons-react';

interface FooterContentsProps {
  selectedSort: 'Name' | 'Updated';
  cardImageSize: number;
  cardNumberPerRow: number;
  setCardImageSize: (size: string | null) => void;
  onSortSettingChange: (option: string | null) => void;
  setCardNumberPerRow: (number: string | null) => void;
  onRefreshButtonClick: () => void;
}
const FooterContents = (props: FooterContentsProps) => {
  return (
    <Group px="md" mt="8">
      <Text>ソート設定:</Text>
      <Select
        data={[{ value: 'Name', label: '名前' }, { value: 'Updated', label: '更新日' }]}
        style={{ width: 200 }}
        value={props.selectedSort}
        onChange={props.onSortSettingChange}
      />
      <IconImageInPicture />
      <SegmentedControl
        value={props.cardImageSize.toString()}
        onChange={props.setCardImageSize}
        data={[
          { label: '小', value: '80' },
          { label: '中', value: '120' },
          { label: '大', value: '160' },
          { label: '特大', value: '220' },
        ]}
      />
      <IconTableRow />
      <SegmentedControl
        value={props.cardNumberPerRow.toString()}
        onChange={props.setCardNumberPerRow}
        data={[
          { label: '3列', value: '4' },
          { label: '4列', value: '3' },
          { label: '6列', value: '2' },
        ]}
      />
      <ActionIcon
        variant="filled"
        style={{ marginLeft: 'auto' }}
        size="xl"
        onClick={(e) => {
          e.preventDefault();
          props.onRefreshButtonClick();
        }}
      >
        <IconReload />
      </ActionIcon>
    </Group>
  );
};

export default FooterContents;