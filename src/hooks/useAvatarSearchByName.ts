import { useState } from 'react';

export interface AvatarSearchQuery {
    value: string;
    set: (value: string) => void;
}
export const useAvatarSearchByName = (): AvatarSearchQuery => {
    const [queryString, setQueryString] = useState<string>('');
    return {
        value: queryString,
        set: setQueryString,
    };
};