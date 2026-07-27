import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, FONT } from './theme';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { dietApi } from '../../api/diet';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

function DietCategoryComponent({ item, onCall }: { item: any; onCall?: () => void }) {
  return (
    <TouchableOpacity style={styles.categoryCard} activeOpacity={0.8} onPress={onCall}>
      <Image
        source={{ uri: item.image || '' }}
        style={styles.categoryImage}
        resizeMode="cover"
      />
      <View style={styles.categoryOverlay}>
        <Text style={styles.categoryTitle}>{item.title || 'Category'}</Text>
        <Text style={styles.categoryCount}>{item.count || 0} items</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function ViewDietCategoryScreen(props: any) {
  const [dietCategoryList, setDietCategoryList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [numPage, setNumPage] = useState(1);
  const [isLastPage, setIsLastPage] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    getDietCategoryData();
  }, []);

  const getDietCategoryData = async () => {
    setIsLoading(true);
    try {
      const value = await dietApi.getCategories(page);
      const items = (value.data.data ?? []).map((cat) => ({
        id: cat.id,
        title: cat.title,
        image: cat.category_image,
        // The categorydiet-list endpoint doesn't return an item count per
        // category, so this stays at 0 (not derived from real backend data).
        count: 0,
      }));
      setNumPage((value.data as any).pagination?.totalPages ?? 1);
      if (page === 1) setDietCategoryList(items);
      else setDietCategoryList((prev) => [...prev, ...items]);
      setIsLoading(false);
    } catch (e) {
      setIsLastPage(true);
      setIsLoading(false);
    }
  };

  const handleScroll = ({ nativeEvent }: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
    const isAtEnd = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
    if (isAtEnd && !isLastPage && !isLoading && page < numPage) {
      setPage(page + 1);
      getDietCategoryData();
    }
  };

  const handleCategoryPress = (item: any) => {
    props.navigation.navigate('MigratedViewAllDiet', {
      mTitle: item.title || '',
      isCategory: true,
      mCategoryId: item.id,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => props.navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={C.gray80} />
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>Diet Categories</Text>
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.grid}>
          {dietCategoryList.map((item, index) => (
            <DietCategoryComponent
              key={item.id || index}
              item={item}
              onCall={() => handleCategoryPress(item)}
            />
          ))}
        </View>
      </ScrollView>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={C.brand5} />
        </View>
      )}
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
  appBarTitle: { fontSize: 20, fontFamily: FONT.bold, color: C.gray80 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 4 },
  grid: {
    gap: 16,
  },
  categoryCard: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
  },
  categoryImage: { width: '100%', height: '100%' },
  categoryOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryTitle: { fontSize: 16, fontFamily: FONT.semiBold, color: C.white },
  categoryCount: { fontSize: 12, color: C.gray20, fontFamily: FONT.regular },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
