import { Grid, Indicator } from '@mantine/core';
import AvatarCard from './AvatarCard';
import { Avatar, CurrentUser } from '@/lib/models';
import { LoaderFullWindow } from '../LoaderFullWindow';
import { avatarNameSearchFilterAvatars, avatarTagSearchFilterAvatars } from '@/lib/utils';
import { useMemo } from 'react';

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
const AvatarList = (props: AvatarListProps) => {

  if (props.tagAvatarRelationLoading) return <LoaderFullWindow message="タグ情報を読み込み中..." withAppShell={true} />;
  if (props.tagAvatarRelation === undefined) return <div>タグ情報の読み込みに失敗しました。</div>;

  const filteredAvatars = useMemo(() => {
    return avatarTagSearchFilterAvatars(
      avatarNameSearchFilterAvatars(props.avatars, props.searchQuery),
      props.selectedTags,
      props.tagAvatarRelation
    );
  }, [props.avatars, props.searchQuery, props.selectedTags, props.tagAvatarRelation]);

  return (
    <Grid overflow="hidden" gutter="lg">
      {filteredAvatars.map(avatar => {
        if (props.tagAvatarRelation === undefined) return null;
        const isActive = props.currentUser.currentAvatar === avatar.id;
        const card = (
          <AvatarCard
            avatar={avatar}
            avatars={props.avatars}
            avatarTags={props.tagAvatarRelation[avatar.id] || []}
            currentUser={props.currentUser}
            isActiveAvatar={isActive}
            pendingSwitch={props.pendingSwitch}
            imageSize={props.cardImageSize}
            selectedTags={props.selectedTags}
            onAvatarSwitchClicked={props.handlerAvatarSwitch}
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