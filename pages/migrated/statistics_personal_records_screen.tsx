import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { C, FONT, SHADOW } from './theme';
import { exerciseStatsApi, PersonalRecordItem } from '../../api/exerciseStats';
import MuscleFilterSheet from '../../components/MuscleFilterSheet';

const RECENT_LIMIT = 15;

interface Props {
  navigation?: any;
  route?: any;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

function RecordRow({ item, rank, onOpenExercise }: { item: PersonalRecordItem; rank: number; onOpenExercise: () => void }) {
  return (
    <View style={s.row}>
      <View style={s.rankWrap}>
        <Text style={s.rank}>{rank}</Text>
      </View>
      <TouchableOpacity activeOpacity={0.75} onPress={onOpenExercise}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={s.thumb} />
        ) : (
          <View style={[s.thumb, s.thumbPlaceholder]}>
            <Ionicons name="trophy-outline" size={18} color={C.textSecondary} />
          </View>
        )}
      </TouchableOpacity>
      <TouchableOpacity style={{ flex: 1 }} activeOpacity={0.75} onPress={onOpenExercise}>
        <Text style={s.title} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={s.subtitle}>
          1RM est. {Math.round(item.max_1rm)} kg {item.achieved_at ? `· ${formatDate(item.achieved_at)}` : ''}
        </Text>
      </TouchableOpacity>
      <View style={s.weightWrap}>
        <Text style={s.weightValue}>{item.max_weight}</Text>
        <Text style={s.weightUnit}>kg</Text>
        {item.max_reps != null && <Text style={s.repsValue}>{item.max_reps} reps</Text>}
      </View>
    </View>
  );
}

export default function StatisticsPersonalRecordsScreen(props: Props) {
  const { navigation } = props;
  const [items, setItems] = useState<PersonalRecordItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [muscleId, setMuscleId] = useState<number | null>(null);
  const [muscleName, setMuscleName] = useState<string>('');
  const [showMuscleSheet, setShowMuscleSheet] = useState(false);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    exerciseStatsApi
      .getMyPersonalRecords(muscleId ?? undefined)
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
  }, [muscleId]);

  // Ya viene ordenado por fecha de logro mas reciente desde el backend.
  // Sin filtro de musculo, recortamos a los ultimos 15 ejercicios realizados
  // (evita que la lista crezca sin limite); con filtro de musculo activo se
  // muestran todos los que coincidan, sin recortar.
  const visibleItems = useMemo(() => {
    let list = items;
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      list = list.filter((it) => it.title.toLowerCase().includes(q));
    }
    if (!muscleId) {
      list = list.slice(0, RECENT_LIMIT);
    }
    return list;
  }, [items, searchText, muscleId]);

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.appBar}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={s.iconBtn}>
          <Ionicons name="chevron-back" size={22} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={s.appBarTitle} numberOfLines={1}>
          Marcas personales
        </Text>
        <TouchableOpacity
          style={s.iconBtn}
          onPress={() => setShowMuscleSheet(true)}
        >
          <Ionicons name="body-outline" size={22} color={muscleId ? C.orange : C.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={s.hint}>
          Tu mejor peso levantado en cada ejercicio, con el 1RM estimado.
          {!muscleId ? ` Se muestran solo los últimos ${RECENT_LIMIT} ejercicios realizados.` : ` Filtrado por ${muscleName}.`}
        </Text>

        <View style={s.searchRow}>
          <Ionicons name="search" size={16} color={C.textSecondary} />
          <TextInput
            style={s.searchInput}
            placeholder="Buscar ejercicio..."
            placeholderTextColor={C.textSecondary}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={18} color={C.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {muscleId ? (
          <TouchableOpacity style={s.muscleChip} onPress={() => { setMuscleId(null); setMuscleName(''); }}>
            <Text style={s.muscleChipText}>{muscleName}</Text>
            <Ionicons name="close" size={14} color={C.white} />
          </TouchableOpacity>
        ) : null}

        <View style={s.listCard}>
          {isLoading ? (
            <ActivityIndicator size="large" color={C.textSecondary} style={{ paddingVertical: 60 }} />
          ) : visibleItems.length === 0 ? (
            <Text style={s.emptyText}>
              {items.length === 0
                ? 'Todavía no tienes marcas registradas. Completa series con peso y repeticiones para empezar a acumularlas.'
                : 'Ningún ejercicio coincide con la búsqueda.'}
            </Text>
          ) : (
            visibleItems.map((item, idx) => (
              <View key={item.exercise_id}>
                <RecordRow
                  item={item}
                  rank={idx + 1}
                  onOpenExercise={() =>
                    navigation?.navigate('MigratedExerciseInfo', {
                      mExerciseId: item.exercise_id,
                      mExerciseName: item.title,
                      initialTab: 'analysis',
                    })
                  }
                />
                {idx < visibleItems.length - 1 && <View style={s.divider} />}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <MuscleFilterSheet
        visible={showMuscleSheet}
        onClose={() => setShowMuscleSheet(false)}
        selectedId={muscleId}
        onSelect={(id, name) => {
          if (id === 0) {
            setMuscleId(null);
            setMuscleName('');
          } else {
            setMuscleId(id);
            setMuscleName(name);
          }
          setShowMuscleSheet(false);
        }}
      />
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
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: C.surface, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, marginTop: 10,
  },
  searchInput: { flex: 1, fontFamily: FONT.regular, fontSize: 14, color: C.textPrimary },
  muscleChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
    backgroundColor: C.orange, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6, marginTop: 10,
  },
  muscleChipText: { fontFamily: FONT.semiBold, fontSize: 12.5, color: C.white },
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
  repsValue: { fontFamily: FONT.medium, fontSize: 11, color: C.textSecondary, marginTop: 2 },
  divider: { height: 1, backgroundColor: C.border, marginLeft: 76 },
});
