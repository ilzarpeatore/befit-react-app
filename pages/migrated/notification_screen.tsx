import React, { useState, useEffect, useCallback } from 'react';
import { ActivityIndicator, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Box } from '@components/ui/box';
import { Text } from '@components/ui/text';
import { Heading } from '@components/ui/heading';
import { VStack } from '@components/ui/vstack';
import { Button, ButtonText } from '@components/ui/button';
import { Icon } from '@components/ui/icon';
import AppIcon from '@components/AppIcon';
import { C } from './theme';
import { notificationsApi, NotificationItem } from '../../api/notifications';

interface DisplayNotification {
  id: number;
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  time: string;
  isUnread: boolean;
  image?: string | null;
}

const ICON_MAP: Record<string, { icon: keyof typeof Ionicons.glyphMap; bg: string; color: string }> = {
  push_notification: { icon: 'notifications', bg: C.destructive5, color: C.orange },
  workout_reminder: { icon: 'barbell', bg: C.destructive5, color: C.orange },
  goal_achieved: { icon: 'trophy', bg: C.success5, color: C.success },
  water_reminder: { icon: 'water', bg: C.blue5, color: C.blue },
  subscription: { icon: 'star', bg: C.warning5, color: C.warning },
};

function mapNotification(item: NotificationItem): DisplayNotification {
  const payload = item.data ?? {};
  const typeKey = payload.type ?? 'push_notification';
  const mapped = ICON_MAP[typeKey] ?? ICON_MAP.push_notification;

  return {
    id: item.id,
    icon: mapped.icon,
    iconBg: mapped.bg,
    iconColor: mapped.color,
    title: payload.title ?? payload.message ?? 'Notificación',
    subtitle: payload.description ?? payload.body ?? '',
    time: item.created_at ?? '',
    isUnread: !item.read_at,
    image: item.image,
  };
}

function NotificationCard({ item }: { item: DisplayNotification }) {
  return (
    <Box className={`flex-row gap-3.5 p-3.5 rounded-sm ${item.isUnread ? 'bg-secondary border border-border' : 'bg-background'}`}>
      <AppIcon name={item.icon} size={22} color={item.iconColor} bg={item.iconBg} containerSize={44} borderRadius={12} />
      <Box className="flex-1">
        <VStack space="xs">
          <Box className="flex-row items-center gap-2">
            <Text
              size="sm"
              weight={item.isUnread ? 'semibold' : 'regular'}
              className="flex-1 text-foreground"
              numberOfLines={1}
            >
              {item.title}
            </Text>
            {item.isUnread && <Box className="w-2 h-2 rounded-pill bg-warning" />}
          </Box>
          {item.subtitle ? (
            <Text size="xs" muted numberOfLines={2}>{item.subtitle}</Text>
          ) : null}
          <Text size="xs" muted className="text-[11px]">{item.time}</Text>
        </VStack>
      </Box>
    </Box>
  );
}

export default function NotificationScreen(props: any) {
  const [notifications, setNotifications] = useState<DisplayNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  const loadNotifications = useCallback(async (p: number = 1) => {
    try {
      const res = await notificationsApi.getList(p);
      const data = res.data;
      const items = (data.notification_data ?? []).map(mapNotification);
      if (p === 1) {
        setNotifications(items);
      } else {
        setNotifications(prev => [...prev, ...items]);
      }
      setUnreadCount(data.all_unread_count ?? 0);
    } catch {
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications(1);
  }, [loadNotifications]);

  const markAllRead = async () => {
    try {
      const res = await notificationsApi.markAllRead();
      setUnreadCount(res.data.all_unread_count ?? 0);
      setNotifications(prev => prev.map(n => ({ ...n, isUnread: false })));
    } catch {
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadNotifications(nextPage);
  };

  return (
    <Box className="flex-1 bg-background">
      <Box style={{ paddingTop: 48, paddingBottom: 12 }} className="flex-row items-center justify-between px-4 bg-card">
        <Button variant="ghost" size="icon" onPress={() => props.navigation?.goBack()}>
          <Icon name="chevron-back" size={24} className="text-foreground" />
        </Button>
        <Heading size="sm">Notificaciones</Heading>
        {unreadCount > 0 ? (
          <Button variant="secondary" size="sm" onPress={markAllRead}>
            <ButtonText className="text-warning">Marcar leídas</ButtonText>
          </Button>
        ) : (
          <Box style={{ width: 90 }} />
        )}
      </Box>

      {isLoading && notifications.length === 0 ? (
        <Box className="flex-1 items-center justify-center gap-3">
          <ActivityIndicator size="large" color={C.orange} />
        </Box>
      ) : notifications.length === 0 ? (
        <Box className="flex-1 items-center justify-center gap-3">
          <AppIcon name="notifications-off-outline" size={40} color={C.gray50} bg={C.brand10} containerSize={72} borderRadius={36} />
          <Text weight="semibold" muted>Sin notificaciones</Text>
        </Box>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 20 }}
          ItemSeparatorComponent={() => <Box className="h-2" />}
          renderItem={({ item }) => <NotificationCard item={item} />}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={isLoading ? (
            <Box className="my-4">
              <ActivityIndicator size="small" color={C.orange} />
            </Box>
          ) : null}
        />
      )}
    </Box>
  );
}
