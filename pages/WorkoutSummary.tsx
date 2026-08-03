import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ImageBackground } from "react-native";
import { C, FONT, GRADIENT } from "./migrated/theme";

interface CompletedSet {
  reps: string;
  weight: string;
  completed: boolean;
}

interface ExerciseResult {
  id: number;
  title: string;
  muscle_group: string;
  completedSets: CompletedSet[];
}

interface RouteParams {
  exercises: ExerciseResult[];
  totalTime: number;
  workoutId: number;
}

export default function WorkoutSummary() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { exercises = [], totalTime = 0, workoutId } = (route.params ?? {}) as Partial<RouteParams>;
  const { width: winW, height: winH } = useWindowDimensions();
  const sc = Math.min(winW / 375, winH / 812);
  const r = (n: number) => Math.round(n * sc);

  const totalSets = exercises.reduce((acc, ex) => acc + ex.completedSets.length, 0);
  const minutes = Math.floor(totalTime / 60);
  const seconds = totalTime % 60;

  const getBestSet = (sets: CompletedSet[]) => {
    let bestWeight = 0;
    let bestReps = "0";
    sets.forEach((s) => {
      const w = parseFloat(s.weight) || 0;
      if (w > bestWeight) {
        bestWeight = w;
        bestReps = s.reps;
      }
    });
    return { weight: bestWeight, reps: bestReps };
  };

  const handleDone = () => {
    navigation.popToTop();
  };

  return (
    <View
      style={{ flex: 1, backgroundColor: C.bg }}
    >
      <SafeAreaView style={{ flex: 1 }} edges={["right", "left", "top"]}>
        <StatusBar style="dark" />
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: r(20),
            paddingTop: r(40),
            paddingBottom: r(40),
            alignItems: "center",
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Checkmark Circle */}
          <View
            style={{
              width: r(80),
              height: r(80),
              borderRadius: r(40),
              backgroundColor: C.success10,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: r(20),
            }}
          >
            <Ionicons name="checkmark-circle" size={r(50)} color={C.success} />
          </View>

          {/* Title */}
          <Text
            style={{
              fontFamily: FONT.extraBold,
              fontSize: r(26),
              color: C.textWhite,
              marginBottom: r(8),
            }}
          >
            Workout Complete!
          </Text>

          {/* Stats Row */}
          <View
            style={{
              flexDirection: "row",
              gap: r(24),
              marginBottom: r(32),
            }}
          >
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontFamily: FONT.bold, fontSize: r(22), color: C.orange }}>
                {exercises.length}
              </Text>
              <Text style={{ fontFamily: FONT.medium, fontSize: r(12), color: C.textSecondary }}>
                Exercises
              </Text>
            </View>
            <View style={{ width: 1, height: r(30), backgroundColor: C.border }} />
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontFamily: FONT.bold, fontSize: r(22), color: C.orange }}>
                {totalSets}
              </Text>
              <Text style={{ fontFamily: FONT.medium, fontSize: r(12), color: C.textSecondary }}>
                Sets
              </Text>
            </View>
            <View style={{ width: 1, height: r(30), backgroundColor: C.border }} />
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontFamily: FONT.bold, fontSize: r(22), color: C.orange }}>
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </Text>
              <Text style={{ fontFamily: FONT.medium, fontSize: r(12), color: C.textSecondary }}>
                Time
              </Text>
            </View>
          </View>

          {/* Exercise List */}
          <View style={{ width: "100%", gap: r(10) }}>
            {exercises.map((ex, index) => {
              const best = getBestSet(ex.completedSets);
              return (
                <View
                  key={ex.id}
                  style={{
                    backgroundColor: C.surfaceLight,
                    borderRadius: r(14),
                    padding: r(14),
                    flexDirection: "row",
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: C.border,
                  }}
                >
                  <View
                    style={{
                      width: r(32),
                      height: r(32),
                      borderRadius: r(16),
                      backgroundColor: "#E5E5EA",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: r(12),
                    }}
                  >
                    <Text style={{ fontFamily: FONT.bold, fontSize: r(13), color: C.textPrimary }}>
                      {index + 1}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: FONT.bold, fontSize: r(14), color: C.textWhite }}>
                      {ex.title}
                    </Text>
                    <Text style={{ fontFamily: FONT.medium, fontSize: r(11), color: C.textSecondary }}>
                      {ex.completedSets.length} sets
                      {best.weight > 0
                        ? `  ·  Best: ${best.weight}kg × ${best.reps}`
                        : ""}
                    </Text>
                  </View>
                  <Ionicons name="checkmark-circle" size={r(20)} color={C.success} />
                </View>
              );
            })}
          </View>

          {/* Done Button */}
          <TouchableOpacity
            onPress={handleDone}
            style={{
              width: "100%",
              borderRadius: r(16),
              overflow: "hidden",
              marginTop: r(32),
            }}
          >
            <LinearGradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              colors={GRADIENT.orange}
              style={{
                paddingVertical: r(16),
                alignItems: "center",
                borderRadius: r(16),
              }}
            >
              <Text style={{ fontFamily: FONT.bold, fontSize: r(17), color: '#FFFFFF' }}>
                Done
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
