import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppIcon from '@components/AppIcon';
import { C, FONT } from './theme';
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
    <View style={[s.card, item.isUnread && s.cardUnread]}>
      <AppIcon name={item.icon} size={22} color={item.iconColor} bg={item.iconBg} containerSize={44} borderRadius={12} />
      <View style={s.cardContent}>
        <View style={s.cardTitleRow}>
          <Text style={[s.cardTitle, item.isUnread && s.cardTitleUnread]} numberOfLines={1}>{item.title}</Text>
          {item.isUnread && <View style={s.unreadDot} />}
        </View>
        {item.subtitle ? (
          <Text style={s.cardSubtitle} numberOfLines={2}>{item.subtitle}</Text>
        ) : null}
        <Text style={s.cardTime}>{item.time}</Text>
      </View>
    </View>
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
    <View style={s.container}>
      <View style={s.appBar}>
        <TouchableOpacity onPress={() => props.navigation?.goBack()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={s.appBarTitle}>Notificaciones</Text>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={markAllRead} style={s.markAllBtn}>
            <Text style={s.markAllText}>Marcar leídas</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 90 }} />
        )}
      </View>

      {isLoading && notifications.length === 0 ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={C.orange} />
        </View>
      ) : notifications.length === 0 ? (
        <View style={s.center}>
          <AppIcon name="notifications-off-outline" size={40} color={C.gray50} bg={C.brand10} containerSize={72} borderRadius={36} />
          <Text style={s.emptyTitle}>Sin notificaciones</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={s.listContent}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          renderItem={({ item }) => <NotificationCard item={item} />}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={isLoading ? <ActivityIndicator size="small" color={C.orange} style={{ marginVertical: 16 }} /> : null}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  appBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 48, paddingBottom: 12, backgroundColor: C.surface },
  backBtn: { padding: 4 },
  appBarTitle: { fontSize: 18, fontFamily: FONT.bold, color: C.white },
  markAllBtn: { backgroundColor: C.surfaceLight, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  markAllText: { fontSize: 12, color: C.orange, fontFamily: FONT.medium },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyTitle: { fontSize: 16, fontFamily: FONT.semiBold, color: C.gray40 },
  listContent: { padding: 20 },
  card: { flexDirection: 'row', padding: 14, backgroundColor: C.bg, borderRadius: 14 },
  cardUnread: { backgroundColor: C.gray80, borderWidth: 0.5, borderColor: C.surfaceLight },
  cardContent: { flex: 1, marginLeft: 14 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { flex: 1, fontSize: 14, fontFamily: FONT.regular, color: C.white },
  cardTitleUnread: { fontFamily: FONT.semiBold },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.orange, marginLeft: 8 },
  cardSubtitle: { fontSize: 12, color: C.gray30, marginTop: 4 },
  cardTime: { fontSize: 11, color: C.gray50, marginTop: 4 },
});
