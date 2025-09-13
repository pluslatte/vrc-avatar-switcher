import { ActionIcon, Box, Group, LoadingOverlay, SegmentedControl, Select, Text, Tooltip } from '@mantine/core';
import { IconImageInPicture, IconReload, IconTableColumn } from '@tabler/icons-react';

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
      <Text>ソート:</Text>
      <Select
        data={[{ value: 'Name', label: '名前' }, { value: 'Updated', label: '更新日' }]}
        style={{ width: 200 }}
        value={props.selectedSort}
        onChange={props.onSortSettingChange}
      />
      <IconImageInPicture />
      <Box pos="relative">
        <LoadingOverlay visible={props.cardImageSizeLoading} overlayProps={{ radius: 'md', blur: 2 }} />
        <SegmentedControl
          disabled={!props.cardImageSize || props.cardImageSizeLoading}
          value={props.cardImageSize?.toString()}
          onChange={props.setCardImageSize}
          data={[
            { label: '小', value: '80' },
            { label: '中', value: '120' },
            { label: '大', value: '160' },
            { label: '特大', value: '220' },
          ]}
        />
      </Box>
      <IconTableColumn />
      <Box pos="relative">
        <LoadingOverlay visible={props.cardNumberPerRowLoading} overlayProps={{ radius: 'md', blur: 2 }} />
        <SegmentedControl
          disabled={!props.cardNumberPerRow || props.cardNumberPerRowLoading}
          value={props.cardNumberPerRow?.toString()}
          onChange={props.setCardNumberPerRow}
          data={[
            { label: '3列', value: '4' },
            { label: '4列', value: '3' },
            { label: '6列', value: '2' },
          ]}
        />
      </Box>
      <Tooltip label="アバターリストを更新" withArrow position="top" bg="dark" c="white">
        <ActionIcon
          variant="outline"
          style={{ marginLeft: 'auto' }}
          size="xl"
          onClick={(e) => {
            e.preventDefault();
            props.onRefreshButtonClick();
          }}
        >
          <IconReload />
        </ActionIcon>
      </Tooltip>
    </Group>
  );
};

export default FooterContents;