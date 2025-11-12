import { TextInput } from '@mantine/core';

interface AvatarSearchBoxProps {
    updateInputString: (value: string) => void;
}
const AvatarSearchBox = (props: AvatarSearchBoxProps) => {
    return (
        <TextInput
            placeholder="アバター名で絞り込み"
            onChange={(event) => props.updateInputString(event.currentTarget.value)}
        />
    );
};

export default AvatarSearchBox;