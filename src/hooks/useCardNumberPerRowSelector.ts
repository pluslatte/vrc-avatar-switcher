import { loadCardNumberPerRow, saveCardNumberPerRow } from '@/lib/stores';
import { useQuery } from '@tanstack/react-query';

export const useCardNumberPerRowSelector = () => {
  const storeQuery = useQuery({
    queryKey: ['cardNumberPerRow'],
    queryFn: loadCardNumberPerRow,
    staleTime: Infinity,
  });

  const handleCardNumberPerRow = async (newNumber: string | null) => {
    if (!newNumber) return;
    const parsedNumber = parseInt(newNumber, 10);
    if (isNaN(parsedNumber)) return;
    await saveCardNumberPerRow(parsedNumber);
    storeQuery.refetch();
  };

  return {
    loading: storeQuery.isFetching || storeQuery.isPending || storeQuery.isLoading,
    cardNumberPerRow: storeQuery.data,
    handleCardNumberPerRow,
  };
};