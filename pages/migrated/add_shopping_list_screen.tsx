import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';

export default function AddShoppingListScreen({ navigation, route }: any) {
  const shoppingList = route?.params?.shoppingList;
  const isDefaultSpecificDate = route?.params?.isDefaultSpecificDate ?? true;

  const isEditMode = !!shoppingList;

  const [title, setTitle] = useState('');
  const [isSpecificDate, setIsSpecificDate] = useState(isDefaultSpecificDate);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dateRangeStart, setDateRangeStart] = useState<Date | null>(null);
  const [dateRangeEnd, setDateRangeEnd] = useState<Date | null>(null);
  const [isCompleteOnly, setIsCompleteOnly] = useState(false);
  const [selectedMealTypes, setSelectedMealTypes] = useState<string[]>([]);
  const [servings, setServings] = useState(1);
  const [dailyPlanId, setDailyPlanId] = useState<number | null>(null);
  const [isFetchingPlan, setIsFetchingPlan] = useState(false);
  const [loading, setLoading] = useState(false);

  const availableMealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

  useEffect(() => {
    setSelectedMealTypes([...availableMealTypes]);
    prefillForEdit();
  }, []);

  const prefillForEdit = () => {
    if (!shoppingList) {
      fetchDailyPlanId(selectedDate);
      return;
    }
    setTitle(shoppingList.title ?? '');
    if (shoppingList.dailyPlanId) {
      setIsSpecificDate(true);
      setDailyPlanId(shoppingList.dailyPlanId);
      if (shoppingList.startDate) {
        setSelectedDate(new Date(shoppingList.startDate));
      }
    } else {
      setIsSpecificDate(false);
      setServings(shoppingList.servings ?? 1);
      if (shoppingList.startDate && shoppingList.endDate) {
        setDateRangeStart(new Date(shoppingList.startDate));
        setDateRangeEnd(new Date(shoppingList.endDate));
      }
    }
  };

  const fetchDailyPlanId = async (date: Date) => {
    setIsFetchingPlan(true);
    try {
      // TODO: Replace with actual API call
      // const value = await getDailyPlanDetailApi(date: getDateTimeString(date));
      // setDailyPlanId(value.data?.id);
    } catch (e) {
      console.log('Error fetching daily plan:', e);
    } finally {
      setIsFetchingPlan(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
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
      // TODO: Replace with actual API call
      // const value = await generateShoppingListApi(req);
      setLoading(false);
      navigation.goBack(true);
    } catch (e) {
      setLoading(false);
      Alert.alert('Error', 'Failed to save shopping list');
    }
  };

  const toggleMealType = (key: string) => {
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
          <TouchableOpacity
            style={styles_local.cardRow}
            onPress={() => setIsSpecificDate(!isSpecificDate)}
            activeOpacity={0.7}
          >
            <Text style={styles_local.cardLabel}>Specific Date</Text>
            <Switch
              value={isSpecificDate}
              onValueChange={setIsSpecificDate}
              trackColor={{ false: C.gray60, true: C.brand5 }}
              thumbColor={C.white}
            />
          </TouchableOpacity>

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
            const isSelected = selectedMealTypes.includes(type);
            return (
              <TouchableOpacity
                key={type}
                style={styles_local.checkboxRow}
                onPress={() => toggleMealType(type)}
                activeOpacity={0.7}
              >
                <View style={[styles_local.checkbox, isSelected && styles_local.checkboxActive]}>
                  {isSelected && <Ionicons name="checkmark" size={16} color={C.white} />}
                </View>
                <Text style={styles_local.checkboxLabel}>{type}</Text>
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
