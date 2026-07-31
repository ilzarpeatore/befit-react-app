import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';

interface ProductModel {
  id?: number;
  title?: string;
  description?: string;
  price?: number;
  productImage?: string;
  affiliateLink?: string;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ProductDetailScreen(props: any) {
  const productModel: ProductModel | undefined = props.route?.params?.productModel;

  const [sheetHeight] = useState(SCREEN_HEIGHT * 0.65);

  const handleBuyNow = () => {
    if (productModel?.affiliateLink) {
      // Open affiliate link in WebView or browser
      Alert.alert('Buy Now', `Opening ${productModel.affiliateLink}`);
      // In a real app: Linking.openURL(productModel.affiliateLink) or navigate to WebView
    }
  };

  return (
    <View style={s.container}>
      <View style={s.imageSection}>
        {productModel?.productImage ? (
          <Image source={{ uri: productModel.productImage }} style={s.heroImage} resizeMode="cover" />
        ) : (
          <View style={[s.heroImage, s.heroPlaceholder]}>
            <Ionicons name="image-outline" size={48} color={C.gray50} />
          </View>
        )}
        <TouchableOpacity style={s.backBtn} onPress={() => props.navigation?.goBack()}>
          <Ionicons name="chevron-back" size={28} color={C.brand5} />
        </TouchableOpacity>
      </View>
      <View style={s.detailSheet}>
        <View style={s.handle} />
        <ScrollView contentContainerStyle={s.detailContent}>
          <Text style={s.productTitle}>{productModel?.title ?? 'Product'}</Text>
          <Text style={s.productPrice}>${productModel?.price?.toFixed(2) ?? '0.00'}</Text>
          <View style={s.divider} />
          {productModel?.description ? (
            <Text style={s.productDescription}>{productModel.description}</Text>
          ) : null}
          <View style={{ height: 80 }} />
        </ScrollView>
      </View>
      <View style={s.footer}>
        <TouchableOpacity style={s.buyBtn} onPress={handleBuyNow}>
          <Text style={s.buyBtnText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  imageSection: { height: SCREEN_HEIGHT * 0.38 },
  heroImage: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 0.38 },
  heroPlaceholder: { backgroundColor: C.surfaceLight, alignItems: 'center', justifyContent: 'center' },
  backBtn: { position: 'absolute', top: 48, left: 12, padding: 8 },
  detailSheet: {
    flex: 1,
    backgroundColor: C.bg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
  },
  handle: { width: 40, height: 4, backgroundColor: C.gray60, borderRadius: 2, alignSelf: 'center', marginTop: 12 },
  detailContent: { padding: 16, paddingTop: 12 },
  productTitle: { fontSize: 18, fontFamily: FONT.bold, color: C.white, marginBottom: 8 },
  productPrice: { fontSize: 20, fontFamily: FONT.bold, color: C.brand5, marginBottom: 8 },
  divider: { height: 1, backgroundColor: C.gray70, marginVertical: 12, marginHorizontal: 16 },
  productDescription: { fontSize: 14, fontFamily: FONT.regular, color: C.gray40, lineHeight: 22 },
  footer: { padding: 16, paddingBottom: 32 },
  buyBtn: { backgroundColor: C.brand5, borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  buyBtnText: { fontSize: 16, fontFamily: FONT.semiBold, color: C.white },
});
