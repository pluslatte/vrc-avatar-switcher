import { useState, useEffect } from 'react';

export interface AvatarSearchQuery {
    value: string;
    debouncedValue: string;
    set: (value: string) => void;
}
export const useAvatarSearchByName = (debounceMs: number = 300): AvatarSearchQuery => {
    const [queryString, setQueryString] = useState<string>('');
    const [debouncedQueryString, setDebouncedQueryString] = useState<string>('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQueryString(queryString);
        }, debounceMs);

        return () => {
            clearTimeout(timer);
        };
    }, [queryString, debounceMs]);

    return {
        value: queryString,
        debouncedValue: debouncedQueryString,
        set: setQueryString,
    };
};