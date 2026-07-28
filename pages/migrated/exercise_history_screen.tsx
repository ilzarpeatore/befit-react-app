import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList, SafeAreaView, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';
import { exercisesApi } from '../../api/exercises';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ExerciseModel {
  id?: number;
  title?: string;
  exerciseImage?: string;
  type?: string;
  levelTitle?: string;
  bodypartName?: string;
  [key: string]: any;
}

interface ExerciseHistoryScreenProps {
  navigation: any;
}

export default function ExerciseHistoryScreen(props: ExerciseHistoryScreenProps) {

  const [mExerciseList, setMExerciseList] = useState<ExerciseModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [numPage, setNumPage] = useState<number | null>(null);
  const [isLastPage, setIsLastPage] = useState(false);
  const scrollController = useRef<FlatList | null>(null);

  const getExerciseData = useCallback(async () => {
    setIsLoading(true);
    try {
      await exercisesApi.getUserExercises(page).then((res) => {
        const value: any = res.data;
        setNumPage(value.pagination?.totalPages ?? null);
        setIsLastPage(false);
        if (page === 1) setMExerciseList([]);
        const items = (value.data ?? []).map((ex: any) => ({
          id: ex.id,
          title: ex.title,
          exerciseImage: ex.exercise_image,
          type: ex.type,
          levelTitle: ex.level_title,
        }));
        setMExerciseList(prev => [...prev, ...items]);
      });
    } catch (e) {
      setIsLastPage(true);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    getExerciseData();
  }, [getExerciseData]);

  const handleEndReached = () => {
    if (!isLoading && !isLastPage && numPage && page < numPage) {
      setPage((prev) => prev + 1);
    }
  };

  const renderExerciseItem = ({ item }: { item: ExerciseModel }) => (
    <TouchableOpacity
      style={localStyles.exerciseCard}
      onPress={() =>
        props.navigation.navigate('MigratedExerciseInfo', {
          mExerciseId: item.id,
          mExerciseName: item.title,
        })
      }
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.exerciseImage || '' }} style={localStyles.exerciseImage} />
      <View style={localStyles.exerciseInfo}>
        <Text style={localStyles.exerciseTitle} numberOfLines={1}>{item.title || ''}</Text>
        {item.levelTitle ? (
          <Text style={localStyles.exerciseLevel}>{item.levelTitle}</Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={C.gray40} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={localStyles.container}>
      <View style={localStyles.appBar}>
        <TouchableOpacity onPress={() => props.navigation.goBack()} style={localStyles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={C.brand5} />
        </TouchableOpacity>
        <Text style={localStyles.appBarTitle}>Exercise History</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={localStyles.body}>
        <FlatList
          ref={scrollController}
          data={mExerciseList}
          renderItem={renderExerciseItem}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 4 }}
          ListEmptyComponent={
            !isLoading ? (
              <View style={localStyles.emptyContainer}>
                <Text style={localStyles.emptyText}>No exercises found</Text>
              </View>
            ) : null
          }
        />
        {isLoading && (
          <View style={localStyles.loaderContainer}>
            <ActivityIndicator size="large" color={C.brand5} />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: C.bg,
  },
  backBtn: { padding: 8 },
  appBarTitle: {
    flex: 1,
    fontFamily: FONT.bold,
    fontSize: 18,
    color: C.white,
    textAlign: 'center',
  },
  body: { flex: 1 },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surfaceLight,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  exerciseImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: C.gray70,
  },
  exerciseInfo: {
    flex: 1,
    marginLeft: 12,
  },
  exerciseTitle: {
    fontFamily: FONT.semiBold,
    fontSize: 14,
    color: C.white,
  },
  exerciseLevel: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: C.gray30,
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontFamily: FONT.regular,
    fontSize: 14,
    color: C.gray30,
  },
  loaderContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
