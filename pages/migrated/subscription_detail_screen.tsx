import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, FONT } from './theme';
import { subscriptionApi, SubscriptionPlanItem } from '../../api/subscription';
import { useAuth } from '../../store/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const STATUS_COLORS: Record<string, string> = {
  active: C.success,
  inactive: C.gray30,
  cancelled: C.destructive,
  expired: C.warning,
};

const STATUS_BG_COLORS: Record<string, string> = {
  active: C.success10,
  inactive: 'rgba(158,158,158,0.10)',
  cancelled: C.destructive10,
  expired: 'rgba(255,193,7,0.5)',
};

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString();
}

export default function SubscriptionDetailScreen(props: any) {
  const { state } = useAuth();
  const isPersonalClient = !!state.user?.is_personal_client;
  const [planList, setPlanList] = useState<SubscriptionPlanItem[]>([]);
  const [select, setSelect] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const getSubscriptionList = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await subscriptionApi.getSubscriptionPlanList();
      setPlanList(res.data?.data || []);
    } catch (e) {
      console.log('Failed to load subscriptions', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Cliente 1:1 ya tiene acceso completo por is_personal_client — no compra
    // Packages, no hace falta pedir el listado de suscripciones.
    if (!isPersonalClient) {
      getSubscriptionList();
    }
  }, [getSubscriptionList, isPersonalClient]);

  const cancelPackage = (id: number) => {
    Alert.alert('Cancel subscription', 'Are you sure you want to cancel this plan?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, cancel',
        style: 'destructive',
        onPress: async () => {
          setCancellingId(id);
          try {
            await subscriptionApi.cancel(id);
            getSubscriptionList();
          } catch (e) {
            console.log('Failed to cancel subscription', e);
          } finally {
            setCancellingId(null);
          }
        },
      },
    ]);
  };

  const getTextColor = (state?: string) => STATUS_COLORS[state || ''] || C.gray80;
  const getBgColor = (state?: string) => STATUS_BG_COLORS[state || ''] || 'rgba(0,0,0,0)';

  // Un cliente free puede tener varios Package activos en paralelo
  // (decisión de producto, 2026-07-30) — esta pestaña lista todos, no solo uno.
  const activePlans = planList.filter(p => p.status === 'active');
  const historyPlans = planList.filter(p => p.status !== 'active');

  const renderActivePlanCard = (item: SubscriptionPlanItem) => (
    <View key={item.id} style={[styles.historyCard, { borderLeftColor: getTextColor(item.status) }]}>
      <View style={styles.historyRow}>
        <Text style={styles.historyPlanName}>{item.package_name || ''}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getBgColor(item.status) }]}>
          <Text style={[styles.statusText, { color: getTextColor(item.status) }]}>{item.status || ''}</Text>
        </View>
      </View>
      <Text style={styles.historyDate}>From {formatDate(item.subscription_start_date)} to {formatDate(item.subscription_end_date)}</Text>
      <Text style={styles.historyPrice}>Price: ${Number(item.total_amount ?? 0).toFixed(2)}</Text>
      <TouchableOpacity
        style={styles.cancelBtn}
        disabled={cancellingId === item.id}
        onPress={() => cancelPackage(item.id)}
      >
        <Text style={styles.cancelBtnText}>{cancellingId === item.id ? 'Cancelling…' : 'Cancel plan'}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderActiveSubscriptions = () => {
    if (activePlans.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No active subscription</Text>
          <Text style={styles.emptySubtitle}>View our plans to get started.</Text>
          <TouchableOpacity
            style={styles.viewPlansButton}
            onPress={() => props.navigation.navigate('MigratedSubscribe')}
          >
            <Text style={styles.viewPlansText}>View Plans</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <FlatList
        data={activePlans}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => renderActivePlanCard(item)}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  const renderPlanItem = ({ item }: { item: SubscriptionPlanItem }) => (
    <View style={[styles.historyCard, { borderLeftColor: getTextColor(item.status) }]}>
      <View style={styles.historyRow}>
        <Text style={styles.historyPlanName}>{item.package_name || ''}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getBgColor(item.status) }]}>
          <Text style={[styles.statusText, { color: getTextColor(item.status) }]}>{item.status || ''}</Text>
        </View>
      </View>
      <Text style={styles.historyDate}>From {formatDate(item.subscription_start_date)} to {formatDate(item.subscription_end_date)}</Text>
      <Text style={styles.historyPrice}>Price: ${Number(item.total_amount ?? 0).toFixed(2)}</Text>
    </View>
  );

  if (isPersonalClient) {
    return (
      <View style={styles.container}>
        <View style={styles.appBar}>
          <TouchableOpacity onPress={() => props.navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={C.white} />
          </TouchableOpacity>
          <Text style={styles.appBarTitle}>Programas</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="checkmark-circle" size={56} color={C.success} style={{ marginBottom: 16 }} />
          <Text style={styles.emptyTitle}>Ya tienes acceso completo</Text>
          <Text style={styles.emptySubtitle}>
            Como cliente de entrenamiento personal 1:1 tienes acceso a todo el contenido — programas,
            workouts y recetas — sin necesidad de comprar ningún paquete.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => props.navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={C.white} />
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>Subscription Plans</Text>
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, select && styles.tabActive]}
          onPress={() => setSelect(true)}
        >
          <Text style={[styles.tabText, select && styles.tabTextActive]}>Active Plans{activePlans.length > 0 ? ` (${activePlans.length})` : ''}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, !select && styles.tabActive]}
          onPress={() => setSelect(false)}
        >
          <Text style={[styles.tabText, !select && styles.tabTextActive]}>History</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }}>
        {select ? (
          renderActiveSubscriptions()
        ) : historyPlans.length > 0 ? (
          <FlatList
            data={historyPlans}
            keyExtractor={item => String(item.id)}
            renderItem={renderPlanItem}
            contentContainerStyle={{ padding: 16 }}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No subscription history</Text>
          </View>
        )}

        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={C.orange} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    gap: 12,
  },
  appBarTitle: { fontSize: 20, fontFamily: FONT.bold, color: C.white },
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: C.brand5,
  },
  tabText: { fontSize: 15, fontFamily: FONT.regular, color: C.gray30 },
  tabTextActive: { color: C.textPrimary, fontFamily: FONT.semiBold },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  emptyTitle: { fontSize: 16, fontFamily: FONT.bold, color: C.gray30, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: C.gray40, fontFamily: FONT.regular, marginBottom: 50, textAlign: 'center' },
  viewPlansButton: {
    backgroundColor: C.brand5,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 40,
  },
  viewPlansText: { fontSize: 16, fontFamily: FONT.bold, color: C.white },
  historyCard: {
    backgroundColor: C.surfaceLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  historyPlanName: { fontSize: 16, fontFamily: FONT.bold, color: C.white, flex: 1 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 12, fontFamily: FONT.semiBold },
  historyDate: { fontSize: 13, color: C.gray30, fontFamily: FONT.regular, marginBottom: 4 },
  historyPrice: { fontSize: 13, color: C.gray30, fontFamily: FONT.regular },
  cancelBtn: { marginTop: 12, alignSelf: 'flex-start' },
  cancelBtnText: { fontSize: 13, fontFamily: FONT.semiBold, color: C.destructive },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
