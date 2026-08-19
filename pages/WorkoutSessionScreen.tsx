import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  useWindowDimensions,
 ImageBackground } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { C, FONT, GRADIENT } from "./migrated/theme";
import { workoutHistoryApi } from "../api/workoutHistory";

interface Exercise {
  id: number;
  title: string;
  muscle_group: string;
  equipment: string;
  sets: number;
  reps: number;
}

interface SetData {
  reps: string;
  weight: string;
  completed: boolean;
}

interface ExerciseData {
  sets: SetData[];
}

interface RouteParams {
  exercises: Exercise[];
  workoutId: number;
  workoutDayId: number;
}

export default function WorkoutSessionScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { exercises = [], workoutId, workoutDayId } = (route.params ?? {}) as Partial<RouteParams>;
  const { width: winW, height: winH } = useWindowDimensions();
  const sc = Math.min(winW / 375, winH / 812);
  const r = (n: number) => Math.round(n * sc);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [allExerciseData, setAllExerciseData] = useState<ExerciseData[]>(() =>
    exercises.map((ex) => ({
      sets: Array.from({ length: ex.sets }, () => ({
        reps: String(ex.reps),
        weight: "",
        completed: false,
      })),
    }))
  );
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [restTimer, setRestTimer] = useState(0);
  const [isRestMode, setIsRestMode] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const restRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [startTime] = useState(() => Date.now());

  const exercise = exercises[currentIndex];
  const exerciseData = allExerciseData[currentIndex];
  const allSetsCompleted = exerciseData?.sets?.every((s) => s.completed) ?? false;
  const isLastExercise = currentIndex === exercises.length - 1;

  // elapsed workout timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTime]);

  // rest timer countdown. Side effects (stopping the timer, exiting rest mode)
  // live in this effect body, not in setRestTimer's updater: React can
  // re-invoke a functional updater, so it must stay pure.
  useEffect(() => {
    if (!isRestMode) return;
    if (restTimer <= 0) {
      setIsRestMode(false);
      return;
    }
    restRef.current = setInterval(() => {
      setRestTimer((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => {
      if (restRef.current) clearInterval(restRef.current);
    };
  }, [isRestMode, restTimer]);

  if (exercises.length === 0 || !exercise || !exerciseData) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 }}>
          <Text style={{ fontFamily: FONT.regular, fontSize: 15, color: C.textSecondary, textAlign: "center" }}>
            No hay ejercicios en esta sesión.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const updateSet = (setIndex: number, field: "reps" | "weight", value: string) => {
    setAllExerciseData((prev) => {
      const updated = [...prev];
      const sets = [...updated[currentIndex].sets];
      sets[setIndex] = { ...sets[setIndex], [field]: value };
      updated[currentIndex] = { ...updated[currentIndex], sets };
      return updated;
    });
  };

  const markSetDone = (setIndex: number) => {
    setAllExerciseData((prev) => {
      const updated = [...prev];
      const sets = [...updated[currentIndex].sets];
      sets[setIndex] = { ...sets[setIndex], completed: true };
      updated[currentIndex] = { ...updated[currentIndex], sets };
      return updated;
    });
    // start rest timer after marking set done
    setRestTimer(60);
    setIsRestMode(true);
  };

  const skipRest = () => {
    if (restRef.current) clearInterval(restRef.current);
    setIsRestMode(false);
    setRestTimer(0);
  };

  const addSet = () => {
    setAllExerciseData((prev) => {
      const updated = [...prev];
      const sets = [...updated[currentIndex].sets, { reps: String(exercise.reps), weight: "", completed: false }];
      updated[currentIndex] = { ...updated[currentIndex], sets };
      return updated;
    });
  };

  const goToNextExercise = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsRestMode(false);
      setRestTimer(0);
    }
  };

  const finishWorkout = async () => {
    if (!workoutId) return;
    if (timerRef.current) clearInterval(timerRef.current);
    const totalTime = Math.floor((Date.now() - startTime) / 1000);

    try {
      const today = new Date().toISOString().split("T")[0];
      for (let i = 0; i < exercises.length; i++) {
        const ex = exercises[i];
        const data = allExerciseData[i];
        const completedSets = data.sets
          .filter((s) => s.completed)
          .map((s) => ({ reps: s.reps, weight: s.weight }));
        if (completedSets.length === 0) continue;
        await workoutHistoryApi.storeWorkoutExercise({
          workout_id: workoutId,
          exercise_id: ex.id,
          sets: completedSets,
          date: today,
          workout_day_id: workoutDayId,
        });
      }
      navigation.replace("WorkoutSummary", {
        exercises: exercises.map((ex, i) => ({
          ...ex,
          completedSets: allExerciseData[i].sets.filter((s) => s.completed),
        })),
        totalTime,
        workoutId,
      });
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to save workout");
    }
  };

  const handleBack = () => {
    Alert.alert("Quit Workout?", "Your progress will be lost.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Quit",
        style: "destructive",
        onPress: () => {
          if (timerRef.current) clearInterval(timerRef.current);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <View
      style={{ flex: 1, backgroundColor: C.bg }}
    >
      <SafeAreaView style={{ flex: 1 }} edges={["right", "left", "top"]}>
        <StatusBar style="dark" />

        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: r(16),
            paddingVertical: r(10),
          }}
        >
          <TouchableOpacity
            onPress={handleBack}
            style={{ width: r(44), height: r(44), alignItems: "center", justifyContent: "center" }}
          >
            <Ionicons name="chevron-back" size={r(24)} color={C.textWhite} />
          </TouchableOpacity>
          <Text style={{ fontFamily: FONT.bold, fontSize: r(14), color: C.textSecondary }}>
            Exercise {currentIndex + 1}/{exercises.length}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: r(6) }}>
            <Ionicons name="time-outline" size={r(16)} color={C.orange} />
            <Text style={{ fontFamily: FONT.bold, fontSize: r(15), color: C.textWhite }}>
              {formatTime(elapsedSeconds)}
            </Text>
          </View>
        </View>

        {/* Rest Timer Overlay */}
        {isRestMode && (
          <View
            style={{
              marginHorizontal: r(16),
              marginBottom: r(12),
              backgroundColor: C.surfaceLight,
              borderRadius: r(16),
              padding: r(20),
              alignItems: "center",
              borderWidth: 1,
              borderColor: C.border,
            }}
          >
            <Ionicons name="pause-circle-outline" size={r(36)} color={C.orange} />
            <Text
              style={{
                fontFamily: FONT.extraBold,
                fontSize: r(40),
                color: C.textWhite,
                marginTop: r(8),
              }}
            >
              {restTimer}
            </Text>
            <Text style={{ fontFamily: FONT.medium, fontSize: r(13), color: C.textSecondary, marginBottom: r(12) }}>
              Rest Timer
            </Text>
            <TouchableOpacity
              onPress={skipRest}
              style={{
                backgroundColor: C.gray40,
                borderRadius: r(12),
                paddingVertical: r(10),
                paddingHorizontal: r(24),
              }}
            >
              <Text style={{ fontFamily: FONT.semiBold, fontSize: r(14), color: C.textWhite }}>
                Skip Rest
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: r(16), paddingBottom: r(32) }}
          showsVerticalScrollIndicator={false}
        >
          {/* Exercise Info */}
          <View
            style={{
              backgroundColor: C.surfaceLight,
              borderRadius: r(16),
              padding: r(16),
              marginBottom: r(16),
              borderWidth: 1,
              borderColor: C.border,
            }}
          >
            <Text style={{ fontFamily: FONT.bold, fontSize: r(18), color: C.textWhite }}>
              {exercise.title}
            </Text>
            <Text style={{ fontFamily: FONT.medium, fontSize: r(13), color: C.textSecondary, marginTop: r(4) }}>
              {exercise.muscle_group}
              {exercise.equipment ? `  ·  ${exercise.equipment}` : ""}
            </Text>
          </View>

          {/* Sets Table Header */}
          <View
            style={{
              flexDirection: "row",
              paddingHorizontal: r(12),
              marginBottom: r(8),
            }}
          >
            <Text
              style={{
                width: r(50),
                fontFamily: FONT.semiBold,
                fontSize: r(12),
                color: C.textSecondary,
              }}
            >
              SET
            </Text>
            <Text
              style={{
                flex: 1,
                fontFamily: FONT.semiBold,
                fontSize: r(12),
                color: C.textSecondary,
                textAlign: "center",
              }}
            >
              REPS
            </Text>
            <Text
              style={{
                flex: 1,
                fontFamily: FONT.semiBold,
                fontSize: r(12),
                color: C.textSecondary,
                textAlign: "center",
              }}
            >
              KG
            </Text>
            <View style={{ width: r(40) }} />
          </View>

          {/* Set Rows */}
          {exerciseData.sets.map((set, setIndex) => (
            <View
              key={setIndex}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: set.completed ? C.success5 : C.surfaceLight,
                borderRadius: r(12),
                padding: r(8),
                marginBottom: r(8),
                borderWidth: 1,
                borderColor: set.completed ? C.success10 : C.border,
              }}
            >
              <View
                style={{
                  width: r(50),
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: FONT.bold,
                    fontSize: r(15),
                    color: set.completed ? C.success : C.textSecondary,
                  }}
                >
                  {setIndex + 1}
                </Text>
              </View>

              <View style={{ flex: 1, paddingHorizontal: r(4) }}>
                <TextInput
                  value={set.reps}
                  onChangeText={(val) => updateSet(setIndex, "reps", val)}
                  keyboardType="numeric"
                  editable={!set.completed}
                  placeholder={String(exercise.reps)}
                  placeholderTextColor={C.gray40}
                  style={{
                    backgroundColor: C.surface,
                    borderRadius: r(10),
                    paddingVertical: r(10),
                    paddingHorizontal: r(12),
                    fontFamily: FONT.bold,
                    fontSize: r(15),
                    color: C.textWhite,
                    textAlign: "center",
                  }}
                />
              </View>

              <View style={{ flex: 1, paddingHorizontal: r(4) }}>
                <TextInput
                  value={set.weight}
                  onChangeText={(val) => updateSet(setIndex, "weight", val)}
                  keyboardType="numeric"
                  editable={!set.completed}
                  placeholder="0"
                  placeholderTextColor={C.gray40}
                  style={{
                    backgroundColor: C.surface,
                    borderRadius: r(10),
                    paddingVertical: r(10),
                    paddingHorizontal: r(12),
                    fontFamily: FONT.bold,
                    fontSize: r(15),
                    color: C.textWhite,
                    textAlign: "center",
                  }}
                />
              </View>

              <View style={{ width: r(40), alignItems: "center" }}>
                {set.completed ? (
                  <Ionicons name="checkmark-circle" size={r(24)} color={C.success} />
                ) : (
                  <TouchableOpacity onPress={() => markSetDone(setIndex)}>
                    <Ionicons name="ellipse-outline" size={r(24)} color={C.gray30} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}

          {/* Add Set Button */}
          <TouchableOpacity
            onPress={addSet}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: r(6),
              backgroundColor: C.surfaceLight,
              borderRadius: r(12),
              paddingVertical: r(12),
              marginBottom: r(16),
              borderWidth: 1,
              borderColor: C.border,
              borderStyle: "dashed",
            }}
          >
            <Ionicons name="add-circle-outline" size={r(18)} color={C.textSecondary} />
            <Text style={{ fontFamily: FONT.semiBold, fontSize: r(14), color: C.textSecondary }}>
              Add Set
            </Text>
          </TouchableOpacity>

          {/* Mark Set Done Button */}
          {!allSetsCompleted && (
            <TouchableOpacity
              onPress={() => {
                const firstIncomplete = exerciseData.sets.findIndex((s) => !s.completed);
                if (firstIncomplete !== -1) markSetDone(firstIncomplete);
              }}
              style={{
                borderRadius: r(14),
                overflow: "hidden",
                marginBottom: r(12),
              }}
            >
              <LinearGradient
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                colors={GRADIENT.orange}
                style={{
                  paddingVertical: r(14),
                  alignItems: "center",
                  borderRadius: r(14),
                }}
              >
                <Text style={{ fontFamily: FONT.bold, fontSize: r(16), color: '#FFFFFF' }}>
                  Mark Set Done
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Next Exercise Button */}
          {allSetsCompleted && !isLastExercise && (
            <TouchableOpacity
              onPress={goToNextExercise}
              style={{
                borderRadius: r(14),
                overflow: "hidden",
                marginBottom: r(12),
              }}
            >
              <LinearGradient
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                colors={GRADIENT.orange}
                style={{
                  paddingVertical: r(14),
                  alignItems: "center",
                  borderRadius: r(14),
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: r(8),
                }}
              >
                <Text style={{ fontFamily: FONT.bold, fontSize: r(16), color: '#FFFFFF' }}>
                  Next Exercise
                </Text>
                <Ionicons name="arrow-forward" size={r(18)} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Finish Workout Button */}
          {allSetsCompleted && isLastExercise && (
            <TouchableOpacity
              onPress={finishWorkout}
              style={{
                borderRadius: r(14),
                overflow: "hidden",
                marginBottom: r(12),
              }}
            >
              <LinearGradient
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                colors={["#34D399", "#10B981"]}
                style={{
                  paddingVertical: r(14),
                  alignItems: "center",
                  borderRadius: r(14),
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: r(8),
                }}
              >
                <Ionicons name="checkmark-circle" size={r(20)} color={C.textWhite} />
                <Text style={{ fontFamily: FONT.bold, fontSize: r(16), color: C.textWhite }}>
                  Finish Workout
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
