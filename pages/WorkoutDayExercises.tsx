import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { Colors } from "@constants/colors";
import { workoutsApi, WorkoutDayExercise } from "../api/workouts";
import { EmptyStateMem } from "../components/EmptyState";
import { ErrorRetryMem } from "../components/ErrorRetry";
import { LoadingSkeletonMem } from "../components/LoadingSkeleton";

export default function WorkoutDayExercises() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const styles = useStyle();
  const { workoutDayId, dayName } = route.params ?? {};
  const [exercises, setExercises] = useState<WorkoutDayExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExercises = useCallback(async () => {
    if (!workoutDayId) {
      setError("No workout day ID provided.");
      return;
    }
    try {
      setError(null);
      const res = await workoutsApi.getDayExercises(workoutDayId);
      setExercises(res.data?.data ?? []);
    } catch (e: any) {
      setError(e?.message || "Failed to load exercises");
    }
  }, [workoutDayId]);

  useEffect(() => {
    setLoading(true);
    fetchExercises().finally(() => setLoading(false));
  }, [fetchExercises]);

  const renderItem = useCallback(
    ({ item, index }: { item: WorkoutDayExercise; index: number }) => (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() =>
          navigation.navigate("ExerciseInfo", { id: item.exercise_id })
        }
      >
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          colors={[Colors.CARD_START, Colors.CARD_END]}
          style={styles.exerciseCard}
        >
          <View style={styles.exerciseIndex}>
            <Text style={styles.exerciseIndexText}>{index + 1}</Text>
          </View>

          {item.exercise?.exercise_image ? (
            <Image
              source={{ uri: item.exercise.exercise_image }}
              contentFit="cover"
              style={styles.exerciseImage}
            />
          ) : (
            <View style={styles.exerciseImagePlaceholder}>
              <Ionicons
                name="fitness-outline"
                size={24}
                color={Colors.TEXT_MUTED}
              />
            </View>
          )}

          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseName} numberOfLines={1}>
              {item.exercise?.title || "Exercise"}
            </Text>
            <View style={styles.exerciseMeta}>
              {item.sets ? (
                <View style={styles.metaItem}>
                  <Ionicons
                    name="layers-outline"
                    size={12}
                    color={Colors.TEXT_SECONDARY}
                  />
                  <Text style={styles.metaText}>{item.sets} sets</Text>
                </View>
              ) : null}
              {item.reps ? (
                <View style={styles.metaItem}>
                  <Ionicons
                    name="repeat-outline"
                    size={12}
                    color={Colors.TEXT_SECONDARY}
                  />
                  <Text style={styles.metaText}>{item.reps} reps</Text>
                </View>
              ) : null}
              {item.time ? (
                <View style={styles.metaItem}>
                  <Ionicons
                    name="time-outline"
                    size={12}
                    color={Colors.TEXT_SECONDARY}
                  />
                  <Text style={styles.metaText}>{item.time}s</Text>
                </View>
              ) : null}
            </View>
          </View>

          <Ionicons
            name="chevron-forward"
            size={18}
            color={Colors.TEXT_SECONDARY}
          />
        </LinearGradient>
      </TouchableOpacity>
    ),
    [navigation, styles]
  );

  const keyExtractor = useCallback(
    (item: WorkoutDayExercise) => item.id.toString(),
    []
  );

  if (loading) {
    return (
      <View
        style={styles.bg}
      >
        <SafeAreaView style={styles.container} edges={["right", "left", "top"]}>
          <View style={styles.container2}>
            <View style={styles.topbar}>
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => navigation.goBack()}
              >
                <Ionicons
                  name="chevron-back"
                  size={24}
                  color={Colors.TEXT_PRIMARY}
                />
              </TouchableOpacity>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {dayName}
              </Text>
              <View style={styles.backBtn} />
            </View>
            <View style={styles.listContent}>
              {[1, 2, 3, 4].map((i) => (
                <View key={i} style={{ marginBottom: 12 }}>
                  <LoadingSkeletonMem
                    width="100%"
                    height="80@ratio"
                    borderRadius={16}
                  />
                </View>
              ))}
            </View>
          </View>
          <StatusBar style="dark" />
        </SafeAreaView>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={styles.bg}
      >
        <SafeAreaView style={styles.container} edges={["right", "left", "top"]}>
          <View style={styles.container2}>
            <View style={styles.topbar}>
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => navigation.goBack()}
              >
                <Ionicons
                  name="chevron-back"
                  size={24}
                  color={Colors.TEXT_PRIMARY}
                />
              </TouchableOpacity>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {dayName}
              </Text>
              <View style={styles.backBtn} />
            </View>
            <ErrorRetryMem message={error} onRetry={fetchExercises} />
          </View>
          <StatusBar style="dark" />
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View
      style={styles.bg}
    >
      <SafeAreaView style={styles.container} edges={["right", "left", "top"]}>
        <View style={styles.container2}>
          <View style={styles.topbar}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color={Colors.TEXT_PRIMARY}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {dayName}
            </Text>
            <View style={styles.backBtn} />
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate("WorkoutSession", {
                exercises: exercises,
                workoutId: route.params?.workoutId,
                workoutDayId,
              })
            }
          >
            <LinearGradient
              start={{ x: 0.24, y: -0.09 }}
              end={{ x: 0.78, y: 0.93 }}
              colors={[Colors.ACCENT_START, Colors.ACCENT_END]}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 16,
                paddingVertical: 14,
                marginBottom: 16,
                gap: 8,
              }}
            >
              <Ionicons name="play" size={20} color={Colors.TEXT_PRIMARY} />
              <Text style={{ fontFamily: "Gilroy-Bold", fontSize: 16, color: Colors.TEXT_PRIMARY }}>
                Start Workout
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <FlatList
            data={exercises}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <EmptyStateMem
                icon="fitness-outline"
                title="No exercises"
                message="This day has no exercises yet"
              />
            }
          />
        </View>
        <StatusBar style="dark" />
      </SafeAreaView>
    </View>
  );
}

function useStyle() {
  return useResponsiveStyleSheet({
    container: {
      flex: 1,
    },
    container2: {
      flex: 1,
      paddingTop: "10@ratio",
    },
    bg: {
      width: "100%",
      height: "100%",
      backgroundColor: Colors.BG_PRIMARY,
    },
    topbar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: "16@ratio",
      marginBottom: "16@ratio",
    },
    backBtn: {
      width: "44@ratio",
      height: "44@ratio",
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      fontFamily: "Gilroy-Bold",
      fontSize: "20@ratio",
      color: Colors.TEXT_PRIMARY,
      flex: 1,
      textAlign: "center",
    },
    listContent: {
      paddingHorizontal: "16@ratio",
      paddingBottom: "24@ratio",
    },
    exerciseCard: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: "16@ratio",
      padding: "12@ratio",
      marginBottom: "12@ratio",
    },
    exerciseIndex: {
      width: "32@ratio",
      height: "32@ratio",
      borderRadius: "16@ratio",
      backgroundColor: "#E5E5EA",
      alignItems: "center",
      justifyContent: "center",
      marginRight: "12@ratio",
    },
    exerciseIndexText: {
      fontFamily: "Gilroy-Bold",
      fontSize: "14@ratio",
      color: "#000000",
    },
    exerciseImage: {
      width: "56@ratio",
      height: "56@ratio",
      borderRadius: "12@ratio",
      marginRight: "12@ratio",
      backgroundColor: Colors.BG_CARD,
    },
    exerciseImagePlaceholder: {
      width: "56@ratio",
      height: "56@ratio",
      borderRadius: "12@ratio",
      marginRight: "12@ratio",
      backgroundColor: Colors.BG_CARD,
      alignItems: "center",
      justifyContent: "center",
    },
    exerciseInfo: {
      flex: 1,
    },
    exerciseName: {
      fontFamily: "Gilroy-Bold",
      fontSize: "15@ratio",
      color: Colors.TEXT_PRIMARY,
      marginBottom: "4@ratio",
    },
    exerciseMeta: {
      flexDirection: "row",
      gap: 12,
    },
    metaItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    metaText: {
      fontFamily: "Gilroy-Medium",
      fontSize: "12@ratio",
      color: Colors.TEXT_SECONDARY,
    },
  });
}
