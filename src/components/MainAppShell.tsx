import AvatarList from '@/components/avatar/AvatarList';
import { Alert, AppShell, Button, Center, LoadingOverlay, ScrollArea, Stack, Text } from '@mantine/core';
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
import { AuthStatus } from '@/lib/authStatus';

export interface MainAppShellProps {
  authStatus: AuthStatus;
  onLoginClick: () => void;
  onLogoutSuccess: () => void;
}
const MainAppShell = (props: MainAppShellProps) => {
  const isAuthenticated = props.authStatus === 'authenticated';
  const { avatarSortOrder, setAvatarSortOrder } = useAvatarSortOrderSetting();
  const avatarListQuery = useAvatarListQuery(avatarSortOrder, isAuthenticated);
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

  const avatars = avatarListQuery.data?.avatars ?? [];
  const currentUser = avatarListQuery.data?.currentUser;
  const currentUserAvatarName = currentUser
    ? avatars.find(avatar => avatar.id === currentUser.currentAvatar)?.name || 'No Avatar'
    : '未取得';

  return (
    <AppShell
      padding="md"
      header={{ height: 60 }}
      footer={{ height: 60 }}
    >
      <AppShell.Header>
        <HeaderContents
          authStatus={props.authStatus}
          currentUserDisplayName={currentUser?.displayName ?? 'ユーザー未取得'}
          currentUserThumbnailImageUrl={currentUser?.currentAvatarThumbnailImageUrl}
          currentUserAvatarName={currentUserAvatarName}
        />
      </AppShell.Header>

      <AppShell.Main>
        {props.authStatus === 'checking' ? (
          <LoaderFullWindow message="認証状態を確認しています..." withAppShell={true} />
        ) : !isAuthenticated ? (
          <Center h="100%">
            <Stack align="center" gap="md">
              <Text c="dimmed">
                {props.authStatus === 'needs-reauth'
                  ? 'セッションの有効期限が切れています。再ログインしてください。'
                  : 'VRChat にログインすると、アバター一覧が表示されます。'}
              </Text>
              <Button onClick={props.onLoginClick}>
                {props.authStatus === 'needs-reauth' ? '再ログイン' : 'ログイン'}
              </Button>
            </Stack>
          </Center>
        ) : avatarSortOrder === undefined ? (
          <LoaderFullWindow message="設定を読み込んでいます..." withAppShell={true} />
        ) : avatarListQuery.isPending || avatarListQuery.isFetching ? (
          <LoaderFullWindow message="アバターを読み込んでいます..." withAppShell={true} />
        ) : avatarListQuery.isError ? (
          <Alert color="red" title="アバター一覧を読み込めませんでした">
            {avatarListQuery.error.message}
          </Alert>
        ) : currentUser === undefined ? (
          <Alert color="red" title="アバター一覧を読み込めませんでした">
            ユーザー情報を取得できませんでした。
          </Alert>
        ) : (cardImageSize === undefined || cardNumberPerRow === undefined) ? (
          <LoaderFullWindow message="設定を読み込んでいます..." withAppShell={true} />
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
          <LoadingOverlay visible={isAuthenticated && availableTagsQuery.isPending} overlayProps={{ radius: 'md', blur: 2 }} />
          {currentUser !== undefined && avatarSortOrder !== undefined && availableTagsQuery.data !== undefined && (
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
