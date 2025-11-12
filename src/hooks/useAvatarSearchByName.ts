import { useDeferredValue, useState } from 'react';

interface AvatarSearchQuery {
    avatarSearchQueryValueDeferred: string;
    setAvatarSearchQueryValue: (value: string) => void;
}
export const useAvatarSearchByName = (): AvatarSearchQuery => {
    const [queryString, setQueryString] = useState<string>('');
    const deferredQueryString = useDeferredValue(queryString);
    return {
        avatarSearchQueryValueDeferred: deferredQueryString,
        setAvatarSearchQueryValue: setQueryString,
    };
};