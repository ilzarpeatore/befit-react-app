import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Modal, Pressable, ActivityIndicator, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ShoppingListData {
  id?: number;
  title?: string;
  itemsCount?: number;
  startDate?: string;
  endDate?: string;
}

export default function ShoppingListScreen(props: any) {
  const [shoppingLists, setShoppingLists] = useState<ShoppingListData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [isLastPage, setIsLastPage] = useState(false);
  const [showGenerateSheet, setShowGenerateSheet] = useState(false);
  const [selectedOption, setSelectedOption] = useState(0); // 0=Date, 1=Date range
  const styles = useStyle();

  useEffect(() => {
    fetchShoppingLists();
  }, []);

  const fetchShoppingLists = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setPage(1);
      setShoppingLists([]);
      setIsLastPage(false);
    }
    if (isLastPage && !isRefresh) return;
    if (!isRefresh) setIsLoading(true);
    try {
      // const value = await getShoppingListApi({ page: isRefresh ? 1 : page });
      // if (value.data) {
      //   setShoppingLists((prev) => isRefresh ? value.data! : [...prev, ...value.data!]);
      //   setIsLastPage(value.data!.length < 10);
      //   setPage((p) => p + 1);
      // }
    } catch (e: any) {
      // toast(e.toString());
    } finally {
      setIsLoading(false);
    }
  }, [page, isLastPage]);

  const openAddListScreen = (isSpecificDate: boolean) => {
    setShowGenerateSheet(false);
    props.navigation.navigate('MigratedAddShoppingList', { isDefaultSpecificDate: isSpecificDate });
  };

  const openDetail = (list: ShoppingListData) => {
    props.navigation.navigate('MigratedShoppingListDetail', { shoppingListId: list.id });
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => props.navigation.goBack()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color={C.white} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, styles.fontBold]}>Shopping Lists</Text>
        <TouchableOpacity onPress={() => setShowGenerateSheet(true)} style={s.backBtn}>
          <Ionicons name="add" size={28} color={C.white} />
        </TouchableOpacity>
      </View>

      <View style={s.body}>
        {isLoading && shoppingLists.length === 0 ? (
          <View style={s.loadingContainer}>
            <ActivityIndicator size="large" color={C.orange} />
          </View>
        ) : shoppingLists.length === 0 ? (
          <View style={s.emptyContainer}>
            <Ionicons name="cart-outline" size={64} color={C.gray50} />
            <Text style={[s.emptyText, styles.fontMedium]}>No shopping lists found</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={s.listContent}>
            {shoppingLists.map((list) => (
              <TouchableOpacity
                key={list.id}
                style={s.listCard}
                onPress={() => openDetail(list)}
                activeOpacity={0.7}
              >
                <View style={s.listCardContent}>
                  <View style={s.listTextWrap}>
                    <Text style={[s.listTitle, styles.fontBold]}>{list.title}</Text>
                    <Text style={[s.listSubtitle, styles.fontRegular]}>{list.itemsCount ?? 0} items</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={C.gray40} />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Generate Bottom Sheet */}
      <Modal visible={showGenerateSheet} transparent animationType="slide">
        <Pressable style={s.modalOverlay} onPress={() => setShowGenerateSheet(false)}>
          <Pressable style={s.bottomSheet} onPress={(e) => e.stopPropagation()}>
            <View style={s.sheetHandle} />
            <Text style={[s.sheetTitle, styles.fontBold]}>Generate Shopping List</Text>
            <Text style={[s.sheetSubtitle, styles.fontRegular]}>Choose which planned meals to include</Text>

            {/* Option: Date */}
            <TouchableOpacity
              style={[s.optionCard, selectedOption === 0 && s.optionCardSelected]}
              onPress={() => setSelectedOption(0)}
            >
              <View style={[s.optionIconContainer, selectedOption === 0 && s.optionIconSelected]}>
                <Ionicons name="calendar-outline" size={24} color={selectedOption === 0 ? C.orange : C.gray40} />
              </View>
              <View style={s.optionTextWrap}>
                <Text style={[s.optionTitle, selectedOption === 0 && { color: C.textPrimary }, styles.fontBold]}>Date</Text>
                <Text style={[s.optionSubtitle, styles.fontRegular]}>Select a specific date</Text>
              </View>
              {selectedOption === 0 ? (
                <Ionicons name="checkmark-circle" size={24} color={C.success} />
              ) : (
                <Ionicons name="chevron-forward" size={24} color={C.gray40} />
              )}
            </TouchableOpacity>

            {/* Option: Date Range */}
            <TouchableOpacity
              style={[s.optionCard, selectedOption === 1 && s.optionCardSelected]}
              onPress={() => setSelectedOption(1)}
            >
              <View style={[s.optionIconContainer, selectedOption === 1 && s.optionIconSelected]}>
                <Ionicons name="calendar-outline" size={24} color={selectedOption === 1 ? C.orange : C.gray40} />
              </View>
              <View style={s.optionTextWrap}>
                <Text style={[s.optionTitle, selectedOption === 1 && { color: C.textPrimary }, styles.fontBold]}>Date Range</Text>
                <Text style={[s.optionSubtitle, styles.fontRegular]}>Pick start and end dates</Text>
              </View>
              {selectedOption === 1 ? (
                <Ionicons name="checkmark-circle" size={24} color={C.success} />
              ) : (
                <Ionicons name="chevron-forward" size={24} color={C.gray40} />
              )}
            </TouchableOpacity>

            {/* Continue Button */}
            <TouchableOpacity style={s.continueBtn} onPress={() => openAddListScreen(selectedOption === 0)}>
              <Text style={[s.continueBtnText, styles.fontSemiBold]}>Continue</Text>
            </TouchableOpacity>

            {/* Cancel */}
            <TouchableOpacity style={s.cancelBtn} onPress={() => setShowGenerateSheet(false)}>
              <Text style={[s.cancelBtnText, styles.fontRegular]}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  backBtn: { width: 40, alignItems: 'center' },
  headerTitle: { fontSize: 18, color: C.white, flex: 1, textAlign: 'center' },
  body: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: C.gray30, marginTop: 12 },
  listContent: { padding: 16 },
  listCard: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: C.surfaceLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${C.border}80`,
  },
  listCardContent: { flexDirection: 'row', alignItems: 'center' },
  listTextWrap: { flex: 1 },
  listTitle: { fontSize: 16, color: C.white },
  listSubtitle: { fontSize: 14, color: C.gray30, marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  bottomSheet: {
    backgroundColor: C.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: C.gray60, alignSelf: 'center', marginBottom: 16 },
  sheetTitle: { fontSize: 24, color: C.white },
  sheetSubtitle: { fontSize: 16, color: C.gray30, marginTop: 8, marginBottom: 24 },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: `${C.border}80`,
    backgroundColor: C.surfaceLight,
    marginBottom: 16,
  },
  optionCardSelected: {
    borderColor: C.brand5,
    backgroundColor: `${C.brand5}1A`,
  },
  optionIconContainer: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: C.bg,
  },
  optionIconSelected: { backgroundColor: `${C.brand5}33` },
  optionTextWrap: { flex: 1, marginLeft: 20 },
  optionTitle: { fontSize: 18, color: C.white },
  optionSubtitle: { fontSize: 14, color: C.gray30, marginTop: 4 },
  continueBtn: {
    backgroundColor: C.brand5,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  continueBtnText: { fontSize: 16, color: C.white },
  cancelBtn: { alignItems: 'center', paddingVertical: 12 },
  cancelBtnText: { fontSize: 16, color: C.gray30 },
});

function useStyle() {
  return useResponsiveStyleSheet({
    fontBold: { fontFamily: FONT.bold },
    fontMedium: { fontFamily: FONT.medium },
    fontRegular: { fontFamily: FONT.regular },
    fontSemiBold: { fontFamily: FONT.semiBold },
  });
}
