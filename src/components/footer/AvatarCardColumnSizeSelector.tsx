import { Box, LoadingOverlay, SegmentedControl } from '@mantine/core';

const AvatarCardColumnSizeSelector = (props: {
  cardNumberPerRow: number | undefined;
  cardNumberPerRowLoading: boolean;
  setCardNumberPerRow: (number: string | null) => void;
}) => {
  return (
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
  );
};

export default AvatarCardColumnSizeSelector;