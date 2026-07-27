import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { C, FONT } from './theme';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CHART_FILTERS = ['Daily', 'Weekly', 'Monthly'];

export default function StepsCountScreen(props: any) {
  const [editingGoal, setEditingGoal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [steps, setSteps] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(0);
  const [selectedPickerIndex, setSelectedPickerIndex] = useState(0);
  const [currentFilter, setCurrentFilter] = useState('Daily');
  const [logList, setLogList] = useState<any[]>([]);

  useEffect(() => {
    initSteps();
  }, []);

  const initSteps = async () => {
    // Simulate step controller init
    setIsLoading(false);
  };

  const getGoalMessage = () => {
    if (dailyGoal === 0) return 'Set your daily goal';
    const diff = dailyGoal - steps;
    if (diff > 0) return `Only ${diff} steps left`;
    if (diff === 0) return 'Goal reached!';
    return `${Math.abs(diff)} steps over goal!`;
  };

  const handleSaveGoal = async () => {
    setEditingGoal(false);
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const req = {
      id: 0,
      value: dailyGoal !== 0 ? dailyGoal : 1000,
      type: 'step_track',
      unit: 'steps',
      date: today,
    };
    // await setProgressApi(req);
    await initSteps();
  };

  const progress = dailyGoal > 0 ? Math.min(steps / dailyGoal, 1.0) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => props.navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={C.brand5} />
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>Step Tracker</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.goalInfoBox}>
          <Text style={styles.goalInfoText}>{getGoalMessage()}</Text>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressRing}>
            <View style={styles.progressTrack} />
            <View
              style={[
                styles.progressFill,
                {
                  borderColor: C.brand5,
                  transform: [{ rotate: '-90deg' }],
                  borderBottomColor: progress > 0.5 ? C.brand5 : 'transparent',
                  borderRightColor: progress > 0.25 ? C.brand5 : 'transparent',
                },
              ]}
            />
            <View style={styles.progressInner}>
              <Ionicons name="walk-sharp" size={60} color={C.brand5} />
              <Text style={styles.stepCount}>{steps}</Text>
              <Text style={styles.stepsLabel}>Steps</Text>
            </View>
          </View>
        </View>

        <LinearGradient
          colors={[C.orangeGradient1, C.orangeGradient2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.dailyGoalCard}
        >
          <View style={styles.dailyGoalHeader}>
            <View style={styles.dailyGoalTitleRow}>
              <Ionicons name="water-drop" size={20} color={C.white} />
              <Text style={styles.dailyGoalTitle}>Daily Goal</Text>
            </View>
            <TouchableOpacity
              onPress={() => setEditingGoal(!editingGoal)}
            >
              <Ionicons
                name={dailyGoal === 0 ? 'add' : 'create'}
                size={22}
                color={C.white}
              />
            </TouchableOpacity>
          </View>

          {editingGoal ? (
            <View>
              <View style={styles.pickerContainer}>
                <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                  {Array.from({ length: 100 }, (_, i) => (i + 1) * 1000).map((val) => (
                    <TouchableOpacity
                      key={val}
                      style={[
                        styles.pickerItem,
                        selectedPickerIndex === Math.floor(val / 1000) - 1 && styles.pickerItemActive,
                      ]}
                      onPress={() => {
                        setSelectedPickerIndex(Math.floor(val / 1000) - 1);
                        setDailyGoal(val);
                      }}
                    >
                      <Text style={styles.pickerItemText}>{val}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveGoal}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.dailyGoalValue}>
              {dailyGoal === 0 ? '' : `${dailyGoal} Steps`}
            </Text>
          )}
        <View style={{ height: 15 }} />
        </LinearGradient>

        {logList.length > 0 && dailyGoal !== 0 ? (
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Steps</Text>
              <View style={styles.filterRow}>
                {CHART_FILTERS.map((f) => (
                  <TouchableOpacity
                    key={f}
                    style={[styles.filterChip, currentFilter === f && styles.filterChipActive]}
                    onPress={() => setCurrentFilter(f)}
                  >
                    <Text style={[styles.filterText, currentFilter === f && styles.filterTextActive]}>
                      {f}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.chartPlaceholder}>
              <Text style={styles.chartPlaceholderText}>Chart</Text>
            </View>
          </View>
        ) : isLoading ? (
          <ActivityIndicator size="large" color={C.brand5} style={{ marginTop: 20 }} />
        ) : null}

        <View style={{ height: 30 }} />
      </ScrollView>
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
  appBarTitle: { fontSize: 20, fontFamily: FONT.semiBold, color: C.brand5 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 30 },
  goalInfoBox: {
    backgroundColor: C.brand10,
    borderRadius: 12,
    padding: 14,
    marginTop: 10,
    marginBottom: 25,
  },
  goalInfoText: { fontSize: 14, fontFamily: FONT.semiBold, color: C.brand5, textAlign: 'center' },
  progressContainer: { alignItems: 'center', marginVertical: 20 },
  progressRing: { width: 240, height: 240, justifyContent: 'center', alignItems: 'center' },
  progressTrack: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 12,
    borderColor: C.white,
  },
  progressFill: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 12,
  },
  progressInner: { alignItems: 'center' },
  stepCount: { color: C.brand5, fontSize: 40, fontFamily: FONT.bold, marginTop: 8 },
  stepsLabel: { fontSize: 16, color: C.gray30, fontFamily: FONT.regular },
  dailyGoalCard: { borderRadius: 16, padding: 16, marginVertical: 20 },
  dailyGoalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dailyGoalTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dailyGoalTitle: { fontSize: 20, fontFamily: FONT.semiBold, color: C.white },
  dailyGoalValue: { fontSize: 18, fontFamily: FONT.medium, color: C.white, marginTop: 8 },
  pickerContainer: { height: 150, marginTop: 12 },
  pickerScroll: { flex: 1 },
  pickerItem: { paddingVertical: 8, alignItems: 'center' },
  pickerItemActive: { backgroundColor: C.brand5, borderRadius: 8 },
  pickerItemText: { fontSize: 22, fontFamily: FONT.semiBold, color: C.white },
  saveButton: {
    backgroundColor: C.white,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  saveButtonText: { fontSize: 16, fontFamily: FONT.bold, color: C.orange },
  chartCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 12,
    shadowColor: 'rgba(0,0,0,0.15)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  chartTitle: { fontSize: 17, fontFamily: FONT.bold, color: C.brand5 },
  filterRow: { flexDirection: 'row', gap: 8 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  filterChipActive: { backgroundColor: C.brand10 },
  filterText: { fontSize: 13, color: C.gray30, fontFamily: FONT.regular },
  filterTextActive: { color: C.brand5, fontFamily: FONT.semiBold },
  chartPlaceholder: { height: 200, justifyContent: 'center', alignItems: 'center' },
  chartPlaceholderText: { color: C.gray30, fontSize: 14 },
});
