import { TextInput } from '@mantine/core';
import { AvatarSearchQuery } from '@/hooks/useAvatarSearchByName';

interface AvatarSearchBoxProps {
    avatarSearchQuery: AvatarSearchQuery;
}
const AvatarSearchBox = (props: AvatarSearchBoxProps) => {
    return (
        <TextInput
            placeholder="アバター名で絞り込み"
            value={props.avatarSearchQuery.value}
            onChange={(event) => props.avatarSearchQuery.set(event.currentTarget.value)}
        />
    );
};

export default AvatarSearchBox;