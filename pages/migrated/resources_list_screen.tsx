import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { C, FONT } from './theme';
import { resourcesApi, ResourceListItem, ResourceCategory } from '../../api/resources';

type Tab = 'mine' | 'shared';

// Sub-secciones que se muestran dentro de cada pestaña, en este orden fijo.
const SHARED_SECTIONS: { key: ResourceCategory; label: string }[] = [
  { key: 'entrenamiento', label: 'Entrenamiento' },
  { key: 'nutricion', label: 'Nutrición' },
  { key: 'habitos_mindset', label: 'Hábitos y Mindset' },
];

const MINE_SECTIONS: { key: ResourceCategory; label: string }[] = [
  { key: 'onboarding', label: 'Onboarding' },
  { key: 'planes_actuales', label: 'Tus planes actuales' },
];

const OTHER_LABEL = 'Otros';

const TYPE_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  article: 'document-text-outline',
  video: 'play-circle-outline',
  link: 'link-outline',
  doc: 'reader-outline',
};

const TYPE_COLOR: Record<string, string> = {
  article: C.blue60,
  video: C.warning60,
  link: C.purple60,
  doc: C.success60,
};

interface Props {
  navigation?: any;
}

export default function ResourcesListScreen(props: Props) {
  const { navigation } = props;
  const [activeTab, setActiveTab] = useState<Tab>('mine');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [items, setItems] = useState<ResourceListItem[]>([]);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(false);
    try {
      const res = await resourcesApi.getList({ per_page: 100 });
      setItems(res.data?.data ?? []);
    } catch (e) {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const mine = useMemo(() => items.filter((i) => i.scope === 'assigned'), [items]);
  const shared = useMemo(() => items.filter((i) => i.scope === 'shared'), [items]);
  const activeList = activeTab === 'mine' ? mine : shared;
  const sectionDefs = activeTab === 'mine' ? MINE_SECTIONS : SHARED_SECTIONS;

  const sections = useMemo(() => {
    const known = sectionDefs.map((s) => ({
      label: s.label,
      data: activeList.filter((i) => i.category === s.key),
    }));
    const knownKeys = sectionDefs.map((s) => s.key);
    const rest = activeList.filter((i) => !knownKeys.includes(i.category as ResourceCategory));
    return rest.length > 0 ? [...known, { label: OTHER_LABEL, data: rest }] : known;
  }, [activeList, sectionDefs]);

  const openResource = (item: ResourceListItem) => {
    navigation?.navigate('MigratedResourceDetail', { resourceId: item.id, title: item.title });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <Ionicons name="chevron-back" size={24} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recursos</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'mine' && styles.tabActive]}
          onPress={() => setActiveTab('mine')}
        >
          <Text style={[styles.tabText, activeTab === 'mine' && styles.tabTextActive]}>Mis Recursos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'shared' && styles.tabActive]}
          onPress={() => setActiveTab('shared')}
        >
          <Text style={[styles.tabText, activeTab === 'shared' && styles.tabTextActive]}>Compartidos</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={C.textPrimary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No se pudieron cargar los recursos.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {activeList.length === 0 ? (
            <View style={styles.center}>
              <Ionicons name="folder-open-outline" size={40} color={C.textSecondary} />
              <Text style={[styles.emptyText, { marginTop: 12 }]}>
                {activeTab === 'mine' ? 'Todavía no tienes recursos asignados.' : 'Aún no hay recursos compartidos.'}
              </Text>
            </View>
          ) : (
            sections.map((section) =>
              section.data.length === 0 ? null : (
                <View key={section.label} style={styles.section}>
                  <Text style={styles.sectionTitle}>{section.label}</Text>
                  {section.data.map((item) => (
                    <TouchableOpacity key={item.id} style={styles.card} activeOpacity={0.75} onPress={() => openResource(item)}>
                      <View style={[styles.iconWrap, { backgroundColor: `${TYPE_COLOR[item.type] ?? C.textPrimary}1A` }]}>
                        <Ionicons name={TYPE_ICON[item.type] ?? 'document-text-outline'} size={20} color={TYPE_COLOR[item.type] ?? C.textPrimary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                        <Text style={styles.cardType}>{item.type}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={C.textSecondary} />
                    </TouchableOpacity>
                  ))}
                </View>
              )
            )
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  headerTitle: { fontFamily: FONT.bold, fontSize: 17, color: C.textPrimary },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyText: { fontFamily: FONT.regular, fontSize: 14, color: C.textSecondary, textAlign: 'center', paddingHorizontal: 32 },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: C.surfaceLight,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: C.brand50 },
  tabText: { fontFamily: FONT.semiBold, fontSize: 13, color: C.gray50 },
  tabTextActive: { color: C.white },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 24 },
  section: { marginBottom: 8 },
  sectionTitle: { fontFamily: FONT.bold, fontSize: 13, color: C.textSecondary, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 10, marginTop: 4 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { fontFamily: FONT.bold, fontSize: 14.5, color: C.textPrimary },
  cardType: { fontFamily: FONT.regular, fontSize: 11.5, color: C.textSecondary, marginTop: 3, textTransform: 'capitalize' },
});
