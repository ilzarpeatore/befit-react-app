import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';

interface ProductCategoryItem {
  id: number;
  title: string;
  image: string;
  [key: string]: any;
}

export default function ViewProductCategoryScreen(props: any) {
  const [categoryList, setCategoryList] = useState<ProductCategoryItem[]>([]);
  const [page, setPage] = useState(1);
  const [numPage, setNumPage] = useState<number | null>(null);
  const [isLastPage, setIsLastPage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    getProductCategoryData();
  }, []);

  useEffect(() => {
    if (numPage && page > 1) {
      getProductCategoryData();
    }
  }, [page]);

  const getProductCategoryData = async () => {
    setIsLoading(true);
    try {
      // await getProductCategoryApi(page).then((value) => {
      //   setNumPage(value.pagination.totalPages);
      //   setIsLastPage(false);
      //   if (page === 1) setCategoryList([]);
      //   if (value.data) {
      //     setCategoryList((prev) => [...prev, ...value.data]);
      //   }
      // });
    } catch (e) {
      setIsLastPage(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isAtEnd = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
    if (isAtEnd && !isLoading && numPage && page < numPage) {
      setPage((prev) => prev + 1);
    }
  };

  const renderCategoryItem = ({ item, index }: { item: ProductCategoryItem; index: number }) => (
    <TouchableOpacity
      key={item.id?.toString() || index.toString()}
      style={styles.gridItem}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.image }} style={styles.categoryImage} resizeMode="cover" />
      <Text style={styles.categoryTitle} numberOfLines={2}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => props.navigation?.goBack()}>
          <Ionicons name="chevron-back" size={24} color={C.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Category</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.body}>
        {categoryList.length > 0 ? (
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.scrollContent}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.grid}>
              {categoryList.map((item, index) => renderCategoryItem({ item, index }))}
            </View>
          </ScrollView>
        ) : (
          !isLoading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No Data Found</Text>
            </View>
          )
        )}

        {isLoading && (
          <View style={styles.loaderOverlay}>
            <ActivityIndicator size="large" color={C.orange} />
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
  scrollContent: { paddingVertical: 8, paddingBottom: 16 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  gridItem: {
    width: '47%',
    marginBottom: 16,
    backgroundColor: C.surfaceLight,
    borderRadius: 12,
    overflow: 'hidden',
  },
  categoryImage: {
    width: '100%',
    height: 120,
  },
  categoryTitle: {
    fontFamily: FONT.medium,
    fontSize: 14,
    color: C.white,
    padding: 10,
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
