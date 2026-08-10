import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';
import logger from '@helper/logger';
import { dietApi } from '@api/diet';
import { shoppingApi, ShoppingMealType } from '@api/shopping';

export default function AddShoppingListScreen({ navigation, route }: any) {
  const shoppingList = route?.params?.shoppingList;
  const isDefaultSpecificDate = route?.params?.isDefaultSpecificDate ?? true;

  const isEditMode = !!shoppingList;

  const [title, setTitle] = useState('');
  const [isSpecificDate, setIsSpecificDate] = useState(isDefaultSpecificDate);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dateRangeStart, setDateRangeStart] = useState<Date | null>(null);
  const [dateRangeEnd, setDateRangeEnd] = useState<Date | null>(null);
  const [isCompleteOnly, setIsCompleteOnly] = useState(true);
  const [selectedMealTypes, setSelectedMealTypes] = useState<ShoppingMealType[]>([]);
  const [servings, setServings] = useState(1);
  const [dailyPlanId, setDailyPlanId] = useState<number | null>(null);
  const [isFetchingPlan, setIsFetchingPlan] = useState(false);
  const [loading, setLoading] = useState(false);

  const availableMealTypes: { key: ShoppingMealType; label: string }[] = [
    { key: 'breakfast', label: 'Desayuno' },
    { key: 'lunch', label: 'Comida' },
    { key: 'dinner', label: 'Cena' },
    { key: 'snacks', label: 'Snacks' },
  ];

  useEffect(() => {
    setSelectedMealTypes(availableMealTypes.map((t) => t.key));
    prefillForEdit();
  }, []);

  const prefillForEdit = () => {
    if (!shoppingList) {
      fetchDailyPlanId(selectedDate);
      return;
    }
    setTitle(shoppingList.title ?? '');
    if (shoppingList.daily_plan_id) {
      setIsSpecificDate(true);
      setDailyPlanId(shoppingList.daily_plan_id);
      if (shoppingList.start_date) {
        setSelectedDate(new Date(shoppingList.start_date));
      }
    } else {
      setIsSpecificDate(false);
      setServings(shoppingList.servings ?? 1);
      if (shoppingList.start_date && shoppingList.end_date) {
        setDateRangeStart(new Date(shoppingList.start_date));
        setDateRangeEnd(new Date(shoppingList.end_date));
      }
    }
  };

  const fetchDailyPlanId = async (date: Date) => {
    setIsFetchingPlan(true);
    setDailyPlanId(null);
    try {
      const res = await dietApi.getDailyPlan(formatDate(date));
      setDailyPlanId(res.data?.data?.id ?? null);
    } catch (e) {
      logger.error('Error fetching daily plan:', e);
    } finally {
      setIsFetchingPlan(false);
    }
  };

  const formatDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const submit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }
    if (selectedMealTypes.length === 0) {
      Alert.alert('Error', 'Please select at least one meal type');
      return;
    }

    const req: any = {
      title: title.trim(),
      is_complete_only: isCompleteOnly,
      meal_types: selectedMealTypes,
    };

    if (isEditMode) {
      req.shopping_list_id = shoppingList.id;
    }

    if (isSpecificDate) {
      if (dailyPlanId === null && !isFetchingPlan) {
        Alert.alert('Error', 'No daily plan found for this date');
        return;
      }
      if (isFetchingPlan) {
        Alert.alert('Error', 'Please wait for daily plan to load');
        return;
      }
      req.daily_plan_id = dailyPlanId;
    } else {
      if (!dateRangeStart || !dateRangeEnd) {
        Alert.alert('Error', 'Please select a date range');
        return;
      }
      req.start_date = formatDate(dateRangeStart);
      req.end_date = formatDate(dateRangeEnd);
      req.servings = servings;
    }

    setLoading(true);
    try {
      await shoppingApi.generateFromDailyPlan(req);
      setLoading(false);
      navigation.goBack(true);
    } catch (e: any) {
      setLoading(false);
      const msg = e?.response?.data?.message ?? 'Failed to save shopping list';
      Alert.alert('Error', msg);
    }
  };

  const toggleMealType = (key: ShoppingMealType) => {
    setSelectedMealTypes((prev) =>
      prev.includes(key) ? prev.filter((t) => t !== key) : [...prev, key]
    );
  };

  return (
    <View style={styles_local.container}>
      <View style={styles_local.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles_local.backBtn}>
          <Ionicons name="chevron-back" size={24} color={C.white} />
        </TouchableOpacity>
        <Text style={styles_local.headerTitle}>{isEditMode ? 'Edit Shopping List' : 'Add Shopping List'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles_local.body} contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
        {/* Date / Range Selection */}
        <View style={styles_local.card}>
          <View style={styles_local.cardRow}>
            <Text style={styles_local.cardLabel}>Specific Date</Text>
            <Switch
              value={isSpecificDate}
              onValueChange={(value) => {
                setIsSpecificDate(value);
                if (value && !isEditMode) fetchDailyPlanId(selectedDate);
              }}
              trackColor={{ false: C.gray60, true: C.brand5 }}
              thumbColor={C.white}
            />
          </View>

          {isSpecificDate ? (
            <View style={styles_local.cardRow}>
              <Text style={styles_local.cardLabel}>Date</Text>
              <TouchableOpacity style={styles_local.dateBtn}>
                <Text style={styles_local.dateText}>{formatDate(selectedDate)}</Text>
                <Ionicons name="calendar-outline" size={18} color={C.gray30} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles_local.cardRow}>
              <Text style={styles_local.cardLabel}>Date Range</Text>
              <TouchableOpacity style={styles_local.dateBtn}>
                <Text style={styles_local.dateText}>
                  {dateRangeStart && dateRangeEnd
                    ? `${formatDate(dateRangeStart)} - ${formatDate(dateRangeEnd)}`
                    : 'Select Range'}
                </Text>
                <Ionicons name="calendar-outline" size={18} color={C.gray30} />
              </TouchableOpacity>
            </View>
          )}

          {isFetchingPlan && isSpecificDate && (
            <ActivityIndicator size="small" color={C.orange} style={{ marginTop: 8 }} />
          )}
        </View>

        {/* Title */}
        <View style={[styles_local.card, { marginTop: 16 }]}>
          <Text style={styles_local.cardLabel}>Title</Text>
          <TextInput
            style={styles_local.textInput}
            placeholder="Enter title"
            placeholderTextColor={C.gray50}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Servings (only when not specific date) */}
        {!isSpecificDate && (
          <View style={[styles_local.card, { marginTop: 16 }]}>
            <View style={styles_local.cardRow}>
              <Text style={[styles_local.cardLabel, { flex: 1 }]}>Servings</Text>
              <TouchableOpacity
                style={styles_local.servingBtn}
                onPress={() => { if (servings > 1) setServings(servings - 1); }}
              >
                <Ionicons name="remove" size={16} color={C.white} />
              </TouchableOpacity>
              <Text style={styles_local.servingValue}>{servings}</Text>
              <TouchableOpacity
                style={styles_local.servingBtn}
                onPress={() => setServings(servings + 1)}
              >
                <Ionicons name="add" size={16} color={C.white} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Meal Types */}
        <View style={[styles_local.card, { marginTop: 16 }]}>
          <Text style={styles_local.cardLabel}>Meal Types</Text>
          {availableMealTypes.map((type) => {
            const isSelected = selectedMealTypes.includes(type.key);
            return (
              <TouchableOpacity
                key={type.key}
                style={styles_local.checkboxRow}
                onPress={() => toggleMealType(type.key)}
                activeOpacity={0.7}
              >
                <View style={[styles_local.checkbox, isSelected && styles_local.checkboxActive]}>
                  {isSelected && <Ionicons name="checkmark" size={16} color={C.white} />}
                </View>
                <Text style={styles_local.checkboxLabel}>{type.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Is Complete Only */}
        <View style={[styles_local.card, { marginTop: 16 }]}>
          <TouchableOpacity
            style={styles_local.checkboxRow}
            onPress={() => setIsCompleteOnly(!isCompleteOnly)}
            activeOpacity={0.7}
          >
            <View style={[styles_local.checkbox, isCompleteOnly && styles_local.checkboxActive]}>
              {isCompleteOnly && <Ionicons name="checkmark" size={16} color={C.white} />}
            </View>
            <Text style={styles_local.checkboxLabel}>Is Complete Only</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom button */}
      <View style={styles_local.bottomWrap}>
        <TouchableOpacity style={styles_local.submitBtn} onPress={submit} activeOpacity={0.8}>
          <Text style={styles_local.submitText}>{isEditMode ? 'Update List' : 'Generate List'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles_local = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 14,
    backgroundColor: C.surface,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontFamily: FONT.bold, color: C.white },
  body: { flex: 1 },
  card: {
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardLabel: { fontSize: 15, fontFamily: FONT.semiBold, color: C.white },
  dateBtn: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dateText: { fontSize: 14, fontFamily: FONT.regular, color: C.gray40 },
  textInput: {
    backgroundColor: C.surfaceLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: C.white,
    fontFamily: FONT.regular,
    fontSize: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: C.border,
  },
  servingBtn: {
    backgroundColor: C.brand5,
    borderRadius: 4,
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  servingValue: { fontSize: 18, fontFamily: FONT.bold, color: C.white, marginHorizontal: 16 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 12 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: C.gray50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: { backgroundColor: C.brand5, borderColor: C.brand5 },
  checkboxLabel: { fontSize: 15, fontFamily: FONT.regular, color: C.white, flex: 1 },
  bottomWrap: { padding: 16 },
  submitBtn: {
    backgroundColor: C.brand5,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitText: { fontSize: 16, fontFamily: FONT.semiBold, color: C.white },
});