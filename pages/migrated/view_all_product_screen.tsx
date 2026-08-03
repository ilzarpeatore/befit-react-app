import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, FONT } from './theme';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

function ProductComponent({ item, onCall }: { item: any; onCall?: () => void }) {
  return (
    <TouchableOpacity style={styles.productCard} activeOpacity={0.8} onPress={onCall}>
      <Image
        source={{ uri: item.image || '' }}
        style={styles.productImage}
        resizeMode="cover"
      />
      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={2}>{item.name || 'Product'}</Text>
        <Text style={styles.productPrice}>${item.price?.toFixed(2) || '0.00'}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function ViewAllProductScreen(props: any) {
  const {
    isCategory = false,
    id,
    title = '',
  } = props.route?.params || {};

  const [productList, setProductList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [numPage, setNumPage] = useState(1);
  const [isLastPage, setIsLastPage] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    getAllProductData();
  }, []);

  const getAllProductData = async () => {
    setIsLoading(true);
    try {
      // const value = await getProductApi({ page, isCategory, productId: id });
      // setNumPage(value.pagination.totalPages);
      // if (page === 1) setProductList([]);
      // setProductList(prev => [...prev, ...value.data]);
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
      getAllProductData();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => props.navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={C.white} />
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>
          {isCategory ? title : 'Product List'}
        </Text>
      </View>

      {productList.length > 0 ? (
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          <View style={styles.productGrid}>
            {productList.map((item, index) => (
              <ProductComponent
                key={item.id || index}
                item={item}
                onCall={() => {
                  getAllProductData();
                }}
              />
            ))}
          </View>
        </ScrollView>
      ) : isLoading ? (
        <ActivityIndicator size="large" color={C.orange} style={{ marginTop: 60 }} />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No results found</Text>
        </View>
      )}

      {isLoading && productList.length > 0 && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={C.orange} />
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
  appBarTitle: { fontSize: 20, fontFamily: FONT.bold, color: C.white },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 16 },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingTop: 4,
  },
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: C.surfaceLight,
    borderRadius: 12,
    overflow: 'hidden',
  },
  productImage: { width: '100%', height: CARD_WIDTH },
  productInfo: { padding: 10 },
  productTitle: { fontSize: 13, fontFamily: FONT.semiBold, color: C.white, marginBottom: 4 },
  productPrice: { fontSize: 14, fontFamily: FONT.bold, color: C.textPrimary },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 14, color: C.gray30, fontFamily: FONT.regular },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
