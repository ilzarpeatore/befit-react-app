import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView, ActivityIndicator, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';
import { workoutTemplateApi, WorkoutTemplateListItem } from '../../api/workoutTemplate';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Navegación libre de "Workouts sueltos" (sistema v2, WorkoutTemplate) — sección
// separada de "Rutinas" en Home, que sigue usando el catálogo legacy (Workout).
// Un template marcado is_exclusive muestra candado; el acceso real (blocks vacíos
// o completos) lo decide el backend en workout-template-detail, esto solo pinta
// el estado para que el cliente sepa qué puede abrir libremente.
export default function WorkoutTemplateListScreen(props: any) {
  const [items, setItems] = useState<WorkoutTemplateListItem[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLastPage, setIsLastPage] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const styles = useResponsiveStyleSheet({
    fontBold: { fontFamily: FONT.bold },
    fontMedium: { fontFamily: FONT.medium },
    fontSemiBold: { fontFamily: FONT.semiBold },
  });

  const loadWorkouts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await workoutTemplateApi.getList(page, 20);
      const data = res.data.data ?? [];
      if (page === 1) {
        setItems(data);
      } else {
        setItems((prev) => [...prev, ...data]);
      }
      const totalPages = res.data.pagination?.totalPages ?? 1;
      setIsLastPage(page >= totalPages);
    } catch (e) {
      // best-effort, deja la lista como estaba
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadWorkouts();
  }, [loadWorkouts]);

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
      if (!isLastPage && !isLoading) {
        setPage((prev) => prev + 1);
      }
    }
  };

  const columnWidth = (SCREEN_WIDTH - 48) / 2;

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => props.navigation.goBack()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color={C.white} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, styles.fontBold]}>Workouts</Text>
        <View style={s.backBtn} />
      </View>

      <View style={s.body}>
        {isLoading && page === 1 ? (
          <View style={s.center}>
            <ActivityIndicator size="large" color={C.brand5} />
          </View>
        ) : !isLoading && items.length === 0 ? (
          <View style={s.center}>
            <Text style={[s.emptyText, styles.fontMedium]}>No workouts found</Text>
          </View>
        ) : (
          <ScrollView
            ref={scrollRef}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            contentContainerStyle={s.scrollContent}
          >
            <View style={s.grid}>
              {items.map((item) => {
                const locked = item.is_exclusive && !item.is_accessible;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[s.card, { width: columnWidth }]}
                    activeOpacity={0.7}
                    onPress={() =>
                      props.navigation.navigate('MigratedWorkoutPreview', {
                        workoutTemplateId: item.id,
                        mTitle: item.title,
                      })
                    }
                  >
                    {item.thumbnail ? (
                      <Image
                        source={{ uri: item.thumbnail }}
                        style={[s.thumbnail, { width: columnWidth, height: 140 }]}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={[s.thumbnail, { width: columnWidth, height: 140, backgroundColor: C.surfaceLight }]} />
                    )}
                    {locked && (
                      <View style={s.lockBadge}>
                        <Ionicons name="lock-closed" size={14} color={C.white} />
                        <Text style={[s.lockBadgeText, styles.fontSemiBold]}>Exclusive</Text>
                      </View>
                    )}
                    <Text style={[s.title, styles.fontBold]} numberOfLines={1}>
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {isLoading && page > 1 && (
              <ActivityIndicator size="small" color={C.brand5} style={{ marginVertical: 16 }} />
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  backBtn: { width: 40, alignItems: 'center' },
  headerTitle: { fontSize: 18, color: C.white, flex: 1, textAlign: 'center' },
  body: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: C.gray30 },
  scrollContent: { padding: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { marginBottom: 16 },
  thumbnail: { borderRadius: 12 },
  lockBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  lockBadgeText: { fontSize: 11, color: C.white },
  title: { fontSize: 14, color: C.white, marginTop: 8 },
});
