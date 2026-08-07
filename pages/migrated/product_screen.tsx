import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList, ActivityIndicator, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';
import logger from '@helper/logger';

interface ProductCategory {
  id?: number;
  title?: string;
  productcategoryImage?: string;
}

interface Product {
  id?: number;
  title?: string;
  price?: number;
  productImage?: string;
  description?: string;
  affiliateLink?: string;
}

export default function ProductScreen(props: any) {
  const [categoryList, setCategoryList] = useState<ProductCategory[]>([]);
  const [productList, setProductList] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    setIsLoading(true);
    try {
      // API call placeholders
      // const catRes = await getProductCategoryApi();
      // if (catRes.data) setCategoryList(catRes.data);
      // const prodRes = await getProductApi();
      // if (prodRes.data) setProductList(prodRes.data);
    } catch (e) {
      logger.error('Product fetch error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToDetail = (product: Product) => {
    props.navigation?.navigate('MigratedProductDetail', { productModel: product });
  };

  const renderCategoryItem = ({ item }: { item: ProductCategory }) => (
    <TouchableOpacity
      style={[s.categoryItem, selectedCategory === item.id && s.categoryItemActive]}
      onPress={() => setSelectedCategory(item.id ?? null)}
    >
      <View style={[s.categoryIcon, selectedCategory === item.id && s.categoryIconActive]}>
        {item.productcategoryImage ? (
          <Image source={{ uri: item.productcategoryImage }} style={s.categoryImage} />
        ) : (
          <Ionicons name="grid-outline" size={24} color={C.gray30} />
        )}
      </View>
      <Text style={[s.categoryLabel, selectedCategory === item.id && s.categoryLabelActive]} numberOfLines={1}>
        {item.title ?? 'Category'}
      </Text>
    </TouchableOpacity>
  );

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity style={s.productCard} onPress={() => navigateToDetail(item)}>
      <View style={s.productImageContainer}>
        {item.productImage ? (
          <Image source={{ uri: item.productImage }} style={s.productImage} resizeMode="cover" />
        ) : (
          <View style={[s.productImage, s.productImagePlaceholder]}>
            <Ionicons name="image-outline" size={32} color={C.gray50} />
          </View>
        )}
      </View>
      <View style={s.productInfo}>
        <Text style={s.productTitle} numberOfLines={1}>{item.title ?? 'Product'}</Text>
        <Text style={s.productPrice}>${item.price?.toFixed(2) ?? '0.00'}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={s.container}>
      <View style={s.appBar}>
        <TouchableOpacity onPress={() => props.navigation?.goBack()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={s.appBarTitle}>Shop</Text>
        <View style={{ width: 24 }} />
      </View>
      <View style={s.body}>
        <View style={s.categorySection}>
          <FlatList
            data={categoryList.length > 0 ? categoryList : [{ id: 1, title: 'Category' }, { id: 2, title: 'Category' }, { id: 3, title: 'Category' }, { id: 4, title: 'Category' }]}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.categoryList}
            keyExtractor={(item, i) => (item.id?.toString() ?? i.toString())}
            renderItem={renderCategoryItem}
          />
        </View>
        <FlatList
          data={productList.length > 0 ? productList : []}
          numColumns={2}
          contentContainerStyle={s.productList}
          columnWrapperStyle={s.productRow}
          keyExtractor={(item, i) => (item.id?.toString() ?? i.toString())}
          renderItem={renderProductItem}
          ListEmptyComponent={
            !isLoading ? (
              <View style={s.emptyContainer}>
                <Ionicons name="bag-outline" size={64} color={C.gray50} />
                <Text style={s.emptyText}>No products available</Text>
              </View>
            ) : null
          }
        />
        {isLoading && (
          <View style={s.loadingOverlay}>
            <ActivityIndicator size="large" color={C.orange} />
          </View>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  appBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 48, paddingBottom: 12, backgroundColor: C.surface },
  backBtn: { padding: 4 },
  appBarTitle: { fontSize: 18, fontFamily: FONT.bold, color: C.white },
  body: { flex: 1 },
  categorySection: { height: 110 },
  categoryList: { paddingHorizontal: 20, paddingTop: 16 },
  categoryItem: { width: 72, marginRight: 12, alignItems: 'center' },
  categoryItemActive: {},
  categoryIcon: { width: 56, height: 56, borderRadius: 16, backgroundColor: C.surfaceLight, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  categoryIconActive: { borderWidth: 1.5, borderColor: C.brand5 },
  categoryImage: { width: 56, height: 56, borderRadius: 16 },
  categoryLabel: { fontSize: 11, color: C.gray30, marginTop: 6, textAlign: 'center' },
  categoryLabelActive: { color: C.textPrimary },
  productList: { padding: 20 },
  productRow: { justifyContent: 'space-between' },
  productCard: { width: (Dimensions.get('window').width - 52) / 2, backgroundColor: C.surfaceLight, borderRadius: 16, marginBottom: 12, overflow: 'hidden' },
  productImageContainer: { height: 140 },
  productImage: { width: '100%', height: 140 },
  productImagePlaceholder: { backgroundColor: C.gray80, alignItems: 'center', justifyContent: 'center' },
  productInfo: { padding: 10 },
  productTitle: { fontSize: 13, fontFamily: FONT.semiBold, color: C.white, marginBottom: 4 },
  productPrice: { fontSize: 14, fontFamily: FONT.bold, color: C.orange },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyText: { fontSize: 16, fontFamily: FONT.medium, color: C.gray40, marginTop: 16 },
  loadingOverlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
});