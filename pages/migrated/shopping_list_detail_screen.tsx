import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, SafeAreaView, Alert, Modal, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ShoppingListItem {
  id?: number;
  ingredientTitle?: string;
  customItemName?: string;
  manuallyAdded?: boolean;
  isChecked?: boolean;
  displayQuantity?: number;
  displayUnitSymbol?: string;
}

interface ShoppingListItemByCategory {
  ingredientCategoryTitle?: string;
  items?: ShoppingListItem[];
}

interface ShoppingListDetailData {
  id?: number;
  userId?: number;
  dailyPlanId?: number;
  title?: string;
  startDate?: string;
  endDate?: string;
  servings?: number;
  status?: number;
  itemsCount?: number;
  createdAt?: string;
  updatedAt?: string;
  items?: ShoppingListItem[];
  itemsByCategory?: ShoppingListItemByCategory[];
}

interface MeasurementUnit {
  id: number;
  title?: string;
  symbol?: string;
}

export default function ShoppingListDetailScreen(props: any) {
  const shoppingListId = props.route?.params?.shoppingListId ?? 0;
  const [isLoading, setIsLoading] = useState(true);
  const [detailData, setDetailData] = useState<ShoppingListDetailData | null>(null);
  const [showByCategory, setShowByCategory] = useState(false);
  const [checkedMap, setCheckedMap] = useState<Map<number, boolean>>(new Map());
  const [showAddSheet, setShowAddSheet] = useState(false);
  const styles = useStyle();

  useEffect(() => {
    fetchDetail();
  }, []);

  const fetchDetail = useCallback(async () => {
    setIsLoading(true);
    try {
      // const value = await getShoppingListDetailApi({ id: shoppingListId });
      // setDetailData(value.data);
      // Initialize checked map
      const newMap = new Map<number, boolean>();
      // for (const item of value.data?.items ?? []) {
      //   if (item.id != null) newMap.set(item.id, item.isChecked ?? false);
      // }
      setCheckedMap(newMap);
    } catch (e: any) {
      // toast(e.toString());
    } finally {
      setIsLoading(false);
    }
  }, [shoppingListId]);

  const toggleItem = async (item: ShoppingListItem) => {
    if (item.id == null) return;
    const newStatus = !(checkedMap.get(item.id!) ?? false);
    const prevMap = new Map(checkedMap);
    setCheckedMap((prev) => {
      const newMap = new Map(prev);
      newMap.set(item.id!, newStatus);
      return newMap;
    });
    try {
      // await shoppingListItemToggleApi({ item_id: item.id, is_checked: newStatus ? 1 : 0 });
    } catch (e) {
      setCheckedMap(prevMap);
    }
  };

  const handleMenuAction = (value: number) => {
    if (value === 1) {
      setShowByCategory((prev) => !prev);
    } else if (value === 2) {
      // Edit list
      if (detailData) {
        props.navigation.navigate('MigratedAddShoppingList', { shoppingList: detailData });
      }
    } else if (value === 3) {
      // Delete list
      Alert.alert(
        'Delete Shopping List',
        'Are you sure you want to delete this shopping list?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                // await deleteShoppingListApi({ id: detailData?.id });
                props.navigation.goBack(true);
              } catch (e: any) {
                // toast(e.toString());
              }
            },
          },
        ]
      );
    }
  };

  const buildItem = (item: ShoppingListItem) => {
    const checked = checkedMap.get(item.id!) ?? (item.isChecked === true);
    const itemName = item.manuallyAdded === true ? (item.customItemName ?? '') : (item.ingredientTitle ?? '');
    const quantityText = `${item.displayQuantity ?? ''} ${item.displayUnitSymbol ?? ''}`.trim();

    return (
      <TouchableOpacity
        key={item.id}
        style={s.itemRow}
        onPress={() => toggleItem(item)}
        activeOpacity={0.7}
      >
        <View style={[s.checkbox, checked && s.checkboxChecked]}>
          {checked && <Ionicons name="checkmark" size={16} color={C.white} />}
        </View>
        <Text
          style={[
            s.itemName,
            styles.fontRegular,
            checked && s.itemNameChecked,
          ]}
        >
          {itemName}
        </Text>
        <Text
          style={[
            s.itemQuantity,
            styles.fontBold,
            checked && s.itemNameChecked,
          ]}
        >
          {quantityText}
        </Text>
      </TouchableOpacity>
    );
  };

  const buildItemsList = () => {
    const items = detailData?.items;
    if (!items || items.length === 0) {
      return (
        <View style={s.emptyContainer}>
          <Ionicons name="cart-outline" size={64} color={C.gray50} />
          <Text style={[s.emptyText, styles.fontMedium]}>No items found</Text>
        </View>
      );
    }
    return (
      <ScrollView contentContainerStyle={s.listContent}>
        {items.map((item) => buildItem(item))}
      </ScrollView>
    );
  };

  const buildItemsByCategory = () => {
    const categories = detailData?.itemsByCategory;
    if (!categories || categories.length === 0) {
      return (
        <View style={s.emptyContainer}>
          <Ionicons name="cart-outline" size={64} color={C.gray50} />
          <Text style={[s.emptyText, styles.fontMedium]}>No items found</Text>
        </View>
      );
    }
    return (
      <ScrollView contentContainerStyle={s.listContent}>
        {categories.map((category, index) => (
          <View key={index}>
            <Text style={[s.categoryTitle, styles.fontBold]}>
              {category.ingredientCategoryTitle || 'Custom'}
            </Text>
            {(category.items ?? []).map((item) => buildItem(item))}
            <View style={{ height: 16 }} />
          </View>
        ))}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => props.navigation.goBack()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color={C.white} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, styles.fontBold]} numberOfLines={1}>
          {detailData?.title ?? 'Shopping List'}
        </Text>
        <TouchableOpacity style={s.moreBtn} onPress={() => handleMenuAction(1)}>
          <Ionicons name="ellipsis-vertical" size={22} color={C.white} />
        </TouchableOpacity>
      </View>

      {/* Simple menu actions */}
      <View style={s.menuActions}>
        <TouchableOpacity style={s.menuAction} onPress={() => handleMenuAction(1)}>
          <Ionicons name={showByCategory ? 'list' : 'grid-outline'} size={20} color={C.white} />
          <Text style={[s.menuActionText, styles.fontRegular]}>{showByCategory ? 'Simple List' : 'Categorized'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.menuAction} onPress={() => handleMenuAction(2)}>
          <Ionicons name="create-outline" size={20} color={C.white} />
          <Text style={[s.menuActionText, styles.fontRegular]}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.menuAction} onPress={() => handleMenuAction(3)}>
          <Ionicons name="trash-outline" size={20} color={C.red} />
          <Text style={[s.menuActionText, styles.fontRegular, { color: C.red }]}>Delete</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color={C.orange} />
        </View>
      ) : !detailData ? (
        <View style={s.emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color={C.gray50} />
          <Text style={[s.emptyText, styles.fontMedium]}>No data</Text>
        </View>
      ) : showByCategory ? (
        buildItemsByCategory()
      ) : (
        buildItemsList()
      )}

      {/* Add Item Button */}
      <View style={s.bottomBar}>
        <TouchableOpacity style={s.addBtn} onPress={() => setShowAddSheet(true)}>
          <Text style={[s.addBtnText, styles.fontSemiBold]}>Add Item</Text>
        </TouchableOpacity>
      </View>

      {/* Add Item Bottom Sheet */}
      <AddItemSheet
        visible={showAddSheet}
        onClose={() => setShowAddSheet(false)}
        shoppingListId={shoppingListId}
        onAdded={() => {
          setShowAddSheet(false);
          fetchDetail();
        }}
      />
    </SafeAreaView>
  );
}

function AddItemSheet({
  visible,
  onClose,
  shoppingListId,
  onAdded,
}: {
  visible: boolean;
  onClose: () => void;
  shoppingListId: number;
  onAdded: () => void;
}) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [units, setUnits] = useState<MeasurementUnit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<MeasurementUnit | null>(null);
  const [loadingUnits, setLoadingUnits] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const styles = useStyle();

  useEffect(() => {
    if (visible) loadUnits();
  }, [visible]);

  const loadUnits = async () => {
    setLoadingUnits(true);
    try {
      // const res = await getMeasurementUnitsApi();
      // setUnits(res.data ?? []);
      // setSelectedUnit(res.data?.[0] ?? null);
    } catch (e) {
      // toast(e.toString());
    } finally {
      setLoadingUnits(false);
    }
  };

  const submit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter an item name');
      return;
    }
    setSubmitting(true);
    try {
      const req: any = {
        shopping_list_id: shoppingListId,
        custom_item_name: name.trim(),
      };
      if (quantity.trim()) req.display_quantity = parseFloat(quantity.trim());
      if (selectedUnit) req.measurement_unit_id = selectedUnit.id;
      // await addShoppingListItemApi(req);
      onAdded();
    } catch (e: any) {
      // toast(e.toString());
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={sAdd.modalOverlay} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={sAdd.sheetContainer}
        >
          <Pressable style={sAdd.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={sAdd.handle} />
            <View style={sAdd.headerRow}>
              <View style={sAdd.headerIcon}>
                <Ionicons name="add" size={24} color={C.textPrimary} />
              </View>
              <View style={sAdd.headerTextWrap}>
                <Text style={[sAdd.sheetTitle, styles.fontBold]}>Add Item</Text>
                <Text style={[sAdd.sheetSubtitle, styles.fontRegular]}>Add a new item to your shopping list</Text>
              </View>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color={C.gray30} />
              </TouchableOpacity>
            </View>

            <View style={sAdd.divider} />

            {loadingUnits ? (
              <ActivityIndicator size="large" color={C.orange} style={{ padding: 32 }} />
            ) : (
              <View style={sAdd.form}>
                <Text style={[sAdd.label, styles.fontBold]}>Item</Text>
                <TextInput
                  style={[sAdd.input, styles.fontRegular]}
                  placeholder="Enter item name"
                  placeholderTextColor={C.gray50}
                  value={name}
                  onChangeText={setName}
                />

                <Text style={[sAdd.label, styles.fontBold]}>Quantity</Text>
                <View style={sAdd.quantityRow}>
                  <TextInput
                    style={[sAdd.quantityInput, styles.fontRegular]}
                    placeholder="Quantity"
                    placeholderTextColor={C.gray50}
                    value={quantity}
                    onChangeText={setQuantity}
                    keyboardType="decimal-pad"
                  />
                  <View style={sAdd.unitDropdown}>
                    <Text style={[sAdd.unitText, styles.fontRegular]}>
                      {selectedUnit ? `${selectedUnit.title ?? ''} (${selectedUnit.symbol ?? ''})` : 'None'}
                    </Text>
                  </View>
                </View>

                <View style={sAdd.buttonRow}>
                  <TouchableOpacity style={sAdd.cancelBtn} onPress={onClose}>
                    <Text style={[sAdd.cancelBtnText, styles.fontRegular]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[sAdd.addBtn, submitting && { opacity: 0.6 }]}
                    onPress={submit}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <ActivityIndicator size="small" color={C.white} />
                    ) : (
                      <Text style={[sAdd.addBtnText, styles.fontSemiBold]}>Add</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  backBtn: { width: 40, alignItems: 'center' },
  headerTitle: { fontSize: 18, color: C.white, flex: 1, textAlign: 'center' },
  moreBtn: { width: 40, alignItems: 'center' },
  menuActions: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.border },
  menuAction: { flexDirection: 'row', alignItems: 'center', padding: 8, gap: 4 },
  menuActionText: { fontSize: 13, color: C.gray30 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: C.gray30, marginTop: 12 },
  listContent: { padding: 16, paddingBottom: 90 },
  categoryTitle: { fontSize: 18, color: C.white, marginBottom: 12 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 12,
    backgroundColor: C.surfaceLight,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: `${C.border}80`,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: C.gray50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: { backgroundColor: C.brand5, borderColor: C.brand5 },
  itemName: { flex: 1, fontSize: 15, color: C.white },
  itemNameChecked: { textDecorationLine: 'line-through', color: C.gray40 },
  itemQuantity: { fontSize: 15, color: C.white, marginLeft: 8 },
  bottomBar: { padding: 16, paddingBottom: 24 },
  addBtn: { backgroundColor: C.brand5, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  addBtnText: { fontSize: 16, color: C.white },
});

const sAdd = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheetContainer: { justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: C.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 20,
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: C.gray60, alignSelf: 'center', marginTop: 10 },
  headerRow: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: `${C.brand5}1F`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextWrap: { flex: 1, marginLeft: 14 },
  sheetTitle: { fontSize: 18, color: C.white },
  sheetSubtitle: { fontSize: 13, color: C.gray30, marginTop: 4 },
  divider: { height: 1, backgroundColor: C.border, marginHorizontal: 20 },
  form: { padding: 20 },
  label: { fontSize: 15, color: C.white, marginBottom: 8 },
  input: {
    backgroundColor: C.surfaceLight,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
    color: C.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 16,
  },
  quantityRow: { flexDirection: 'row', marginBottom: 24 },
  quantityInput: {
    width: 140,
    backgroundColor: C.surfaceLight,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
    color: C.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    marginRight: 16,
  },
  unitDropdown: {
    flex: 1,
    backgroundColor: C.surfaceLight,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  unitText: { fontSize: 15, color: C.white },
  buttonRow: { flexDirection: 'row', gap: 16 },
  cancelBtn: {
    flex: 1,
    backgroundColor: C.surfaceLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${C.border}80`,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelBtnText: { fontSize: 15, color: C.white },
  addBtn: {
    flex: 1,
    backgroundColor: C.brand5,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addBtnText: { fontSize: 15, color: C.white },
});

function useStyle() {
  return useResponsiveStyleSheet({
    fontBold: { fontFamily: FONT.bold },
    fontMedium: { fontFamily: FONT.medium },
    fontRegular: { fontFamily: FONT.regular },
    fontSemiBold: { fontFamily: FONT.semiBold },
  });
}
