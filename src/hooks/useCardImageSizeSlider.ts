import { useState } from 'react';

export const useCardImageSizeSlider = () => {
  const [cardImageSize, setCardImageSize] = useState<number>(120);

  const handleCardImageSizeChange = (newSize: string | null) => {
    if (!newSize) return;
    const parsedSize = parseInt(newSize, 10);
    if (isNaN(parsedSize)) return;
    setCardImageSize(parsedSize);
  };

  return {
    cardImageSize,
    handleCardImageSizeChange,
  };
};