import { useDeferredValue, useState } from 'react';

interface AvatarSearchQuery {
    deferredValue: string;
    set: (value: string) => void;
}
export const useAvatarSearchByName = (): AvatarSearchQuery => {
    const [queryString, setQueryString] = useState<string>('');
    const deferredQueryString = useDeferredValue(queryString);
    return {
        deferredValue: deferredQueryString,
        set: setQueryString,
    };
};