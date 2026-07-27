import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';
import { workoutHistoryApi } from '../../api/workoutHistory';

interface CalendarWorkout {
  title?: string;
  assignmentId?: number;
}

interface CalendarDayModel {
  date?: string;
  workouts?: CalendarWorkout[];
}

interface MyProgramCalendarScreenProps {
  navigation?: any;
  route?: any;
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;
  } catch {
    return dateStr;
  }
}

function formatMonthYear(date: Date): string {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

export default function MyProgramCalendarScreen(props: MyProgramCalendarScreenProps) {
  const { navigation } = props;

  const [isLoading, setIsLoading] = useState(true);
  const [mDays, setMDays] = useState<CalendarDayModel[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth());
  });

  const styles = useResponsiveStyleSheet({
    container: { flex: 1, backgroundColor: C.bg },
    header: { fontSize: '20@ratio', fontFamily: FONT.bold, color: C.white, padding: '16@ratio' },
    monthRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: '8@ratio', paddingVertical: '8@ratio' },
    monthBtn: { padding: '8@ratio' },
    monthText: { fontSize: '16@ratio', fontFamily: FONT.bold, color: C.white },
    daySection: { marginBottom: '16@ratio' },
    dayDate: { fontSize: '13@ratio', fontFamily: FONT.regular, color: C.textSecondary, paddingHorizontal: '16@ratio' },
    workoutCard: {
      backgroundColor: C.surfaceLight, borderRadius: '12@ratio', padding: '16@ratio',
      marginHorizontal: '16@ratio', marginTop: '8@ratio', flexDirection: 'row', alignItems: 'center',
    },
    workoutTitle: { flex: 1, fontSize: '15@ratio', fontFamily: FONT.bold, color: C.white },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: '60@ratio', paddingHorizontal: '32@ratio' },
    emptyText: { fontSize: '16@ratio', fontFamily: FONT.medium, color: C.textSecondary, textAlign: 'center' },
    loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  });

  useEffect(() => {
    getData();
  }, [selectedMonth]);

  const getData = async () => {
    setIsLoading(true);
    try {
      const month = selectedMonth.getMonth() + 1;
      const year = selectedMonth.getFullYear();
      await workoutHistoryApi.getMyCalendar(month, year).then((res) => {
        const calData: any = res.data.data;
        const days = calData?.days ?? [];
        const mapped: CalendarDayModel[] = days
          .filter((d: any) => d.in_month)
          .map((d: any) => ({
            date: d.date,
            workouts: (d.workouts ?? []).map((w: any) => ({
              title: w.title,
              assignmentId: w.assignment_id,
            })),
          }));
        setMDays(mapped);
        if (mapped.filter((d) => d.workouts && d.workouts.length > 0).length === 0) {
          setMessage('No tienes entrenamientos programados este mes.');
        }
      });
    } catch {
      setMessage('No se pudo cargar el calendario.');
    } finally {
      setIsLoading(false);
    }
  };

  const changeMonth = (delta: number) => {
    setSelectedMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta));
  };

  const daysWithWorkouts = mDays.filter((d) => d.workouts && d.workouts.length > 0);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Mi programa</Text>

      {/* Month Navigation */}
      <View style={styles.monthRow}>
        <TouchableOpacity style={styles.monthBtn} onPress={() => changeMonth(-1)}>
          <Ionicons name="chevron-back" size={24} color={C.white} />
        </TouchableOpacity>
        <Text style={styles.monthText}>{formatMonthYear(selectedMonth)}</Text>
        <TouchableOpacity style={styles.monthBtn} onPress={() => changeMonth(1)}>
          <Ionicons name="chevron-forward" size={24} color={C.white} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={C.brand5} />
        </View>
      ) : daysWithWorkouts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{message || 'No workouts scheduled this month.'}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingVertical: '16@ratio' }}>
          {daysWithWorkouts.map((day, dayIdx) => (
            <View key={dayIdx} style={styles.daySection}>
              <Text style={styles.dayDate}>{formatDate(day.date)}</Text>
              {(day.workouts || []).map((w, wIdx) => (
                <TouchableOpacity
                  key={wIdx}
                  style={styles.workoutCard}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (w.assignmentId == null) return;
                    navigation?.navigate('MigratedWorkoutPreview', {
                      programDayAssignmentId: w.assignmentId,
                      mTitle: w.title,
                    });
                  }}
                >
                  <Text style={styles.workoutTitle}>{w.title || ''}</Text>
                  <Ionicons name="chevron-forward" size={20} color={C.brand5} />
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
