import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';
import { workoutHistoryApi } from '../../api/workoutHistory';

interface Exercise {
  id?: number;
  title?: string;
  sets?: number;
  reps?: string;
  rest?: string;
  image?: string;
}

interface WorkoutBlock {
  title?: string;
  exercises?: Exercise[];
}

interface FullWorkoutDayModel {
  isRest?: boolean;
  blocks?: WorkoutBlock[];
}

interface FullWorkoutScreenProps {
  navigation?: any;
  route?: any;
}

export default function FullWorkoutScreen(props: FullWorkoutScreenProps) {
  const { navigation, route } = props;
  const programDayAssignmentId = route?.params?.programDayAssignmentId;
  const mTitle = route?.params?.mTitle || 'Entrenamiento';

  const [isLoading, setIsLoading] = useState(true);
  const [mWorkoutDay, setMWorkoutDay] = useState<FullWorkoutDayModel | null>(null);

  const styles = useResponsiveStyleSheet({
    container: { flex: 1, backgroundColor: C.bg },
    header: { fontSize: '20@ratio', fontFamily: FONT.bold, color: C.white, padding: '16@ratio' },
    blockTitle: { fontSize: '16@ratio', fontFamily: FONT.bold, color: C.white, marginBottom: '12@ratio' },
    exerciseCard: {
      backgroundColor: C.surfaceLight, borderRadius: '12@ratio', padding: '12@ratio',
      marginBottom: '8@ratio', flexDirection: 'row', alignItems: 'center',
    },
    exerciseImage: { width: '60@ratio', height: '60@ratio', borderRadius: '8@ratio', backgroundColor: C.gray70, marginRight: '12@ratio' },
    exerciseInfo: { flex: 1 },
    exerciseTitle: { fontSize: '15@ratio', fontFamily: FONT.semiBold, color: C.white },
    exerciseDetail: { fontSize: '13@ratio', fontFamily: FONT.regular, color: C.textSecondary, marginTop: '4@ratio' },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: '60@ratio' },
    emptyText: { fontSize: '16@ratio', fontFamily: FONT.medium, color: C.textSecondary, textAlign: 'center' },
    loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      await workoutHistoryApi.getMyCalendarDayDetail(programDayAssignmentId).then((res) => {
        const data: any = res.data.data;
        if (data?.is_rest === 1) {
          setMWorkoutDay({ isRest: true, blocks: [] });
        } else {
          setMWorkoutDay({
            isRest: false,
            blocks: (data?.blocks ?? []).map((block: any) => ({
              title: block.title,
              exercises: (block.exercises ?? []).map((ex: any) => ({
                id: ex.exercise_id,
                title: ex.title,
                sets: ex.sets?.carga ? 1 : undefined,
                reps: ex.sets?.repeticiones ? `${ex.sets.repeticiones}x` : undefined,
                rest: ex.sets?.descanso ? `${ex.sets.descanso}s` : undefined,
              })),
            })),
          });
        }
      });
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.header}>{mTitle}</Text>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={C.brand5} />
        </View>
      </SafeAreaView>
    );
  }

  if (!mWorkoutDay) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.header}>{mTitle}</Text>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No results found</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (mWorkoutDay.isRest) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.header}>{mTitle}</Text>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Hoy es dia de descanso</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>{mTitle}</Text>
      <ScrollView contentContainerStyle={{ padding: '16@ratio' }}>
        {(mWorkoutDay.blocks || []).map((block, blockIdx) => (
          <View key={blockIdx} style={{ marginBottom: '20@ratio' }}>
            <Text style={styles.blockTitle}>{block.title || ''}</Text>
            {(block.exercises || []).map((ex, exIdx) => (
              <TouchableOpacity key={exIdx} style={styles.exerciseCard} activeOpacity={0.7}>
                {ex.image ? (
                  <Image source={{ uri: ex.image }} style={styles.exerciseImage} resizeMode="cover" />
                ) : (
                  <View style={styles.exerciseImage} />
                )}
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseTitle}>{ex.title || ''}</Text>
                  <Text style={styles.exerciseDetail}>
                    {ex.sets ? `${ex.sets} sets` : ''} {ex.reps || ''} {ex.rest ? `Rest: ${ex.rest}` : ''}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={C.brand5} />
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
