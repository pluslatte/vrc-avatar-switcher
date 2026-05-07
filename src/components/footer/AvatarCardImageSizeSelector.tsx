/*
 * Copyright 2025 pluslatte
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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