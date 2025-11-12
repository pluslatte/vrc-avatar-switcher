import { TextInput } from '@mantine/core';

interface AvatarSearchBoxProps {
    inputString: string;
    updateInputString: (value: string) => void;
}
const AvatarSearchBox = (props: AvatarSearchBoxProps) => {
    return (
        <TextInput
            placeholder="アバター名で絞り込み"
            value={props.inputString}
            onChange={(event) => props.updateInputString(event.currentTarget.value)}
        />
    );
};

export default AvatarSearchBox;