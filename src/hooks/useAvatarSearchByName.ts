import { useState } from 'react';

interface AvatarSearchQuery {
    avatarSearchQueryValue: string;
    setAvatarSearchQueryValue: (value: string) => void;
}
export const useAvatarSearchByName = (): AvatarSearchQuery => {
    const [queryString, setQueryString] = useState<string>('');
    return {
        avatarSearchQueryValue: queryString,
        setAvatarSearchQueryValue: setQueryString,
    };
};