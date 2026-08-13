import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, SafeAreaView, ActivityIndicator, Dimensions, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';
import { exercisesApi, EXERCISE_TYPES } from '../../api/exercises';
import MuscleFilterSheet from '../../components/MuscleFilterSheet';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ExerciseModel {
  id: number;
  title: string;
  exerciseImage?: string;
}

interface EquipmentModel {
  id: number;
  title: string;
}

interface LevelModel {
  id: number;
  title: string;
}

interface CategoryModelList {
  id: number;
  title: string;
  select: boolean;
}

interface Pagination {
  totalPages: number;
}

interface ApiResponse<T> {
  data: T[];
  pagination?: Pagination;
}

export default function SearchScreen(props: any) {
  // Cuando se llega desde ViewBodyPart/ViewEquipment/ViewLevel (esta pantalla
  // sustituye a exercise_list_screen.tsx en todos sus llamadores), viene con
  // un filtro ya elegido — se aplica directo en vez del "Todos" por defecto.
  const incoming = props.route?.params ?? {};
  const [searchValue, setSearchValue] = useState('');
  const [showClearButton, setShowClearButton] = useState(false);
  const [selectedFilterList, setSelectedFilterList] = useState(0);
  const [exerciseList, setExerciseList] = useState<ExerciseModel[]>([]);
  const [equipmentList, setEquipmentList] = useState<EquipmentModel[]>([]);
  const [levelList, setLevelList] = useState<LevelModel[]>([]);
  const [list, setList] = useState<CategoryModelList[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [isSearch, setIsSearch] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [numPage, setNumPage] = useState<number | undefined>(undefined);
  const [isLastPage, setIsLastPage] = useState(false);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [bottomSheetListId, setBottomSheetListId] = useState(0);
  const [showMuscleSheet, setShowMuscleSheet] = useState(false);
  const [muscleId, setMuscleId] = useState<number | null>(incoming.isBodyPart && incoming.id ? Number(incoming.id) : null);
  const [muscleName, setMuscleName] = useState<string>(incoming.isBodyPart ? (incoming.mTitle ?? '') : '');
  const [headerTitle, setHeaderTitle] = useState<string>(incoming.mTitle ?? '');
  const searchRef = useRef<TextInput>(null);
  const scrollRef = useRef<ScrollView>(null);
  const styles = useStyle();

  useEffect(() => {
    initList(incoming);
    if (incoming.isBodyPart && incoming.id) {
      setIsSearch(false);
      setSelectedFilterList(3);
      setSelectedId(String(incoming.id));
      getExerciseData({ isFilter: true, isBodyPart: true, ids: String(incoming.id) });
    } else if (incoming.isEquipment && incoming.id) {
      setSelectedFilterList(1);
      setSelectedId(String(incoming.id));
      getExerciseData({ isFilter: true, isEquipment: true, ids: String(incoming.id) });
    } else if (incoming.isLevel && incoming.id) {
      setSelectedFilterList(2);
      setSelectedId(String(incoming.id));
      getExerciseData({ isFilter: true, isLevel: true, ids: String(incoming.id) });
    } else {
      getExerciseData();
    }
  }, []);

  useEffect(() => {
    if (searchValue.length > 0) {
      setIsSearch(true);
      setExerciseList([]);
      getExerciseData({ isFilter: true, ids: selectedId, isEquipment: selectedFilterList === 1, isLevel: selectedFilterList === 2 });
    }
  }, [searchValue]);

  const initList = (params: { isEquipment?: boolean; isLevel?: boolean; isBodyPart?: boolean; isExerciseType?: boolean } = {}) => {
    setList([
      { id: 0, title: 'Todos', select: !params.isEquipment && !params.isLevel && !params.isBodyPart && !params.isExerciseType },
      { id: 1, title: 'Equipamiento', select: !!params.isEquipment },
      { id: 2, title: 'Niveles', select: !!params.isLevel },
      { id: 3, title: 'Músculo', select: !!params.isBodyPart },
      { id: 4, title: 'Tipo', select: !!params.isExerciseType },
    ]);
  };

  const getExercise = async (params: {
    isFilter?: boolean;
    isLevel?: boolean;
    isEquipment?: boolean;
    isBodyPart?: boolean;
    isExerciseType?: boolean;
    ids?: string;
  } = {}): Promise<void> => {
    setIsLoading(true);
    try {
      let res;
      if (searchValue.length > 0) {
        res = await exercisesApi.search(searchValue, page);
      } else if (params.isFilter && params.isEquipment && params.ids) {
        res = await exercisesApi.getByEquipment(Number(params.ids), page);
      } else if (params.isFilter && params.isLevel && params.ids) {
        res = await exercisesApi.getByLevel(Number(params.ids), page);
      } else if (params.isFilter && params.isBodyPart && params.ids) {
        res = await exercisesApi.getByBodyPart(Number(params.ids), page);
      } else if (params.isFilter && params.isExerciseType && params.ids) {
        res = await exercisesApi.getByExerciseType(params.ids, page);
      } else {
        res = await exercisesApi.getList(page);
      }
      const items: ExerciseModel[] = (res.data.data ?? []).map((e: any) => ({
        id: e.id,
        title: e.title,
        exerciseImage: e.exercise_image ?? undefined,
      }));
      setNumPage(res.data.pagination?.totalPages);
      setIsLastPage(false);
      if (page === 1) {
        setExerciseList(items);
      } else {
        setExerciseList((prev) => [...prev, ...items]);
      }
    } catch (e) {
      setIsLastPage(true);
    } finally {
      setIsLoading(false);
    }
  };

  const getEquipmentListApi = async (page: number): Promise<ApiResponse<EquipmentModel>> => {
    const res = await exercisesApi.getEquipment(page);
    return {
      data: (res.data.data ?? []).map((e) => ({ id: e.id, title: e.title })),
      pagination: { totalPages: res.data.pagination?.totalPages ?? 1 },
    };
  };

  const getLevelListApi = async (page: number): Promise<ApiResponse<LevelModel>> => {
    const res = await exercisesApi.getLevels(page);
    return {
      data: (res.data.data ?? []).map((l) => ({ id: l.id, title: l.title })),
      pagination: { totalPages: res.data.pagination?.totalPages ?? 1 },
    };
  };

  const getExerciseData = useCallback(async (params: {
    isFilter?: boolean;
    isLevel?: boolean;
    isEquipment?: boolean;
    isBodyPart?: boolean;
    isExerciseType?: boolean;
    ids?: string;
  } = {}) => {
    await getExercise(params).then(() => {
      if (!isSearch) {
        if (params.isFilter) {
          // done
        } else {
          getEquipmentBasedData();
        }
      }
    });
  }, [page, isSearch]);

  const getEquipmentBasedData = async () => {
    try {
      const value = await getEquipmentListApi(1);
      setEquipmentList(value.data ?? []);
      let eqPage = 1;
      let eqTotalPages = value.pagination?.totalPages ?? 1;
      while (eqPage < eqTotalPages) {
        eqPage++;
        const nextVal = await getEquipmentListApi(eqPage);
        setEquipmentList((prev) => [...prev, ...(nextVal.data ?? [])]);
        eqTotalPages = nextVal.pagination?.totalPages ?? 1;
      }
      getLevelData();
    } catch (e) {
      // handle error
    }
  };

  const getLevelData = async () => {
    setIsLoading(true);
    try {
      const value = await getLevelListApi(1);
      setLevelList(value.data ?? []);
      let lvPage = 1;
      let lvTotalPages = value.pagination?.totalPages ?? 1;
      while (lvPage < lvTotalPages) {
        lvPage++;
        const nextVal = await getLevelListApi(lvPage);
        setLevelList((prev) => [...prev, ...(nextVal.data ?? [])]);
        lvTotalPages = nextVal.pagination?.totalPages ?? 1;
      }
    } catch (e) {
      // handle error
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterPress = async (index: number) => {
    searchRef.current?.blur();
    const updatedList = list.map((item, i) => ({ ...item, select: i === index }));
    setList(updatedList);
    setHeaderTitle('');

    if (list[index].id === 0) {
      setSelectedFilterList(0);
      setMuscleId(null);
      setMuscleName('');
      setIsSearch(false);
      getExerciseData({ isFilter: true });
    } else if (list[index].id === 3) {
      setShowMuscleSheet(true);
    } else {
      setSelectedFilterList(list[index].id);
      setBottomSheetListId(list[index].id);
      setShowBottomSheet(true);
    }
  };

  const handleBottomSheetApply = (mList: (number | string)[]) => {
    const idsStr = mList.join(',');
    setSelectedId(idsStr);
    setMuscleId(null);
    setMuscleName('');
    setIsSearch(false);
    setExerciseList([]);
    setPage(1);
    getExerciseData({
      isFilter: true,
      ids: idsStr,
      isEquipment: bottomSheetListId === 1,
      isLevel: bottomSheetListId === 2,
      isExerciseType: bottomSheetListId === 4,
    });
    setShowBottomSheet(false);
  };

  const handleMuscleSelect = (id: number, name: string) => {
    setShowMuscleSheet(false);
    if (id === 0) {
      // "Quitar filtro" — vuelve a Todos.
      setMuscleId(null);
      setMuscleName('');
      setSelectedFilterList(0);
      setList((prev) => prev.map((item) => ({ ...item, select: item.id === 0 })));
      setIsSearch(false);
      setExerciseList([]);
      setPage(1);
      getExerciseData({ isFilter: true });
      return;
    }
    setMuscleId(id);
    setMuscleName(name);
    setSelectedFilterList(3);
    setSelectedId(String(id));
    setList((prev) => prev.map((item) => ({ ...item, select: item.id === 3 })));
    setIsSearch(false);
    setExerciseList([]);
    setPage(1);
    getExerciseData({ isFilter: true, isBodyPart: true, ids: String(id) });
  };

  const handleClear = () => {
    searchRef.current?.blur();
    setSearchValue('');
    setPage(1);
    setIsSearch(true);
    getExerciseData();
  };

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 20) {
      if (page < (numPage ?? 1) && !isLoading) {
        setPage((prev) => prev + 1);
        getExercise({
          isFilter: selectedFilterList !== 0,
          isEquipment: selectedFilterList === 1,
          isLevel: selectedFilterList === 2,
          isBodyPart: selectedFilterList === 3,
          isExerciseType: selectedFilterList === 4,
          ids: selectedId,
        });
      }
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.body}>
        <ScrollView ref={scrollRef} onScroll={handleScroll} scrollEventThrottle={16}>
          {/* Search Bar */}
          <View style={s.searchRow}>
            <TouchableOpacity onPress={() => props.navigation.goBack()} style={s.backBtn}>
              <Ionicons name="chevron-back" size={28} color={C.textPrimary} />
            </TouchableOpacity>
            <View style={s.searchInputContainer}>
              <TextInput
                ref={searchRef}
                style={[s.searchInput, styles.fontRegular]}
                placeholder="Buscar ejercicio"
                placeholderTextColor={C.gray40}
                value={searchValue}
                onChangeText={(v) => {
                  setSearchValue(v);
                  setShowClearButton(v.length > 0);
                }}
              />
              {showClearButton ? (
                <TouchableOpacity onPress={handleClear} style={s.clearBtn}>
                  <Ionicons name="close-circle" size={20} color={C.gray40} />
                </TouchableOpacity>
              ) : (
                <Ionicons name="search" size={20} color={C.gray40} style={s.searchIcon} />
              )}
            </View>
            <TouchableOpacity
              onPress={() => props.navigation.navigate('MigratedViewBodyPart')}
              style={s.bodyBtn}
            >
              <Ionicons name="body-outline" size={24} color={C.textPrimary} />
            </TouchableOpacity>
          </View>

          {headerTitle ? (
            <Text style={[s.headerTitle, styles.fontMedium]} numberOfLines={1}>
              {headerTitle}
            </Text>
          ) : null}

          {/* Filter Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterChips}>
            {list.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[s.filterChip, item.select && s.filterChipSelected]}
                onPress={() => handleFilterPress(index)}
              >
                <Text style={[s.filterChipText, item.select && s.filterChipTextSelected, styles.fontRegular]}>
                  {item.id === 3 && muscleName ? muscleName : item.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Exercise List */}
          <View style={s.exerciseListContainer}>
            {exerciseList.length > 0 ? (
              exerciseList.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={s.exerciseCard}
                  activeOpacity={0.7}
                  onPress={() =>
                    props.navigation.navigate('MigratedExerciseInfo', {
                      mExerciseId: item.id,
                      mExerciseName: item.title,
                    })
                  }
                >
                  {item.exerciseImage ? (
                    <Image source={{ uri: item.exerciseImage }} style={s.exerciseImage} resizeMode="cover" />
                  ) : (
                    <View style={[s.exerciseImage, { backgroundColor: C.surfaceLight }]} />
                  )}
                  <Text style={[s.exerciseTitle, styles.fontMedium]}>{item.title}</Text>
                </TouchableOpacity>
              ))
            ) : (
              !isLoading && (
                <View style={s.emptyContainer}>
                  <Ionicons name="search-outline" size={64} color={C.gray50} />
                  <Text style={[s.emptyText, styles.fontMedium]}>No se encontraron ejercicios</Text>
                </View>
              )
            )}
          </View>
        </ScrollView>

        {isLoading && (
          <View style={s.loadingOverlay}>
            <ActivityIndicator size="large" color={C.orange} />
          </View>
        )}
      </View>

      {/* Bottom Sheet Modal for Filter */}
      <Modal visible={showBottomSheet} transparent animationType="slide">
        <Pressable style={s.modalOverlay} onPress={() => setShowBottomSheet(false)}>
          <Pressable style={s.bottomSheet} onPress={(e) => e.stopPropagation()}>
            <View style={s.sheetHandle} />
            <Text style={[s.sheetTitle, styles.fontBold]}>
              {bottomSheetListId === 1 ? 'Equipamiento' : bottomSheetListId === 4 ? 'Tipo de ejercicio' : 'Niveles'}
            </Text>
            <ScrollView style={s.sheetScroll}>
              {(bottomSheetListId === 1 ? equipmentList : bottomSheetListId === 4 ? EXERCISE_TYPES : levelList).map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={s.sheetOption}
                  onPress={() => handleBottomSheetApply([item.id])}
                >
                  <Text style={[s.sheetOptionText, styles.fontRegular]}>{item.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <MuscleFilterSheet
        visible={showMuscleSheet}
        onClose={() => setShowMuscleSheet(false)}
        selectedId={muscleId}
        onSelect={handleMuscleSelect}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  body: { flex: 1 },
  searchRow: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: 30 },
  backBtn: { padding: 8 },
  bodyBtn: { padding: 8, marginLeft: 4 },
  headerTitle: { fontSize: 15, color: C.white, paddingHorizontal: 16, marginTop: -4, marginBottom: 8 },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surfaceLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    marginLeft: 8,
  },
  searchInput: { flex: 1, color: C.white, fontSize: 15, paddingHorizontal: 16, paddingVertical: 12 },
  searchIcon: { paddingRight: 12 },
  clearBtn: { paddingRight: 12 },
  filterChips: { paddingHorizontal: 16, paddingBottom: 16 },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.bg,
    marginRight: 8,
  },
  filterChipSelected: { backgroundColor: C.brand5, borderColor: C.brand5 },
  filterChipText: { fontSize: 14, color: C.gray30 },
  filterChipTextSelected: { color: C.white },
  exerciseListContainer: { paddingHorizontal: 16 },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surfaceLight,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  exerciseImage: { width: 64, height: 64, borderRadius: 12 },
  exerciseTitle: { fontSize: 15, color: C.white, marginLeft: 12, flex: 1 },
  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 16, color: C.gray30, marginTop: 12 },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  bottomSheet: {
    backgroundColor: C.surfaceLight,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 24,
    maxHeight: '60%',
  },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: C.gray60, alignSelf: 'center', marginBottom: 16 },
  sheetTitle: { fontSize: 20, color: C.white, marginBottom: 16 },
  sheetScroll: { maxHeight: 400 },
  sheetOption: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  sheetOptionText: { fontSize: 16, color: C.white },
});

function useStyle() {
  return useResponsiveStyleSheet({
    fontBold: { fontFamily: FONT.bold },
    fontMedium: { fontFamily: FONT.medium },
    fontRegular: { fontFamily: FONT.regular },
    fontSemiBold: { fontFamily: FONT.semiBold },
  });
}
