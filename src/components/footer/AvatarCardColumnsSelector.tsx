import { Box, LoadingOverlay, SegmentedControl } from '@mantine/core';

const AvatarCardColumnsSelector = (props: {
  cardColumnSpan: number | undefined;
  cardColumnSpanLoading: boolean;
  setCardColumnSpan: (number: number) => void;
}) => {
  return (
    <Box pos="relative">
      <LoadingOverlay visible={props.cardColumnSpanLoading} overlayProps={{ radius: 'md', blur: 2 }} />
      <SegmentedControl
        disabled={!props.cardColumnSpan || props.cardColumnSpanLoading}
        value={props.cardColumnSpan?.toString()}
        onChange={value => props.setCardColumnSpan(Number(value))}
        data={[
          { label: '3列', value: '4' },
          { label: '4列', value: '3' },
          { label: '6列', value: '2' },
        ]}
      />
    </Box>
  );
};

export default AvatarCardColumnsSelector;