import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, FlatList, SafeAreaView, Dimensions, ActivityIndicator } from 'react-native';
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
  isFavourite?: number;
  isFavouriteLocally?: number;
  [key: string]: any;
}

interface ExerciseListScreenProps {
  navigation: any;
  route: {
    params: {
      mTitle?: string;
      isBodyPart?: boolean;
      isLevel?: boolean;
      isEquipment?: boolean;
      id?: number;
    };
  };
}

export default function ExerciseListScreen(props: ExerciseListScreenProps) {
  const { mTitle, isBodyPart = false, isLevel = false, isEquipment = false, id } = props.route.params ?? {};

  const [mExerciseList, setMExerciseList] = useState<ExerciseModel[]>([]);
  const [isSearch, setIsSearch] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [exercisePage, setExercisePage] = useState(1);
  const [exerciseNumPage, setExerciseNumPage] = useState<number | null>(null);
  const [isExerciseLastPage, setIsExerciseLastPage] = useState(false);

  const exerciseScrollRef = useRef<FlatList | null>(null);

  const getExerciseData = useCallback(async () => {
    setIsLoading(true);
    try {
      let res;
      if (searchText) {
        res = await exercisesApi.search(searchText);
      } else if (isBodyPart && id) {
        res = await exercisesApi.getByBodyPart(id, exercisePage);
      } else if (isEquipment && id) {
        res = await exercisesApi.getByEquipment(id, exercisePage);
      } else if (isLevel && id) {
        res = await exercisesApi.getByLevel(id, exercisePage);
      } else {
        res = await exercisesApi.getList(exercisePage);
      }
      const list = (res.data.data ?? []).map((e: any) => ({
        id: e.id,
        title: e.title,
        exerciseImage: e.exercise_image,
        type: e.type,
        levelTitle: e.level_title,
        isFavourite: 0,
      }));
      if (exercisePage === 1) setMExerciseList(list);
      else setMExerciseList((prev) => [...prev, ...list]);
      setExerciseNumPage(res.data.pagination?.totalPages ?? null);
    } catch (e) {
      setIsExerciseLastPage(true);
    } finally {
      setIsLoading(false);
    }
  }, [exercisePage, searchText, id, isBodyPart, isEquipment, isLevel]);

  useEffect(() => {
    getExerciseData();
  }, []);

  const handleSearchChange = (v: string) => {
    setSearchText(v);
    setExercisePage(1);
    setMExerciseList([]);
    getExerciseData();
  };

  const toggleSearch = () => {
    if (isSearch) {
      setSearchText('');
      setIsSearch(false);
      setExercisePage(1);
      setMExerciseList([]);
      getExerciseData();
    } else {
      setIsSearch(true);
    }
  };

  const renderExerciseItem = ({ item }: { item: ExerciseModel }) => (
    <TouchableOpacity
      style={localStyles.card}
      onPress={() =>
        props.navigation.navigate('MigratedExerciseInfo', {
          mExerciseId: item.id,
          mExerciseName: item.title,
        })
      }
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.exerciseImage || '' }} style={localStyles.cardImage} />
      <View style={localStyles.cardInfo}>
        <Text style={localStyles.cardTitle} numberOfLines={1}>{item.title || ''}</Text>
        {item.levelTitle ? (
          <Text style={localStyles.cardSubtitle}>{item.levelTitle}</Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={C.gray40} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={localStyles.container}>
      {/* App Bar */}
      <View style={localStyles.appBar}>
        {isSearch ? (
          <TextInput
            style={localStyles.searchInput}
            placeholder="Search..."
            placeholderTextColor={C.gray30}
            value={searchText}
            onChangeText={handleSearchChange}
            autoFocus
          />
        ) : (
          <Text style={localStyles.appBarTitle}>
            {(mTitle || '').replace(/^\w/, (c) => c.toUpperCase())}
          </Text>
        )}
        <TouchableOpacity onPress={toggleSearch} style={localStyles.searchBtn}>
          <Ionicons name={isSearch ? 'close' : 'search'} size={22} color={C.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      {/* Content */}
      <View style={localStyles.body}>
        <FlatList
          ref={exerciseScrollRef}
          data={mExerciseList}
          renderItem={renderExerciseItem}
          keyExtractor={(item, i) => `${item.id}-${i}`}
          contentContainerStyle={{ paddingHorizontal: 12 }}
          onEndReached={() => {
            if (!isExerciseLastPage && exercisePage < (exerciseNumPage ?? 1)) {
              setExercisePage((prev) => prev + 1);
              getExerciseData();
            }
          }}
          onEndReachedThreshold={0.5}
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
            <ActivityIndicator size="large" color={C.textPrimary} />
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
  appBarTitle: {
    flex: 1,
    fontFamily: FONT.bold,
    fontSize: 18,
    color: C.white,
    textAlign: 'center',
  },
  searchInput: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: 16,
    color: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingBottom: 8,
  },
  searchBtn: { padding: 8 },
  body: { flex: 1 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surfaceLight,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  cardImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: C.gray70,
  },
  cardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cardTitle: {
    fontFamily: FONT.semiBold,
    fontSize: 14,
    color: C.white,
  },
  cardSubtitle: {
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
