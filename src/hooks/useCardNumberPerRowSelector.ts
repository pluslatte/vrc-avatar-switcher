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

import { loadCardNumberPerRow, saveCardNumberPerRow } from '@/lib/db';
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
    await storeQuery.refetch();
  };

  return {
    loading: storeQuery.isFetching || storeQuery.isPending || storeQuery.isLoading,
    cardNumberPerRow: storeQuery.data,
    handleCardNumberPerRow,
  };
};