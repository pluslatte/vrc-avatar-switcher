import { ActionIcon, Group, SegmentedControl, Select, Text } from '@mantine/core';
import { IconImageInPicture, IconReload } from '@tabler/icons-react';

interface FooterContentsProps {
  selectedSort: 'Name' | 'Updated';
  cardImageSize: number;
  setCardImageSize: (size: string | null) => void;
  onSelectorChange: (option: string | null) => void;
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
        onChange={props.onSelectorChange}
      />
      <IconImageInPicture />
      <SegmentedControl
        value={props.cardImageSize.toString()}
        onChange={props.setCardImageSize}
        data={[
          { label: '小', value: '80' },
          { label: '中', value: '120' },
          { label: '大', value: '160' },
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