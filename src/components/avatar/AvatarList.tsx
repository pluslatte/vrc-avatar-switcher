import { Grid, Indicator } from '@mantine/core';
import AvatarCard from './AvatarCard';
import { Avatar, CurrentUser } from '@/lib/models';
import { LoaderFullWindow } from '../LoaderFullWindow';
import { avatarNameSearchFilterAvatars, avatarTagSearchFilterAvatars } from '@/lib/utils';
import { useTagAvatarsRelationMutation } from '@/hooks/useTagAvatarsRelationMutation';
import { memo } from 'react';

interface AvatarListProps {
  avatars: Array<Avatar>;
  tagAvatarRelation: Record<string, Array<{ display_name: string; color: string }>> | undefined;
  tagAvatarRelationLoading: boolean;
  currentUser: CurrentUser;
  pendingSwitch: boolean;
  searchQuery: string;
  cardImageSize: number;
  cardNumberPerRow: number;
  selectedTags: Array<string>;
  handlerAvatarSwitch: (avatarId: string) => void;
}
const AvatarListComponent = (props: AvatarListProps) => {

  const { removeTagAvatarsRelation } = useTagAvatarsRelationMutation(props.avatars);

  const filteredAvatars = avatarTagSearchFilterAvatars(
    avatarNameSearchFilterAvatars(props.avatars, props.searchQuery),
    props.selectedTags,
    props.tagAvatarRelation
  );

  if (props.tagAvatarRelationLoading) return <LoaderFullWindow message="タグ情報を読み込み中..." withAppShell={true} />;
  if (props.tagAvatarRelation === undefined) return <div>タグ情報の読み込みに失敗しました。</div>;

  return (
    <Grid overflow="hidden" gutter="lg">
      {filteredAvatars.map(avatar => {
        if (props.tagAvatarRelation === undefined) return null;
        const isActive = props.currentUser.currentAvatar === avatar.id;
        const avatarTags = props.tagAvatarRelation[avatar.id] ?? [];
        const card = (
          <AvatarCard
            avatar={avatar}
            avatars={props.avatars}
            avatarTags={avatarTags}
            currentUser={props.currentUser}
            isActiveAvatar={isActive}
            pendingSwitch={props.pendingSwitch}
            imageSize={props.cardImageSize}
            onAvatarSwitchClicked={props.handlerAvatarSwitch}
            onTagRemove={removeTagAvatarsRelation}
          />
        );
        return (
          <Grid.Col span={props.cardNumberPerRow} key={avatar.id}>
            {isActive ? (
              <Indicator
                processing
                color="green"
                size={16}
                offset={16}
                withBorder
                position="top-start"
              >
                {card}
              </Indicator>
            ) : (
              card
            )}
          </Grid.Col>
        );
      })}
    </Grid>
  );
};

const AvatarList = memo(AvatarListComponent);

export default AvatarList;