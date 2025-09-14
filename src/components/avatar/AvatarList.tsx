import { Grid, Indicator } from '@mantine/core';
import AvatarCard from './AvatarCard';
import { Avatar, CurrentUser } from '@/lib/models';
import { LoaderFullWindow } from '../LoaderFullWindow';
import { avatarTagSearchfilterAvatars } from '@/lib/utils';

interface AvatarListProps {
  avatars: Array<Avatar>;
  tagAvatarRelation: Record<string, Array<{ display_name: string; color: string }>> | undefined;
  tagAvatarRelationLoading: boolean;
  currentUser: CurrentUser;
  pendingSwitch: boolean;
  cardImageSize: number;
  cardNumberPerRow: number;
  selectedTags: Array<string>;
  handlerAvatarSwitch: (avatarId: string) => void;
  handlerRegisterAvatarTag: (tagName: string, currentUserId: string, avatarId: string, color: string) => Promise<void>;
  handlerRemoveAvatarTag: (tagName: string, avatarId: string, currentUserId: string) => Promise<void>;
}
const AvatarList = (props: AvatarListProps) => {

  const filteredAvatars = avatarTagSearchfilterAvatars(
    props.avatars,
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
        const card = (
          <AvatarCard
            avatar={avatar}
            avatarTags={props.tagAvatarRelation[avatar.id] || []}
            currentUser={props.currentUser}
            isActiveAvatar={isActive}
            pendingSwitch={props.pendingSwitch}
            imageSize={props.cardImageSize}
            selectedTags={props.selectedTags}
            onAvatarSwitchClicked={props.handlerAvatarSwitch}
            handlerRegisterAvatarTag={props.handlerRegisterAvatarTag}
            handlerRemoveAvatarTag={props.handlerRemoveAvatarTag}
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

export default AvatarList;