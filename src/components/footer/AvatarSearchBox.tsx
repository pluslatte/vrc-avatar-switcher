import { TextInput } from '@mantine/core';

interface AvatarSearchBoxProps {
    onChange: (value: string) => void;
}
const AvatarSearchBox = (props: AvatarSearchBoxProps) => {
    return (
        <TextInput
            placeholder="アバター名で絞り込み"
            onChange={(event) => props.onChange(event.currentTarget.value)}
        />
    );
};

export default AvatarSearchBox;