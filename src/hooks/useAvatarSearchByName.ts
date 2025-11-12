import { useDeferredValue, useState } from 'react';

interface AvatarSearchQuery {
    value: string;
    deferredValue: string;
    set: (value: string) => void;
}
export const useAvatarSearchByName = (): AvatarSearchQuery => {
    const [queryString, setQueryString] = useState<string>('');
    const deferredQueryString = useDeferredValue(queryString);
    return {
        value: queryString,
        deferredValue: deferredQueryString,
        set: setQueryString,
    };
};