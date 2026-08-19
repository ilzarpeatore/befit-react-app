import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ScrollView, SafeAreaView, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Box } from '@components/ui/box';
import { Text } from '@components/ui/text';
import { Button } from '@components/ui/button';
import { Pressable } from '@components/ui/pressable';
import { Icon } from '@components/ui/icon';
import { Input, InputField, InputSlot } from '@components/ui/input';
import { Spinner } from '@components/ui/spinner';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from '@components/ui/actionsheet';
import { C } from './theme';
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
  // Tipado del wrapper de InputField no expone los métodos imperativos del
  // TextInput nativo que envuelve (blur) — any es el escape pragmático ya
  // usado en otras pantallas migradas para este mismo caso.
  const searchRef = useRef<any>(null);
  const scrollRef = useRef<ScrollView>(null);

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
      getExerciseData({
        isFilter: true,
        ids: selectedId,
        isEquipment: selectedFilterList === 1,
        isLevel: selectedFilterList === 2,
        isBodyPart: selectedFilterList === 3,
        isExerciseType: selectedFilterList === 4,
      });
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
      // Bug real: antes, en cuanto había texto de búsqueda, se ignoraba
      // cualquier filtro de músculo/equipo/nivel/tipo activo (buscaba en
      // todo el catálogo). Ahora se combinan en la misma llamada —
      // getFilteredList es el mismo endpoint exercise-list, solo con más
      // query params a la vez.
      if (searchValue.length > 0) {
        res = await exercisesApi.getFilteredList({
          title: searchValue,
          page,
          bodypart_id: params.isFilter && params.isBodyPart && params.ids ? Number(params.ids) : undefined,
          equipment_id: params.isFilter && params.isEquipment && params.ids ? Number(params.ids) : undefined,
          level_ids: params.isFilter && params.isLevel && params.ids ? Number(params.ids) : undefined,
          exercise_type: params.isFilter && params.isExerciseType && params.ids ? params.ids : undefined,
        });
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
    <SafeAreaView style={{ flex: 1 }}>
      <Box className="flex-1 bg-background">
        <ScrollView ref={scrollRef} onScroll={handleScroll} scrollEventThrottle={16}>
          {/* Search Bar */}
          <Box className="flex-row items-center gap-2" style={{ padding: 16, paddingTop: 30 }}>
            <Button variant="ghost" size="icon" onPress={() => props.navigation.goBack()}>
              <Icon name="chevron-back" size={28} className="text-foreground" />
            </Button>
            <Input className="flex-1 rounded-md bg-card border border-border px-3.5 gap-2" size="md">
              <InputField
                ref={searchRef}
                placeholder="Buscar ejercicio"
                value={searchValue}
                onChangeText={(v) => {
                  setSearchValue(v);
                  setShowClearButton(v.length > 0);
                }}
              />
              {showClearButton ? (
                <InputSlot onPress={handleClear}>
                  <Icon name="close-circle" size={20} className="text-muted-foreground" />
                </InputSlot>
              ) : (
                <Icon name="search" size={20} className="text-muted-foreground" />
              )}
            </Input>
            <Button variant="ghost" size="icon" onPress={() => props.navigation.navigate('MigratedViewBodyPart')}>
              <Icon name="body-outline" size={24} className="text-foreground" />
            </Button>
          </Box>

          {headerTitle ? (
            <Text weight="medium" className="text-foreground" style={{ paddingHorizontal: 16, marginTop: -4, marginBottom: 8 }} numberOfLines={1}>
              {headerTitle}
            </Text>
          ) : null}

          {/* Filter Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}>
            {list.map((item, index) => (
              <Pressable
                key={item.id}
                className="rounded-pill border"
                style={{
                  paddingHorizontal: 18,
                  paddingVertical: 8,
                  marginRight: 8,
                  backgroundColor: item.select ? C.brand5 : C.bg,
                  borderColor: item.select ? C.brand5 : C.border,
                }}
                onPress={() => handleFilterPress(index)}
              >
                <Text size="sm" style={{ color: item.select ? C.white : C.gray30 }}>
                  {item.id === 3 && muscleName ? muscleName : item.title}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Exercise List */}
          <Box className="px-4">
            {exerciseList.length > 0 ? (
              exerciseList.map((item) => (
                <Pressable
                  key={item.id}
                  className="flex-row items-center rounded-md"
                  style={{ backgroundColor: C.surfaceLight, padding: 12, marginBottom: 12 }}
                  onPress={() =>
                    props.navigation.navigate('MigratedExerciseInfo', {
                      mExerciseId: item.id,
                      mExerciseName: item.title,
                    })
                  }
                >
                  {item.exerciseImage ? (
                    <Image source={{ uri: item.exerciseImage }} style={{ width: 64, height: 64, borderRadius: 12 }} contentFit="cover" />
                  ) : (
                    <Box style={{ width: 64, height: 64, borderRadius: 12, backgroundColor: C.surfaceLight }} />
                  )}
                  <Text weight="medium" className="flex-1 text-foreground" style={{ marginLeft: 12 }}>{item.title}</Text>
                </Pressable>
              ))
            ) : (
              !isLoading && (
                <Box className="items-center" style={{ paddingVertical: 60 }}>
                  <Icon name="search-outline" size={64} color={C.gray50} />
                  <Text weight="medium" style={{ color: C.gray30, marginTop: 12 }}>No se encontraron ejercicios</Text>
                </Box>
              )
            )}
          </Box>
        </ScrollView>

        {isLoading && (
          <Box
            className="items-center justify-center"
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)' }}
          >
            <Spinner size="large" color={C.orange} />
          </Box>
        )}
      </Box>

      {/* Bottom Sheet para filtros */}
      <Actionsheet isOpen={showBottomSheet} onClose={() => setShowBottomSheet(false)}>
        <ActionsheetBackdrop />
        <ActionsheetContent
          className="items-stretch bg-card"
          style={{ borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 24, maxHeight: '60%' }}
        >
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          <Text weight="bold" size="xl" className="text-foreground" style={{ marginBottom: 16 }}>
            {bottomSheetListId === 1 ? 'Equipamiento' : bottomSheetListId === 4 ? 'Tipo de ejercicio' : 'Niveles'}
          </Text>
          <ScrollView style={{ maxHeight: 400 }}>
            {(bottomSheetListId === 1 ? equipmentList : bottomSheetListId === 4 ? EXERCISE_TYPES : levelList).map((item) => (
              <Pressable
                key={item.id}
                className="border-b border-border"
                style={{ paddingVertical: 14 }}
                onPress={() => handleBottomSheetApply([item.id])}
              >
                <Text className="text-foreground">{item.title}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </ActionsheetContent>
      </Actionsheet>

      <MuscleFilterSheet
        visible={showMuscleSheet}
        onClose={() => setShowMuscleSheet(false)}
        selectedId={muscleId}
        onSelect={handleMuscleSelect}
      />
    </SafeAreaView>
  );
}

