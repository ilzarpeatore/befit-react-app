import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';

type WaterChartFilter = 'week' | 'month' | 'year' | 'every';

export default function WaterTrackerScreen(props: any) {
  const [logValue, setLogValue] = useState(0);
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalText, setGoalText] = useState('');
  const [consumed, setConsumed] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(0);
  const [currentFilter, setCurrentFilter] = useState<WaterChartFilter>('week');
  const [logList, setLogList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    initWaterData();
  }, []);

  const initWaterData = async () => {
    setIsLoading(true);
    try {
      // await waterController.init() equivalent
      // Load consumed, dailyGoal, logList from API
    } catch (e) {
    } finally {
      setIsLoading(false);
    }
  };

  const getBannerText = () => {
    if (dailyGoal === 0) return 'Set up your daily water goal';
    const diff = dailyGoal - consumed;
    if (diff > 0) return `Only ${diff} glasses to reach your goal`;
    if (diff === 0) return 'You have reached your daily goal!';
    return `You exceeded your goal by ${Math.abs(diff)} glasses`;
  };

  const decrementLog = () => {
    if (logValue > 0) setLogValue((prev) => prev - 1);
  };

  const incrementLog = () => {
    setLogValue((prev) => prev + 1);
  };

  const logNow = async () => {
    if (dailyGoal === 0) {
      Alert.alert('Info', 'Set up your daily water goal first');
      return;
    }
    if (logValue <= 0) {
      Alert.alert('Info', 'Value must be greater than zero');
      return;
    }

    const total = consumed + logValue;
    const now = new Date();
    const currentDate = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    const req = {
      value: total,
      date: currentDate,
      time: currentTime,
    };

    try {
      // await setUserDailyWaterGoalApi(req);
      setLogValue(0);
      await initWaterData();
    } catch (e) {
    }
  };

  const saveGoal = async () => {
    const goal = parseInt(goalText, 10);
    if (!isNaN(goal) && goal > 0) {
      setDailyGoal(goal);
      setEditingGoal(false);
      // await waterController.saveGoal()
    }
  };

  const progress = dailyGoal > 0 ? Math.min(consumed / dailyGoal, 1) : 0;

  const roundBtn = (icon: string, onPress: () => void) => (
    <TouchableOpacity style={styles.roundBtn} onPress={onPress}>
      <Ionicons name={icon as any} size={24} color={C.white} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => props.navigation?.goBack()}>
          <Ionicons name="chevron-back" size={24} color={C.brand5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Water Tracker</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={{ height: 10 }} />

        {/* Banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerText}>{getBannerText()}</Text>
        </View>

        {/* Circular Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressOuter}>
            <View style={[styles.progressTrack, { borderColor: C.brand5 }]} />
            <View
              style={[
                styles.progressFill,
                {
                  borderColor: C.brand5,
                  transform: [{ rotate: '-90deg' }],
                  borderTopColor: progress > 0 ? C.brand5 : 'transparent',
                  borderRightColor: progress > 0.25 ? C.brand5 : 'transparent',
                  borderBottomColor: progress > 0.5 ? C.brand5 : 'transparent',
                  borderLeftColor: progress > 0.75 ? C.brand5 : 'transparent',
                },
              ]}
            />
          </View>
          <View style={styles.progressInner}>
            <Ionicons name="water" size={60} color={C.brand5} />
            <Text style={styles.consumedValue}>{consumed}</Text>
            <Text style={styles.glassesLabel}>Glasses</Text>
          </View>
        </View>

        {/* Counter */}
        <View style={styles.counterRow}>
          {roundBtn('remove', decrementLog)}
          <Text style={styles.counterValue}>{logValue}</Text>
          {roundBtn('add', incrementLog)}
        </View>

        {/* Log Now Button */}
        <TouchableOpacity style={styles.logBtn} onPress={logNow}>
          <Text style={styles.logBtnText}>Log Now</Text>
        </TouchableOpacity>

        {/* Daily Goal Card */}
        <LinearGradient
          colors={[C.orangeGradient1, C.orangeGradient2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.goalCard}
        >
          <View style={styles.goalHeader}>
            <View style={styles.goalHeaderLeft}>
              <Ionicons name="water" size={22} color={C.white} />
              <Text style={styles.goalTitle}>Daily Goal</Text>
            </View>
            <TouchableOpacity onPress={() => setEditingGoal(!editingGoal)}>
              <Ionicons name="pencil" size={20} color={C.white} />
            </TouchableOpacity>
          </View>

          {editingGoal ? (
            <View>
              <TextInput
                style={styles.goalInput}
                value={goalText}
                onChangeText={setGoalText}
                keyboardType="numeric"
                placeholder="Enter glasses"
                placeholderTextColor={C.gray40}
              />
              <TouchableOpacity style={styles.goalSaveBtn} onPress={saveGoal}>
                <Text style={styles.goalSaveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.goalValue}>{dailyGoal} Glasses</Text>
          )}
        </LinearGradient>

        {/* Chart Section */}
        {logList.length > 0 && dailyGoal !== 0 && (
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Water Consumption Daily</Text>
              <View style={styles.filterRow}>
                {(['week', 'month', 'year', 'every'] as WaterChartFilter[]).map((filter) => (
                  <TouchableOpacity
                    key={filter}
                    style={[
                      styles.filterChip,
                      currentFilter === filter && styles.filterChipActive,
                    ]}
                    onPress={() => setCurrentFilter(filter)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        currentFilter === filter && styles.filterChipTextActive,
                      ]}
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            {/* Chart placeholder */}
            <View style={styles.chartPlaceholder}>
              <Text style={styles.chartPlaceholderText}>Chart Area</Text>
            </View>
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>

      {isLoading && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color={C.brand5} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerTitle: {
    fontFamily: FONT.semiBold,
    fontSize: 20,
    color: C.brand5,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  banner: {
    padding: 14,
    backgroundColor: C.brand10,
    borderRadius: 12,
  },
  bannerText: {
    fontFamily: FONT.semiBold,
    fontSize: 14,
    color: C.brand5,
  },
  progressContainer: {
    width: 240,
    height: 240,
    alignSelf: 'center',
    marginTop: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressOuter: {
    position: 'absolute',
    width: 240,
    height: 240,
  },
  progressTrack: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 12,
    borderColor: C.gray70,
  },
  progressFill: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 12,
    borderColor: 'transparent',
  },
  progressInner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  consumedValue: {
    fontFamily: FONT.bold,
    fontSize: 40,
    color: C.brand5,
    marginTop: 8,
  },
  glassesLabel: {
    fontFamily: FONT.regular,
    fontSize: 16,
    color: C.textSecondary,
    marginTop: 4,
  },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 20,
  },
  roundBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.brand5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterValue: {
    fontFamily: FONT.medium,
    fontSize: 20,
    color: C.white,
    minWidth: 40,
    textAlign: 'center',
  },
  logBtn: {
    backgroundColor: C.brand5,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 40,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  logBtnText: {
    fontFamily: FONT.semiBold,
    fontSize: 16,
    color: C.white,
  },
  goalCard: {
    borderRadius: 16,
    padding: 16,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  goalTitle: {
    fontFamily: FONT.semiBold,
    fontSize: 20,
    color: C.white,
  },
  goalValue: {
    fontFamily: FONT.medium,
    fontSize: 18,
    color: C.white,
    marginTop: 8,
  },
  goalInput: {
    backgroundColor: C.white,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: C.gray80,
    marginTop: 8,
  },
  goalSaveBtn: {
    backgroundColor: C.white,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  goalSaveBtnText: {
    fontFamily: FONT.bold,
    fontSize: 14,
    color: C.orange,
  },
  chartCard: {
    backgroundColor: C.surfaceLight,
    borderRadius: 16,
    padding: 12,
    marginTop: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  chartTitle: {
    fontFamily: FONT.bold,
    fontSize: 17,
    color: C.brand5,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.brand5,
  },
  filterChipActive: {
    backgroundColor: C.brand5,
  },
  filterChipText: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: C.brand5,
  },
  filterChipTextActive: {
    color: C.white,
  },
  chartPlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartPlaceholderText: {
    fontFamily: FONT.regular,
    fontSize: 14,
    color: C.gray40,
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
});
