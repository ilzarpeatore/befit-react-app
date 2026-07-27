import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';
import { workoutsApi } from '../../api/workouts';

interface WorkoutItem {
  id: number;
  title: string;
  image?: string;
  workoutTypeTitle?: string;
  levelTitle?: string;
  isFavourite?: number;
  isPremium?: number;
  [key: string]: any;
}

export default function ViewWorkoutsScreen(props: any) {
  const {
    isFav = false,
    isAssign = false,
    showAppbar = true,
  } = props.route?.params || {};

  const [workoutList, setWorkoutList] = useState<WorkoutItem[]>([]);
  const [page, setPage] = useState(1);
  const [numPage, setNumPage] = useState<number | null>(null);
  const [isLastPage, setIsLastPage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    getWorkoutData();
  }, []);

  useEffect(() => {
    if (numPage && page > 1) {
      getWorkoutData();
    }
  }, [page]);

  const getWorkoutData = async () => {
    setIsLoading(true);
    try {
      const apiCall = isFav
        ? workoutsApi.getFavourite(page)
        : isAssign
          ? workoutsApi.getAssigned(page)
          : workoutsApi.getList(page);
      await apiCall.then((res) => {
        const value: any = res.data;
        setNumPage(value.pagination?.total_pages ?? null);
        setIsLastPage(false);
        if (page === 1) setWorkoutList([]);
        const items = (value.data ?? []).map((w: any) => ({
          id: w.id,
          title: w.title,
          image: w.workout_image,
          workoutTypeTitle: w.workout_type_title,
          levelTitle: w.level_title,
          isFavourite: w.is_favourite,
          isPremium: w.is_premium,
        }));
        setWorkoutList((prev) => [...prev, ...items]);
      });
    } catch (e) {
      setIsLastPage(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    if (isFav) {
      setWorkoutList([]);
      setPage(1);
      getWorkoutData();
    }
  };

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isAtEnd = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
    if (isAtEnd && !isLoading && numPage && page < numPage) {
      setPage((prev) => prev + 1);
    }
  };

  const renderWorkoutItem = ({ item, index }: { item: WorkoutItem; index: number }) => (
    <TouchableOpacity
      key={item.id?.toString() || index.toString()}
      style={styles.workoutItem}
      activeOpacity={0.7}
      onPress={() => {
        props.navigation?.navigate('MigratedWorkoutDetail', { id: item.id });
      }}
    >
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.workoutImage} resizeMode="cover" />
      ) : null}
      <View style={styles.workoutContent}>
        <Text style={styles.workoutTitle} numberOfLines={1}>{item.title}</Text>
        {item.workoutTypeTitle ? (
          <Text style={styles.workoutSubtitle} numberOfLines={1}>{item.workoutTypeTitle}</Text>
        ) : null}
        <View style={styles.workoutMeta}>
          {item.levelTitle ? (
            <Text style={styles.levelText}>{item.levelTitle}</Text>
          ) : null}
          {item.isPremium === 1 && (
            <View style={styles.proBadge}>
              <Text style={styles.proText}>PRO</Text>
            </View>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={C.gray30} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {showAppbar !== false && (
        <View style={styles.header}>
          <TouchableOpacity onPress={() => props.navigation?.goBack()}>
            <Ionicons name="chevron-back" size={24} color={C.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Workouts</Text>
          <View style={{ width: 24 }} />
        </View>
      )}

      <View style={styles.body}>
        {workoutList.length > 0 ? (
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={[
              styles.scrollContent,
              (isFav || isAssign) && { paddingVertical: 16 },
            ]}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {workoutList.map((item, index) => renderWorkoutItem({ item, index }))}
          </ScrollView>
        ) : (
          !isLoading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No Workouts Found</Text>
            </View>
          )
        )}

        {isLoading && (
          <View style={styles.loaderOverlay}>
            <ActivityIndicator size="large" color={C.brand5} />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerTitle: {
    fontFamily: FONT.semiBold,
    fontSize: 18,
    color: C.white,
  },
  body: { flex: 1 },
  scrollContent: { paddingVertical: 4, paddingHorizontal: 16 },
  workoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surfaceLight,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    padding: 10,
  },
  workoutImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  workoutContent: {
    flex: 1,
    marginLeft: 12,
  },
  workoutTitle: {
    fontFamily: FONT.semiBold,
    fontSize: 15,
    color: C.white,
  },
  workoutSubtitle: {
    fontFamily: FONT.regular,
    fontSize: 13,
    color: C.textSecondary,
    marginTop: 2,
  },
  workoutMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  levelText: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: C.gray30,
  },
  proBadge: {
    backgroundColor: C.orange,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  proText: {
    fontFamily: FONT.bold,
    fontSize: 10,
    color: C.white,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: FONT.regular,
    fontSize: 16,
    color: C.textSecondary,
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
});
