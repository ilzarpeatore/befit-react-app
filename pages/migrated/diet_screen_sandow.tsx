import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, FlatList, SafeAreaView, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';
import { dietApi } from '../../api/diet';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface DietModel {
  id?: number;
  title?: string;
  dietImage?: string;
  calories?: string;
  carbs?: string;
  fat?: string;
  protein?: string;
  isFavourite?: number;
  [key: string]: any;
}

interface DietScreenSandowProps {
  navigation: any;
}

// NOTE: the legacy "Diet" model (backend) has no meal-type field — only categorydiet_id,
// is_featured, is_premium and title are filterable (see api/diet.ts + DietController::getList).
// These chips are kept as a purely visual/decorative filter (selection state only) since
// there is no real backend counterpart for "Breakfast/Lunch/Dinner/Snacks/Protein" on Diet.
const CHIPS = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Protein'];

export default function DietScreenSandow(props: DietScreenSandowProps) {
  const [mSearch, setMSearch] = useState('');
  const [mDietList, setMDietList] = useState<DietModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [numPage, setNumPage] = useState<number | null>(null);
  const [isLastPage, setIsLastPage] = useState(false);
  const [selectedChip, setSelectedChip] = useState('All');
  const scrollController = useRef<FlatList | null>(null);

  const getDietData = useCallback(
    async (opts?: { pagination?: boolean; page?: number; search?: string }) => {
      const targetPage = opts?.page ?? page;
      const targetSearch = opts?.search ?? mSearch;
      if (!opts?.pagination) setIsLoading(true);
      try {
        const res = targetSearch
          ? await dietApi.search(targetSearch, targetPage)
          : await dietApi.getList({ page: targetPage });
        const list: DietModel[] = (res.data.data ?? []).map((d: any) => ({
          id: d.id,
          title: d.title,
          dietImage: d.diet_image,
          calories: d.calories,
          carbs: d.carbs,
          fat: d.fat,
          protein: d.protein,
          isFavourite: d.is_favourite,
        }));
        setMDietList((prev) => (targetPage === 1 ? list : [...prev, ...list]));
        const totalPages = res.data.pagination?.total_pages ?? null;
        setNumPage(totalPages);
        setIsLastPage(totalPages ? targetPage >= totalPages : list.length === 0);
      } catch (e: any) {
        console.log(e);
      } finally {
        setIsLoading(false);
      }
    },
    [page, mSearch]
  );

  useEffect(() => {
    getDietData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEndReached = () => {
    if (!isLastPage && !isLoading) {
      setPage((prev) => {
        const nextPage = prev + 1;
        getDietData({ pagination: true, page: nextPage });
        return nextPage;
      });
    }
  };

  const handleClearSearch = () => {
    setMSearch('');
    setPage(1);
    getDietData({ page: 1, search: '' });
  };

  const handleSearchSubmit = () => {
    setPage(1);
    getDietData({ page: 1, search: mSearch });
  };

  const renderChip = (label: string) => {
    const isSelected = label === selectedChip;
    return (
      <TouchableOpacity
        key={label}
        style={[localStyles.chip, isSelected && localStyles.chipSelected]}
        onPress={() => setSelectedChip(label)}
      >
        <Text style={[localStyles.chipText, isSelected && localStyles.chipTextSelected]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderDietCard = ({ item }: { item: DietModel }) => (
    <TouchableOpacity
      style={localStyles.dietCard}
      onPress={() => props.navigation.navigate('MigratedDietDetail', { dietModel: item })}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.dietImage || '' }} style={localStyles.dietImage} />
      <View style={localStyles.dietInfo}>
        <Text style={localStyles.dietTitle} numberOfLines={1}>{item.title || ''}</Text>
        <Text style={localStyles.dietCalories}>{item.calories || '0'} kcal</Text>
        <View style={localStyles.nutrientRow}>
          <Nutrient label="P" value={`${item.protein || '0'}g`} />
          <Nutrient label="C" value={`${item.carbs || '0'}g`} />
          <Nutrient label="F" value={`${item.fat || '0'}g`} />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={localStyles.container}>
      <View style={localStyles.appBar}>
        <Text style={localStyles.appBarTitle}>Nutrition</Text>
        <TouchableOpacity
          style={localStyles.favBtn}
          onPress={() => props.navigation.navigate('MigratedFavourite', { index: 1 })}
        >
          <Ionicons name="heart-outline" size={20} color={C.gray40} />
        </TouchableOpacity>
      </View>

      <View style={localStyles.body}>
        {/* Search Bar */}
        <View style={localStyles.searchContainer}>
          <View style={localStyles.searchBox}>
            <Ionicons name="search" size={20} color={C.gray40} />
            <TextInput
              style={localStyles.searchInput}
              placeholder="Search diets..."
              placeholderTextColor={C.gray40}
              value={mSearch}
              onChangeText={setMSearch}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
            />
            {mSearch.length > 0 && (
              <TouchableOpacity onPress={handleClearSearch}>
                <Ionicons name="close" size={18} color={C.gray40} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Category Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={localStyles.chipsContainer}
        >
          {CHIPS.map(renderChip)}
        </ScrollView>

        {/* Diet List */}
        <FlatList
          ref={scrollController}
          data={mDietList}
          renderItem={renderDietCard}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
          ListEmptyComponent={
            !isLoading ? (
              <View style={localStyles.emptyContainer}>
                <Text style={localStyles.emptyText}>No diets found</Text>
              </View>
            ) : null
          }
          ListFooterComponent={
            isLoading ? (
              <ActivityIndicator size="small" color={C.orange} style={{ padding: 16 }} />
            ) : null
          }
        />
      </View>
    </SafeAreaView>
  );
}

function Nutrient({ label, value }: { label: string; value: string }) {
  return (
    <View style={localStyles.nutrientItem}>
      <Text style={localStyles.nutrientLabel}>{label}</Text>
      <Text style={localStyles.nutrientValue}>{value}</Text>
    </View>
  );
}

const localStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: C.bg,
  },
  appBarTitle: {
    fontFamily: FONT.bold,
    fontSize: 20,
    color: C.white,
  },
  favBtn: {
    padding: 10,
    backgroundColor: C.surfaceLight,
    borderRadius: 12,
  },
  body: { flex: 1 },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surfaceLight,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: 14,
    color: C.white,
    marginLeft: 8,
  },
  chipsContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  chip: {
    marginRight: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: C.surfaceLight,
  },
  chipSelected: {
    backgroundColor: C.orange,
  },
  chipText: {
    fontFamily: FONT.medium,
    fontSize: 13,
    color: C.gray40,
  },
  chipTextSelected: {
    color: C.white,
  },
  dietCard: {
    flexDirection: 'row',
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  dietImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: C.gray70,
  },
  dietInfo: {
    flex: 1,
    marginLeft: 14,
  },
  dietTitle: {
    fontFamily: FONT.semiBold,
    fontSize: 15,
    color: C.white,
  },
  dietCalories: {
    fontFamily: FONT.medium,
    fontSize: 12,
    color: C.orange,
    marginTop: 4,
  },
  nutrientRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  nutrientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  nutrientLabel: {
    fontFamily: FONT.semiBold,
    fontSize: 11,
    color: C.gray40,
  },
  nutrientValue: {
    fontFamily: FONT.regular,
    fontSize: 11,
    color: C.gray20,
    marginLeft: 4,
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
    color: C.gray40,
  },
});
