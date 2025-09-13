import { Box, LoadingOverlay, SegmentedControl } from '@mantine/core';

const AvatarCardImageSizeSelector = (props: {
  cardImageSize: number | undefined;
  cardImageSizeLoading: boolean;
  setCardImageSize: (size: string | null) => void;
}) => {
  return (
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
  );
};

export default AvatarCardImageSizeSelector;