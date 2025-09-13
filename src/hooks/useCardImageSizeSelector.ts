import { loadCardImageSize, saveCardImageSize } from '@/lib/stores';
import { useQuery } from '@tanstack/react-query';

export const useCardImageSizeSelector = () => {
  const storeQuery = useQuery({
    queryKey: ['cardImageSize'],
    queryFn: loadCardImageSize,
    staleTime: Infinity,
  });

  const handleCardImageSizeChange = async (newSize: string | null) => {
    if (!newSize) return;
    const parsedSize = parseInt(newSize, 10);
    if (isNaN(parsedSize)) return;
    await saveCardImageSize(parsedSize);
    await storeQuery.refetch();
  };

  return {
    loading: storeQuery.isFetching || storeQuery.isPending || storeQuery.isLoading,
    cardImageSize: storeQuery.data,
    handleCardImageSizeChange,
  };
};