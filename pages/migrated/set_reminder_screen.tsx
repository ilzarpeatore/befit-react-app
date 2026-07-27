import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, SafeAreaView, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';

interface Props {
  isDaily?: boolean;
}

export default function SetReminderScreen(props: any) {
  const isDaily = props.route?.params?.isDaily ?? false;
  const [dateTime, setDateTime] = useState(new Date());
  const [selectedDays, setSelectedDays] = useState<Set<number>>(new Set());
  const [reminderName, setReminderName] = useState('');
  const [description, setDescription] = useState('');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const styles = useStyle();

  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const toggleDay = (index: number) => {
    setSelectedDays((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const toggleEveryDay = () => {
    setSelectedDays((prev) => {
      if (prev.size === 7) {
        return new Set();
      }
      return new Set([0, 1, 2, 3, 4, 5, 6]);
    });
  };

  const handleTimeChange = (hour: number, minute: number) => {
    const newDate = new Date(dateTime);
    newDate.setHours(hour);
    newDate.setMinutes(minute);
    setDateTime(newDate);
  };

  const handleSave = async () => {
    if (!reminderName.trim()) {
      Alert.alert('Error', 'Please enter a reminder name');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    if (isDaily) {
      // Create notifications for all 7 days
      for (let i = 1; i <= 7; i++) {
        // await AwesomeNotifications().createNotification(...)
      }
      props.navigation.goBack();
    } else {
      if (selectedDays.size === 0) {
        Alert.alert('Error', 'Please select at least one day');
        return;
      }
      for (const dayIndex of selectedDays) {
        const day = dayIndex + 1;
        // Create reminder model and add to store
        // await AwesomeNotifications().createNotification(...)
      }
      props.navigation.goBack(true);
    }
  };

  const formatHour = (h: number): string => {
    const hour12 = h % 12 || 12;
    return String(hour12).padStart(2, '0');
  };
  const formatMinute = (m: number): string => String(m).padStart(2, '0');
  const isAM = dateTime.getHours() < 12;

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => props.navigation.goBack()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color={C.white} />
        </TouchableOpacity>
        <View style={s.backBtn} />
      </View>

      <ScrollView contentContainerStyle={s.scrollContent}>
        {/* Time Picker */}
        <View style={s.timePickerContainer}>
          <TouchableOpacity
            style={s.timeUnit}
            onPress={() => handleTimeChange((dateTime.getHours() + 1) % 24, dateTime.getMinutes())}
          >
            <Ionicons name="chevron-up" size={24} color={C.gray30} />
          </TouchableOpacity>
          <View style={s.timeDisplay}>
            <Text style={[s.timeText, styles.fontBold]}>{formatHour(dateTime.getHours())}</Text>
            <Text style={[s.timeSeparator, styles.fontBold]}>:</Text>
            <Text style={[s.timeText, styles.fontBold]}>{formatMinute(dateTime.getMinutes())}</Text>
            <View style={s.ampmContainer}>
              <TouchableOpacity
                style={[s.ampmBtn, isAM && s.ampmBtnActive]}
                onPress={() => {
                  if (!isAM) handleTimeChange(dateTime.getHours() - 12, dateTime.getMinutes());
                }}
              >
                <Text style={[s.ampmText, isAM && s.ampmTextActive]}>AM</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.ampmBtn, !isAM && s.ampmBtnActive]}
                onPress={() => {
                  if (isAM) handleTimeChange(dateTime.getHours() + 12, dateTime.getMinutes());
                }}
              >
                <Text style={[s.ampmText, !isAM && s.ampmTextActive]}>PM</Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity
            style={s.timeUnit}
            onPress={() => handleTimeChange((dateTime.getHours() + 23) % 24, dateTime.getMinutes())}
          >
            <Ionicons name="chevron-down" size={24} color={C.gray30} />
          </TouchableOpacity>
        </View>

        <View style={s.divider} />

        {/* Repeat Days (only when not daily) */}
        {!isDaily && (
          <View style={s.repeatSection}>
            <Text style={[s.sectionTitle, styles.fontBold]}>Repeat</Text>
            <TouchableOpacity onPress={toggleEveryDay}>
              <Text style={[s.everyDayText, { color: C.brand5 }]}>Everyday</Text>
            </TouchableOpacity>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.dayChips}>
              {weekdays.map((day, index) => {
                const isSelected = selectedDays.has(index);
                return (
                  <TouchableOpacity
                    key={index}
                    style={[s.dayChip, isSelected && s.dayChipSelected]}
                    onPress={() => toggleDay(index)}
                  >
                    <Text style={[s.dayChipText, isSelected && s.dayChipTextSelected, styles.fontBold]}>
                      {day.substring(0, 1).toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Reminder Name */}
        <Text style={[s.label, styles.fontRegular]}>Reminder Name</Text>
        <TextInput
          style={[s.textInput, styles.fontRegular]}
          placeholder="Enter reminder name"
          placeholderTextColor={C.gray50}
          value={reminderName}
          onChangeText={setReminderName}
        />

        {/* Description */}
        <Text style={[s.label, styles.fontRegular]}>Description</Text>
        <TextInput
          style={[s.textInput, styles.fontRegular]}
          placeholder="Enter description"
          placeholderTextColor={C.gray50}
          value={description}
          onChangeText={setDescription}
        />

        {/* Save Button */}
        <TouchableOpacity style={s.saveBtn} onPress={handleSave}>
          <Text style={[s.saveBtnText, styles.fontSemiBold]}>Save</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  backBtn: { width: 40, alignItems: 'center' },
  scrollContent: { padding: 16 },
  timePickerContainer: { alignItems: 'center', paddingVertical: 20 },
  timeUnit: { padding: 12 },
  timeDisplay: { flexDirection: 'row', alignItems: 'center' },
  timeText: { fontSize: 48, color: C.white },
  timeSeparator: { fontSize: 48, color: C.white, marginHorizontal: 4 },
  ampmContainer: { marginLeft: 16, flexDirection: 'column' },
  ampmBtn: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 4 },
  ampmBtnActive: { backgroundColor: C.brand5 },
  ampmText: { fontSize: 14, color: C.gray40, fontWeight: '600' },
  ampmTextActive: { color: C.white },
  divider: { height: 1, backgroundColor: C.border, marginVertical: 16 },
  repeatSection: { marginBottom: 24 },
  sectionTitle: { fontSize: 20, color: C.white, marginBottom: 8 },
  everyDayText: { fontSize: 14, marginBottom: 16 },
  dayChips: { paddingBottom: 8 },
  dayChip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: `${C.brand5}20`,
    marginRight: 12,
  },
  dayChipSelected: { backgroundColor: C.brand5 },
  dayChipText: { fontSize: 16, color: C.brand5 },
  dayChipTextSelected: { color: C.white },
  label: { fontSize: 14, color: C.white, marginBottom: 8 },
  textInput: {
    backgroundColor: C.surfaceLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    color: C.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    marginBottom: 24,
  },
  saveBtn: {
    backgroundColor: C.brand5,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: { fontSize: 16, color: C.white },
});

function useStyle() {
  return useResponsiveStyleSheet({
    fontBold: { fontFamily: FONT.bold },
    fontMedium: { fontFamily: FONT.medium },
    fontRegular: { fontFamily: FONT.regular },
    fontSemiBold: { fontFamily: FONT.semiBold },
  });
}
