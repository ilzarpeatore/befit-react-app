import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { C, FONT, SHADOW } from './theme';
import { exerciseStatsApi, PersonalRecordItem } from '../../api/exerciseStats';

interface Props {
  navigation?: any;
  route?: any;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

function RecordRow({ item, rank }: { item: PersonalRecordItem; rank: number }) {
  return (
    <View style={s.row}>
      <View style={s.rankWrap}>
        <Text style={s.rank}>{rank}</Text>
      </View>
      {item.image ? (
        <Image source={{ uri: item.image }} style={s.thumb} />
      ) : (
        <View style={[s.thumb, s.thumbPlaceholder]}>
          <Ionicons name="trophy-outline" size={18} color={C.textSecondary} />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={s.title} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={s.subtitle}>
          1RM est. {Math.round(item.max_1rm)} kg {item.achieved_at ? `· ${formatDate(item.achieved_at)}` : ''}
        </Text>
      </View>
      <View style={s.weightWrap}>
        <Text style={s.weightValue}>{item.max_weight}</Text>
        <Text style={s.weightUnit}>kg</Text>
      </View>
    </View>
  );
}

export default function StatisticsPersonalRecordsScreen(props: Props) {
  const { navigation } = props;
  const [items, setItems] = useState<PersonalRecordItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    exerciseStatsApi
      .getMyPersonalRecords()
      .then((res) => {
        if (!active) return;
        setItems(res.data?.data || []);
      })
      .catch(() => {
        if (active) setItems([]);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.appBar}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={s.iconBtn}>
          <Ionicons name="chevron-back" size={22} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={s.appBarTitle} numberOfLines={1}>
          Marcas personales
        </Text>
        <View style={s.iconBtn} />
      </View>

      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={s.hint}>Tu mejor peso levantado en cada ejercicio, con el 1RM estimado.</Text>
        <View style={s.listCard}>
          {isLoading ? (
            <ActivityIndicator size="large" color={C.textSecondary} style={{ paddingVertical: 60 }} />
          ) : items.length === 0 ? (
            <Text style={s.emptyText}>
              Todavía no tienes marcas registradas. Completa series con peso y repeticiones para empezar a acumularlas.
            </Text>
          ) : (
            items.map((item, idx) => (
              <View key={item.exercise_id}>
                <RecordRow item={item} rank={idx + 1} />
                {idx < items.length - 1 && <View style={s.divider} />}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  appBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 12 },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  appBarTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontFamily: FONT.bold, color: C.textPrimary, marginHorizontal: 4 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 32 },
  hint: { fontFamily: FONT.regular, fontSize: 13, color: C.textSecondary, marginTop: 8, marginBottom: 4 },
  listCard: { backgroundColor: C.surface, borderRadius: 20, marginTop: 12, padding: 8, ...SHADOW.card },
  emptyText: { fontFamily: FONT.regular, fontSize: 13, color: C.textSecondary, textAlign: 'center', paddingVertical: 40, paddingHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12 },
  rankWrap: { width: 20, alignItems: 'center' },
  rank: { fontFamily: FONT.bold, fontSize: 14, color: C.textSecondary },
  thumb: { width: 48, height: 48, borderRadius: 10, backgroundColor: C.gray5 },
  thumbPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: FONT.semiBold, fontSize: 14.5, color: C.textPrimary },
  subtitle: { fontFamily: FONT.regular, fontSize: 12, color: C.textSecondary, marginTop: 3 },
  weightWrap: { alignItems: 'flex-end' },
  weightValue: { fontFamily: FONT.extraBold, fontSize: 18, color: C.orange },
  weightUnit: { fontFamily: FONT.regular, fontSize: 10.5, color: C.textSecondary },
  divider: { height: 1, backgroundColor: C.border, marginLeft: 76 },
});
