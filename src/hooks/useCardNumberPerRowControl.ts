import { useState } from 'react';

export const useCardNumberPerRowControl = () => {
  const [cardNumberPerRow, setCardNumberPerRow] = useState<number>(3);

  const handleCardNumberPerRow = (newNumber: string | null) => {
    if (!newNumber) return;
    const parsedNumber = parseInt(newNumber, 10);
    if (isNaN(parsedNumber)) return;
    setCardNumberPerRow(parsedNumber);
  };

  return {
    cardNumberPerRow,
    handleCardNumberPerRow,
  };
};