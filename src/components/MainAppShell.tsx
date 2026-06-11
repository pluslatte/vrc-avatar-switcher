import AvatarList from '@/components/avatar/AvatarList';
import { AppShell, LoadingOverlay, ScrollArea } from '@mantine/core';
import HeaderContents from '@/components/header/HeaderContents';
import { LoaderFullWindow } from '@/components/LoaderFullWindow';
import FooterContents from '@/components/footer/FooterContents';
import { useAvatarListQuery } from '@/hooks/useAvatarListQuery';
import { useSwitchAvatarMutation } from '@/hooks/useSwitchAvatarMutation';
import { useAvailableTagsQuery } from '@/hooks/useAvailableTagsQuery';
import { useTagAvatarsRelationQuery } from '@/hooks/useTagAvatarsRelationQuery';
import {
  useAvatarSortOrderSetting,
  useCardImageSizeSetting,
  useCardNumberPerRowSetting,
} from '@/hooks/useClientSettings';
import { isAvatarSortOrder } from '@/lib/models';
import { useState } from 'react';
import { useAvatarSearchByName } from '@/hooks/useAvatarSearchByName';

interface MainAppShellProps {
  onLogoutSuccess: () => void;
}
const MainAppShell = (props: MainAppShellProps) => {
  const { avatarSortOrder, setAvatarSortOrder } = useAvatarSortOrderSetting();
  const avatarListQuery = useAvatarListQuery(avatarSortOrder);
  const switchAvatarMutation = useSwitchAvatarMutation(avatarSortOrder);

  const currentUserId = avatarListQuery.data?.currentUser.id;
  const availableTagsQuery = useAvailableTagsQuery(currentUserId);
  const tagAvatarsRelationQuery = useTagAvatarsRelationQuery(
    currentUserId,
    avatarListQuery.data?.avatars.map(avatar => avatar.id) ?? [],
  );

  const { cardImageSizeLoading, cardImageSize, setCardImageSize } = useCardImageSizeSetting();
  const { cardNumberPerRowLoading, cardNumberPerRow, setCardNumberPerRow } = useCardNumberPerRowSetting();
  const { avatarSearchQueryValueDeferred, setAvatarSearchQueryValue } = useAvatarSearchByName();
  const [selectedTags, setSelectedTags] = useState<Array<string>>([]);

  const handleSortOrderChange = (option: string | null) => {
    if (isAvatarSortOrder(option)) {
      void setAvatarSortOrder(option);
    }
  };

  if (avatarListQuery.isPending || avatarListQuery.isFetching) return <LoaderFullWindow message="アバターを読み込んでいます..." />;
  if (avatarListQuery.isError) return (<div>Error AvatarList: {avatarListQuery.error.message}</div>);
  if (avatarSortOrder === undefined) return <div>Error AvatarSortOrder: avatarSortOrder is undefined</div>;

  const { avatars, currentUser } = avatarListQuery.data;

  return (
    <AppShell
      padding="md"
      header={{ height: 60 }}
      footer={{ height: 60 }}
    >
      <AppShell.Header>
        <HeaderContents
          currentUserDisplayName={currentUser.displayName}
          currentUserThumbnailImageUrl={currentUser.currentAvatarThumbnailImageUrl}
          currentUserAvatarName={avatars.find(avatar => avatar.id === currentUser.currentAvatar)?.name || 'No Avatar'}
        />
      </AppShell.Header>

      <AppShell.Main>
        {(cardImageSize === undefined || cardNumberPerRow === undefined) ? (
          <LoaderFullWindow message="設定を読み込んでいます..." />
        ) : (
          <AvatarList
            avatars={avatars}
            tagAvatarRelation={tagAvatarsRelationQuery.data}
            tagAvatarRelationLoading={tagAvatarsRelationQuery.isPending}
            currentUser={currentUser}
            pendingSwitch={switchAvatarMutation.isPending}
            searchQuery={avatarSearchQueryValueDeferred}
            cardImageSize={cardImageSize}
            cardNumberPerRow={cardNumberPerRow}
            selectedTags={selectedTags}
            handlerAvatarSwitch={switchAvatarMutation.mutate}
          />
        )}
      </AppShell.Main>

      <AppShell.Footer>
        <ScrollArea h="100%">
          <LoadingOverlay visible={availableTagsQuery.isPending} overlayProps={{ radius: 'md', blur: 2 }} />
          {availableTagsQuery.data !== undefined && (
            <FooterContents
              currentUserId={currentUser.id}
              selectedSort={avatarSortOrder}
              updateAvatarSearchInputString={setAvatarSearchQueryValue}
              cardImageSize={cardImageSize}
              cardImageSizeLoading={cardImageSizeLoading}
              cardNumberPerRow={cardNumberPerRow}
              cardNumberPerRowLoading={cardNumberPerRowLoading}
              availableTags={availableTagsQuery.data}
              setCardImageSize={setCardImageSize}
              setCardNumberPerRow={setCardNumberPerRow}
              onSortSettingChange={handleSortOrderChange}
              onTagFilterChange={setSelectedTags}
              onLogoutSuccess={props.onLogoutSuccess}
            />
          )}
        </ScrollArea>
      </AppShell.Footer>

    </AppShell>
  );
};

export default MainAppShell;
