import { QueryCache, QueryClient } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';

export const createQueryClient = () => {
  const client = new QueryClient({
    queryCache: new QueryCache({
      onError: (_error, query) => {
        if (query.queryKey[0] !== queryKeys.authCheck[0]) {
          void client.invalidateQueries({ queryKey: queryKeys.authCheck });
        }
      },
    }),
  });
  return client;
};
