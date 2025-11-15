/*
 * Copyright (C) 2025 pluslatte
 * This file is part of vrc-avatar-switcher.
 *
 * vrc-avatar-switcher is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * 
 * vrc-avatar-switcher is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with vrc-avatar-switcher. If not, see <https://www.gnu.org/licenses/>. 
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