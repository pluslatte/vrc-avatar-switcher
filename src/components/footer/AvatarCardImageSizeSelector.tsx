/*
 * Copyright (C) 2025 pluslatte
 * This file is part of vrc-avatar-switcher.
 *
 * vrc-avatar-switcher is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * 
 * vrc-avatar-switcher is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with vrc-avatar-switcher. If not, see <https://www.gnu.org/licenses/>. 
*/

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