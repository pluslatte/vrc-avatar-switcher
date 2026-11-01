import { QueryKey, useQuery } from '@tanstack/react-query';

export const useStoredSetting = <T,>(
  queryKey: QueryKey,
  load: () => Promise<T>,
  save: (value: T) => Promise<void>,
) => {
  const query = useQuery({ queryKey, queryFn: load, staleTime: Infinity });

  const setValue = async (value: T) => {
    await save(value);
    await query.refetch();
  };

  return {
    loading: query.isFetching || query.isPending,
    value: query.data,
    setValue,
  };
};
