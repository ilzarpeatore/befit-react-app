import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { Colors } from "@constants/colors";
import { exercisesApi, ExerciseItem } from "../api/exercises";
import { ErrorRetryMem } from "../components/ErrorRetry";
import { LoadingSkeletonMem } from "../components/LoadingSkeleton";

export default function ExerciseDetail() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const styles = useStyle();
  const { id } = route.params ?? {};

  const [exercise, setExercise] = useState<(ExerciseItem & { equipment_image: string; seconds_per_rep: number }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = async () => {
    if (!id) {
      setError("No exercise ID provided.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await exercisesApi.getDetail(id);
      setExercise(res.data?.data ?? null);
    } catch (e: any) {
      setError(e?.message || "Failed to load exercise");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  if (error) {
    return (
      <View style={styles.bg}>
        <SafeAreaView style={styles.container} edges={["right", "left", "top"]}>
          <View style={styles.header}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.2 }]}
            >
              <Ionicons name="arrow-back" size={24} color={Colors.TEXT_PRIMARY} />
            </Pressable>
            <Text style={styles.headerTitle}>Exercise</Text>
            <View style={styles.backBtn} />
          </View>
          <ErrorRetryMem message={error} onRetry={fetchDetail} />
        </SafeAreaView>
      </View>
    );
  }

  if (loading || !exercise) {
    return (
      <View style={styles.bg}>
        <SafeAreaView style={styles.container} edges={["right", "left", "top"]}>
          <View style={styles.header}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.2 }]}
            >
              <Ionicons name="arrow-back" size={24} color={Colors.TEXT_PRIMARY} />
            </Pressable>
            <Text style={styles.headerTitle}>Exercise</Text>
            <View style={styles.backBtn} />
          </View>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <LoadingSkeletonMem width="100%" height="220@ratio" borderRadius={16} />
            <LoadingSkeletonMem width="60%" height="28@ratio" borderRadius={8} />
            <LoadingSkeletonMem width="40%" height="20@ratio" borderRadius={8} />
            <LoadingSkeletonMem width="100%" height="80@ratio" borderRadius={8} />
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.bg}>
      <SafeAreaView style={styles.container} edges={["right", "left", "top"]}>
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.2 }]}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.TEXT_PRIMARY} />
          </Pressable>
          <Text style={styles.headerTitle}>Exercise</Text>
          <View style={styles.backBtn} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {exercise.exercise_image ? (
            <Image
              source={{ uri: exercise.exercise_image }}
              contentFit="cover"
              style={styles.heroImage}
            />
          ) : (
            <View style={styles.heroPlaceholder}>
              <Ionicons name="barbell-outline" size={64} color={Colors.TEXT_MUTED} />
            </View>
          )}

          <Text style={styles.title}>{exercise.title}</Text>

          <View style={styles.badgeRow}>
            {exercise.level_title ? (
              <LinearGradient
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                colors={[Colors.ACCENT_START, Colors.ACCENT_END]}
                style={styles.badge}
              >
                <Text style={styles.badgeText}>{exercise.level_title}</Text>
              </LinearGradient>
            ) : null}
            {exercise.equipment_title ? (
              <View style={styles.badgeOutline}>
                <Text style={styles.badgeOutlineText}>{exercise.equipment_title}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.tagRow}>
            {exercise.bodypart_name?.map((bp) => (
              <View key={bp.id} style={styles.tag}>
                <Text style={styles.tagText}>{bp.title}</Text>
              </View>
            ))}
          </View>

          {exercise.instruction ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Instructions</Text>
              <Text style={styles.sectionBody}>{exercise.instruction}</Text>
            </View>
          ) : null}

          {exercise.tips ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tips</Text>
              <Text style={styles.sectionBody}>{exercise.tips}</Text>
            </View>
          ) : null}

          {exercise.sets && exercise.sets.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sets</Text>
              {exercise.sets.map((set, index) => (
                <View key={index} style={styles.setRow}>
                  <Text style={styles.setLabel}>Set {index + 1}</Text>
                  <View style={styles.setDetails}>
                    {set.reps ? (
                      <Text style={styles.setDetail}>{set.reps} reps</Text>
                    ) : null}
                    {set.time ? (
                      <Text style={styles.setDetail}>{set.time}s</Text>
                    ) : null}
                    {set.rest ? (
                      <Text style={styles.setDetail}>Rest {set.rest}s</Text>
                    ) : null}
                    {set.weight ? (
                      <Text style={styles.setDetail}>{set.weight}kg</Text>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
          ) : null}

          <Pressable
            style={({ pressed }) => pressed && { opacity: 0.85 }}
            onPress={() =>
              navigation.navigate("WorkoutSession", {
                exercises: [exercise],
                workoutId: route.params?.workoutId,
                workoutDayId: route.params?.workoutDayId,
              })
            }
          >
            <LinearGradient
              start={{ x: 0.24, y: -0.09 }}
              end={{ x: 0.78, y: 0.93 }}
              colors={[Colors.ACCENT_START, Colors.ACCENT_END]}
              style={styles.startBtn}
            >
              <Ionicons name="play" size={20} color={Colors.TEXT_PRIMARY} />
              <Text style={styles.startBtnText}>Start Exercise</Text>
            </LinearGradient>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function useStyle() {
  return useResponsiveStyleSheet({
    bg: {
      flex: 1,
      backgroundColor: Colors.BG_PRIMARY,
    },
    container: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: "16@ratio",
      paddingVertical: "12@ratio",
    },
    backBtn: {
      width: "40@ratio",
      height: "40@ratio",
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      fontFamily: "Gilroy-Bold",
      fontSize: "20@ratio",
      color: Colors.TEXT_PRIMARY,
    },
    content: {
      paddingHorizontal: "16@ratio",
      paddingBottom: "40@ratio",
    },
    heroImage: {
      width: "100%",
      height: "220@ratio",
      borderRadius: "16@ratio",
      marginBottom: "20@ratio",
    },
    heroPlaceholder: {
      width: "100%",
      height: "220@ratio",
      borderRadius: "16@ratio",
      backgroundColor: Colors.BG_CARD,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: "20@ratio",
    },
    title: {
      fontFamily: "Gilroy-ExtraBold",
      fontSize: "24@ratio",
      color: Colors.TEXT_PRIMARY,
      marginBottom: "12@ratio",
    },
    badgeRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: "12@ratio",
    },
    badge: {
      borderRadius: "20@ratio",
      paddingHorizontal: "16@ratio",
      paddingVertical: "6@ratio",
    },
    badgeText: {
      fontFamily: "Gilroy-Bold",
      fontSize: "13@ratio",
      color: Colors.TEXT_PRIMARY,
    },
    badgeOutline: {
      borderRadius: "20@ratio",
      borderWidth: 1,
      borderColor: Colors.TEXT_MUTED,
      paddingHorizontal: "16@ratio",
      paddingVertical: "6@ratio",
    },
    badgeOutlineText: {
      fontFamily: "Gilroy-Medium",
      fontSize: "13@ratio",
      color: Colors.TEXT_SECONDARY,
    },
    tagRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
      marginBottom: "20@ratio",
    },
    tag: {
      backgroundColor: "#E5E5EA",
      borderRadius: "20@ratio",
      paddingHorizontal: "12@ratio",
      paddingVertical: "5@ratio",
    },
    tagText: {
      fontFamily: "Gilroy-Medium",
      fontSize: "12@ratio",
      color: Colors.TEXT_SECONDARY,
    },
    section: {
      marginBottom: "20@ratio",
    },
    sectionTitle: {
      fontFamily: "Gilroy-Bold",
      fontSize: "16@ratio",
      color: Colors.TEXT_PRIMARY,
      marginBottom: "8@ratio",
    },
    sectionBody: {
      fontFamily: "Gilroy-Regular",
      fontSize: "14@ratio",
      color: Colors.TEXT_SECONDARY,
      lineHeight: "22@ratio",
    },
    setRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#F7F7F7",
      borderRadius: "12@ratio",
      paddingHorizontal: "14@ratio",
      paddingVertical: "10@ratio",
      marginBottom: "6@ratio",
    },
    setLabel: {
      fontFamily: "Gilroy-Bold",
      fontSize: "13@ratio",
      color: Colors.TEXT_PRIMARY,
      width: "60@ratio",
    },
    setDetails: {
      flex: 1,
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    setDetail: {
      fontFamily: "Gilroy-Medium",
      fontSize: "12@ratio",
      color: Colors.TEXT_SECONDARY,
    },
    startBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "16@ratio",
      paddingVertical: "16@ratio",
      marginTop: "12@ratio",
      gap: 8,
    },
    startBtnText: {
      fontFamily: "Gilroy-Bold",
      fontSize: "16@ratio",
      color: Colors.TEXT_PRIMARY,
    },
  });
}
