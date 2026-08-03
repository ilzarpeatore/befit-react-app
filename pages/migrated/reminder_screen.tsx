import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';

interface ReminderItem {
  id: number;
  title: string;
  subTitle: string;
  duration: string;
  week: number;
}

export default function ReminderScreen(props: any) {
  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const [remindList, setRemindList] = useState<ReminderItem[]>([]);
  const styles = useStyle();

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = () => {
    // Load reminders from notification store
  };

  const formatTime = (durationStr: string): string => {
    try {
      const date = new Date(durationStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const handleAddReminder = async () => {
    const result = await props.navigation.navigate('MigratedSetReminder');
    // Refresh list if reminder was added
    loadReminders();
  };

  const handleDeleteReminder = (item: ReminderItem) => {
    // Cancel notification and remove from store
    // notificationStore.removeToReminder(item);
    setRemindList((prev) => prev.filter((r) => r.id !== item.id));
  };

  const handleMealsWater = () => {
    props.navigation.navigate('MigratedMealsWaterReminder');
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => props.navigation.goBack()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color={C.white} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, styles.fontBold]}>Daily Reminders</Text>
        <TouchableOpacity onPress={handleAddReminder} style={s.backBtn}>
          <Ionicons name="add" size={28} color={C.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={s.body}>
        {/* Meals & Water */}
        <TouchableOpacity style={s.mealsCard} onPress={handleMealsWater}>
          <Text style={[s.mealsTitle, styles.fontRegular]}>Meals & Water</Text>
          <Ionicons name="chevron-forward" size={20} color={C.gray30} />
        </TouchableOpacity>

        {remindList.length === 0 ? (
          <View style={s.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={80} color={C.gray50} />
            <Text style={[s.emptyTitle, styles.fontBold]}>No reminders</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={s.listContent}>
            {remindList.map((item) => {
              const formattedTime = formatTime(item.duration);
              const weekdayName = weekdays[item.week - 1] ?? '';
              return (
                <View key={item.id} style={s.reminderCard}>
                  <View style={s.reminderContent}>
                    <View style={s.reminderTextWrap}>
                      <Text style={[s.reminderTitle, styles.fontBold]}>{item.title}</Text>
                      <Text style={[s.reminderSubtitle, styles.fontRegular]}>
                        {weekdayName} {formattedTime} | {item.subTitle}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteReminder(item)}
                      style={s.deleteBtn}
                    >
                      <Ionicons name="trash-outline" size={22} color={C.gray30} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  backBtn: { width: 40, alignItems: 'center' },
  headerTitle: { fontSize: 18, color: C.white, flex: 1, textAlign: 'center' },
  body: { flex: 1 },
  mealsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    padding: 16,
    backgroundColor: C.surfaceLight,
    borderRadius: 12,
  },
  mealsTitle: { fontSize: 16, color: C.white },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyTitle: { fontSize: 18, color: C.gray30, marginTop: 16 },
  listContent: { padding: 16 },
  reminderCard: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: C.surfaceLight,
    borderRadius: 12,
  },
  reminderContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  reminderTextWrap: { flex: 1, marginRight: 12 },
  reminderTitle: { fontSize: 18, color: C.white },
  reminderSubtitle: { fontSize: 14, color: C.gray30, marginTop: 6 },
  deleteBtn: { padding: 4 },
});

function useStyle() {
  return useResponsiveStyleSheet({
    fontBold: { fontFamily: FONT.bold },
    fontMedium: { fontFamily: FONT.medium },
    fontRegular: { fontFamily: FONT.regular },
    fontSemiBold: { fontFamily: FONT.semiBold },
  });
}
