import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, FONT } from './theme';
import { subscriptionApi, MyPlanItem } from '../../api/subscription';
import { useAuth } from '../../store/AuthContext';
import logger from '@helper/logger';

// REESCRITO 2026-08-13: antes era el flujo de compra/cancelación dentro de
// la app (Apple/Google exigen que la app no venda contenido digital dentro
// sin su propio IAP). Ahora es una vista de "Mi plan" 100% de solo lectura —
// la compra pasa por la web, y cambiar/cancelar un plan es cosa del coach,
// no autoservicio.

const STATUS_COLORS: Record<string, string> = {
  paid: C.success,
  pending: C.warning,
  failed: C.destructive,
};

const STATUS_LABELS: Record<string, string> = {
  paid: 'Activo',
  pending: 'Pendiente',
  failed: 'Fallido',
};

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString();
}

export default function SubscriptionDetailScreen(props: any) {
  const { state } = useAuth();
  const isPersonalClient = !!state.user?.is_personal_client;
  const [active, setActive] = useState<MyPlanItem | null>(null);
  const [history, setHistory] = useState<MyPlanItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadMyPlan = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await subscriptionApi.getMyPlan();
      setActive(res.data?.data?.active ?? null);
      setHistory(res.data?.data?.history ?? []);
    } catch (e) {
      logger.error('Failed to load my plan', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Cliente 1:1 ya tiene acceso completo por is_personal_client — no
    // depende de ningún Plan comprado, no hace falta pedir nada.
    if (!isPersonalClient) {
      loadMyPlan();
    }
  }, [loadMyPlan, isPersonalClient]);

  const getTextColor = (status?: string) => STATUS_COLORS[status || ''] || C.gray80;
  const getLabel = (status?: string) => STATUS_LABELS[status || ''] || status || '';

  const renderPlanCard = (item: MyPlanItem) => (
    <View key={item.id} style={[styles.historyCard, { borderLeftColor: getTextColor(item.payment_status) }]}>
      <View style={styles.historyRow}>
        <Text style={styles.historyPlanName}>{item.plan_name || ''}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getTextColor(item.payment_status) + '20' }]}>
          <Text style={[styles.statusText, { color: getTextColor(item.payment_status) }]}>{getLabel(item.payment_status)}</Text>
        </View>
      </View>
      <Text style={styles.historyDate}>Desde {formatDate(item.starts_at)} hasta {formatDate(item.ends_at)}</Text>
      {item.price != null && (
        <Text style={styles.historyPrice}>{Number(item.price).toFixed(2)} {item.currency}</Text>
      )}
    </View>
  );

  if (isPersonalClient) {
    return (
      <View style={styles.container}>
        <View style={styles.appBar}>
          <TouchableOpacity onPress={() => props.navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={C.white} />
          </TouchableOpacity>
          <Text style={styles.appBarTitle}>Mi plan</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="checkmark-circle" size={56} color={C.success} style={{ marginBottom: 16 }} />
          <Text style={styles.emptyTitle}>Ya tienes acceso completo</Text>
          <Text style={styles.emptySubtitle}>
            Como cliente de entrenamiento personal 1:1 tienes acceso a todo el contenido — programas,
            workouts y recetas — sin necesidad de ningún plan adicional.
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
        <Text style={styles.appBarTitle}>Mi plan</Text>
      </View>

      <View style={{ flex: 1 }}>
        {active ? (
          <View style={{ padding: 16 }}>
            {renderPlanCard(active)}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Sin plan activo</Text>
            <Text style={styles.emptySubtitle}>Habla con tu coach para ampliar tu acceso.</Text>
          </View>
        )}

        {history.length > 0 && (
          <>
            <Text style={styles.historyLabel}>Historial</Text>
            <FlatList
              data={history}
              keyExtractor={item => String(item.id)}
              renderItem={({ item }) => renderPlanCard(item)}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
              showsVerticalScrollIndicator={false}
            />
          </>
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
  historyLabel: {
    fontSize: 13,
    fontFamily: FONT.semiBold,
    color: C.gray30,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  emptyTitle: { fontSize: 16, fontFamily: FONT.bold, color: C.gray30, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: C.gray40, fontFamily: FONT.regular, marginBottom: 24, textAlign: 'center' },
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
