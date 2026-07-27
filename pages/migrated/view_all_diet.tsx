import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, FONT } from './theme';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { dietApi } from '../../api/diet';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function DietItem({ item, onCall }: { item: any; onCall?: () => void }) {
  return (
    <TouchableOpacity style={styles.dietCard} activeOpacity={0.8} onPress={onCall}>
      <Image
        source={{ uri: item.image || '' }}
        style={styles.dietImage}
        resizeMode="cover"
      />
      <View style={styles.dietInfo}>
        <Text style={styles.dietTitle} numberOfLines={2}>{item.title || 'Diet Plan'}</Text>
        <Text style={styles.dietMeta} numberOfLines={1}>
          {item.category || ''} {item.duration ? `â€¢ ${item.duration}` : ''}
        </Text>
        <View style={styles.dietRow}>
          <Ionicons name="flame" size={14} color={C.orange} />
          <Text style={styles.dietCalories}>{item.calories || '0'} kcal</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ViewAllDiet(props: any) {
  const {
    isFeatured = false,
    isCategory = false,
    mCategoryId,
    mTitle = 'Diets',
    isAssign = false,
    isFav = false,
    showAppBar = true,
  } = props.route?.params || {};

  const [dietList, setDietList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [numPage, setNumPage] = useState(1);
  const [isLastPage, setIsLastPage] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    getDietData();
  }, []);

  const getDietData = async (targetPage: number = page) => {
    setIsLoading(true);
    try {
      const res = isFav
        ? await dietApi.getFavourite(targetPage)
        : isAssign
        ? await dietApi.getAssignedDiets(targetPage)
        : await dietApi.getList({
            page: targetPage,
            ...(isFeatured ? { is_featured: true } : {}),
            ...(isCategory && mCategoryId ? { categorydiet_id: mCategoryId } : {}),
          });

      const items = (res.data.data ?? []).map((d: any) => ({
        id: d.id,
        title: d.title,
        image: d.diet_image,
        calories: d.calories,
      }));

      setNumPage(res.data.pagination?.totalPages ?? 1);
      setIsLastPage(targetPage >= (res.data.pagination?.totalPages ?? 1));
      if (targetPage === 1) setDietList(items);
      else setDietList((prev) => [...prev, ...items]);
    } catch (e) {
      setIsLastPage(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!isLastPage && !isLoading && page < numPage) {
      const nextPage = page + 1;
      setPage(nextPage);
      getDietData(nextPage);
    }
  };

  const handleItemCall = (item: any) => {
    props.navigation.navigate('MigratedDietDetail', { dietModel: item });
  };

  const renderEmpty = () => {
    if (isLoading) return <ActivityIndicator size="large" color={C.brand5} style={{ marginTop: 60 }} />;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No results found</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {showAppBar && (
        <View style={styles.appBar}>
          <TouchableOpacity onPress={() => props.navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={C.white} />
          </TouchableOpacity>
          <Text style={styles.appBarTitle}>{mTitle}</Text>
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={dietList}
        keyExtractor={(item, i) => String(item.id || i)}
        renderItem={({ item }) => <DietItem item={item} onCall={() => handleItemCall(item)} />}
        contentContainerStyle={[
          styles.listContent,
          (isFav || isAssign) && { paddingVertical: 16 },
        ]}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={renderEmpty}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    gap: 12,
  },
  appBarTitle: { fontSize: 20, fontFamily: FONT.bold, color: C.white },
  listContent: { paddingHorizontal: 16, paddingVertical: 8 },
  dietCard: {
    backgroundColor: C.surfaceLight,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  dietImage: { width: 110, height: 100 },
  dietInfo: { flex: 1, padding: 12, justifyContent: 'center' },
  dietTitle: { fontSize: 15, fontFamily: FONT.semiBold, color: C.white, marginBottom: 4 },
  dietMeta: { fontSize: 12, color: C.gray30, fontFamily: FONT.regular, marginBottom: 6 },
  dietRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dietCalories: { fontSize: 12, fontFamily: FONT.medium, color: C.orange },
  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 14, color: C.gray30, fontFamily: FONT.regular },
});
