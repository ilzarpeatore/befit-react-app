import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, FONT } from './theme';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';

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

export default function SubscriptionDetailScreen(props: any) {
  const [planList, setPlanList] = useState<any[]>([]);
  const [select, setSelect] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [numPage, setNumPage] = useState(1);
  const [isLastPage, setIsLastPage] = useState(false);
  const scrollRef = useRef<FlatList>(null);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    getSubscriptionList();
  };

  const getSubscriptionList = async () => {
    setIsLoading(true);
    try {
      // const value = await getSubScriptionPlanList({ page });
      // setNumPage(value.pagination.totalPages);
      // if (page === 1) setPlanList([]);
      // setPlanList(prev => [...prev, ...value.data]);
      setIsLoading(false);
    } catch (e) {
      setIsLastPage(true);
      setIsLoading(false);
    }
  };

  const cancelPackage = async (id?: number) => {
    setIsLoading(true);
    const req = { id };
    try {
      // await cancelPlanApi(req);
      // await getUSerDetail(...);
      setIsLoading(false);
      props.navigation.goBack();
    } catch (e) {
      setIsLoading(false);
    }
  };

  const getTextColor = (state?: string) => STATUS_COLORS[state || ''] || C.gray80;
  const getBgColor = (state?: string) => STATUS_BG_COLORS[state || ''] || 'rgba(0,0,0,0)';

  const renderActiveSubscription = () => {
    // Simplified: if no active subscription, show empty state
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
  };

  const renderPlanItem = ({ item }: { item: any }) => {
    if (item.status !== 'inactive') return null;
    return (
      <View style={[styles.historyCard, { borderLeftColor: getTextColor(item.status) }]}>
        <View style={styles.historyRow}>
          <Text style={styles.historyPlanName}>{item.name || ''}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getBgColor(item.status) }]}>
            <Text style={[styles.statusText, { color: getTextColor(item.status) }]}>
              {item.status || ''}
            </Text>
          </View>
        </View>
        <Text style={styles.historyDate}>Duration: {item.duration} {item.durationUnit || ''}</Text>
        <Text style={styles.historyPrice}>Price: ${item.price?.toFixed(2) || '0.00'}</Text>
      </View>
    );
  };

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
          <Text style={[styles.tabText, select && styles.tabTextActive]}>Active Plan</Text>
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
          renderActiveSubscription()
        ) : planList.length > 0 ? (
          <FlatList
            ref={scrollRef}
            data={planList}
            keyExtractor={(item, i) => String(item.id || i)}
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
            <ActivityIndicator size="large" color={C.brand5} />
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
  tabTextActive: { color: C.brand5, fontFamily: FONT.semiBold },
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
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
