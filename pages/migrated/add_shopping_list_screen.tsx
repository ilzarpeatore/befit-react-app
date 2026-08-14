import React, { useState, useEffect } from 'react';
import { ScrollView, Switch, Alert, ActivityIndicator } from 'react-native';
import { Box } from '@components/ui/box';
import { Text } from '@components/ui/text';
import { Heading } from '@components/ui/heading';
import { HStack } from '@components/ui/hstack';
import { Button, ButtonText } from '@components/ui/button';
import { Pressable } from '@components/ui/pressable';
import { Icon } from '@components/ui/icon';
import { Input, InputField } from '@components/ui/input';
import { Card } from '@components/ui/card';
import { Stepper } from '@components/ui/stepper';
import { C } from './theme';
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

  const renderCheckboxRow = (label: string, checked: boolean, onPress: () => void, key?: string) => (
    <Pressable key={key} className="flex-row items-center py-2 gap-3" onPress={onPress}>
      <Box
        className="w-5 h-5 rounded-sm items-center justify-center"
        style={{
          borderWidth: 1.5,
          borderColor: checked ? C.brand5 : C.gray50,
          backgroundColor: checked ? C.brand5 : 'transparent',
        }}
      >
        {checked && <Icon name="checkmark" size={16} className="text-foreground" />}
      </Box>
      <Text className="flex-1">{label}</Text>
    </Pressable>
  );

  return (
    <Box className="flex-1 bg-background">
      <HStack style={{ paddingTop: 48, paddingBottom: 16 }} className="items-center justify-between px-4 bg-card">
        <Button variant="ghost" size="icon" onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={24} className="text-foreground" />
        </Button>
        <Heading size="sm">{isEditMode ? 'Edit Shopping List' : 'Add Shopping List'}</Heading>
        <Box className="w-10" />
      </HStack>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, gap: 16 }} showsVerticalScrollIndicator={false}>
        {/* Date / Range Selection */}
        <Card variant="outline">
          <HStack className="items-center justify-between">
            <Text weight="semibold">Specific Date</Text>
            <Switch
              value={isSpecificDate}
              onValueChange={(value) => {
                setIsSpecificDate(value);
                if (value && !isEditMode) fetchDailyPlanId(selectedDate);
              }}
              trackColor={{ false: C.gray60, true: C.brand5 }}
              thumbColor={C.white}
            />
          </HStack>

          {isSpecificDate ? (
            <HStack className="items-center justify-between" style={{ marginTop: 12 }}>
              <Text weight="semibold">Date</Text>
              <Pressable className="flex-row items-center gap-2">
                <Text size="sm" muted>{formatDate(selectedDate)}</Text>
                <Icon name="calendar-outline" size={18} className="text-muted-foreground" />
              </Pressable>
            </HStack>
          ) : (
            <HStack className="items-center justify-between" style={{ marginTop: 12 }}>
              <Text weight="semibold">Date Range</Text>
              <Pressable className="flex-row items-center gap-2">
                <Text size="sm" muted>
                  {dateRangeStart && dateRangeEnd
                    ? `${formatDate(dateRangeStart)} - ${formatDate(dateRangeEnd)}`
                    : 'Select Range'}
                </Text>
                <Icon name="calendar-outline" size={18} className="text-muted-foreground" />
              </Pressable>
            </HStack>
          )}

          {isFetchingPlan && isSpecificDate && (
            <ActivityIndicator size="small" color={C.orange} style={{ marginTop: 8 }} />
          )}
        </Card>

        {/* Title */}
        <Card variant="outline">
          <Text weight="semibold">Title</Text>
          <Input style={{ marginTop: 8 }}>
            <InputField
              placeholder="Enter title"
              value={title}
              onChangeText={setTitle}
            />
          </Input>
        </Card>

        {/* Servings (only when not specific date) */}
        {!isSpecificDate && (
          <Card variant="outline">
            <HStack className="items-center justify-between">
              <Text weight="semibold" className="flex-1">Servings</Text>
              <Stepper value={servings} onChange={setServings} min={1} />
            </HStack>
          </Card>
        )}

        {/* Meal Types */}
        <Card variant="outline">
          <Text weight="semibold">Meal Types</Text>
          {availableMealTypes.map((type) =>
            renderCheckboxRow(
              type.label,
              selectedMealTypes.includes(type.key),
              () => toggleMealType(type.key),
              type.key
            )
          )}
        </Card>

        {/* Is Complete Only */}
        <Card variant="outline">
          {renderCheckboxRow('Is Complete Only', isCompleteOnly, () => setIsCompleteOnly(!isCompleteOnly))}
        </Card>
      </ScrollView>

      {/* Bottom button */}
      <Box className="p-4">
        <Button size="lg" onPress={submit}>
          <ButtonText>{isEditMode ? 'Update List' : 'Generate List'}</ButtonText>
        </Button>
      </Box>
    </Box>
  );
}
