import { Grid, Indicator } from '@mantine/core';
import AvatarCard from './AvatarCard';
import { Avatar, CurrentUser } from '@/lib/models';
import { useQuery } from '@tanstack/react-query';
import { fetchAvatarsTags } from '@/lib/db';
import { LoaderFullWindow } from '../LoaderFullWindow';

interface AvatarListProps {
  avatars: Array<Avatar>;
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
  const tagQuery = useQuery({
    queryKey: ['tags', props.currentUser.id, props.avatars.map(a => a.id)],
    queryFn: () => fetchAvatarsTags(props.avatars.map(a => a.id), props.currentUser.id),
  });

  if (tagQuery.isLoading) {
    return <LoaderFullWindow message="タグ情報を読み込み中..." withAppShell={true} />;
  }
  if (tagQuery.isError || tagQuery.data === undefined) {
    return <div>タグ情報の読み込みに失敗しました。</div>;
  }

  const filteredAvatars = props.avatars.filter(avatar => {
    if (props.selectedTags.length === 0) {
      return true;
    }
    const tags = tagQuery.data[avatar.id] || [];
    return props.selectedTags.every(tag => tags.some(t => t.display_name === tag));
  });

  return (
    <Grid overflow="hidden" gutter="lg">
      {filteredAvatars.map(avatar => {
        const isActive = props.currentUser.currentAvatar === avatar.id;
        const card = (
          <AvatarCard
            avatar={avatar}
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