import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { Colors } from "@constants/colors";
import {
  workoutsApi,
  WorkoutDetailResponse,
} from "../api/workouts";
import { EmptyStateMem } from "../components/EmptyState";
import { ErrorRetryMem } from "../components/ErrorRetry";
import { LoadingSkeletonMem } from "../components/LoadingSkeleton";

interface WorkoutDay {
  id: number;
  workout_id: number;
  sequence: number;
  is_rest: number;
  day_title: string;
}

export default function WorkoutDetail() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const styles = useStyle();
  const { id } = route.params ?? {};
  const [detail, setDetail] = useState<WorkoutDetailResponse["data"] | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!id) {
      setError("No workout ID provided.");
      return;
    }
    try {
      setError(null);
      const res = await workoutsApi.getDetail(id);
      setDetail(res.data?.data ?? null);
    } catch (e: any) {
      setError(e?.message || "Failed to load workout details");
    }
  }, [id]);

  useEffect(() => {
    setLoading(true);
    fetchDetail().finally(() => setLoading(false));
  }, [fetchDetail]);

  const handleFavourite = useCallback(async () => {
    if (!detail) return;
    try {
      await workoutsApi.setFavourite(id);
      setDetail((prev) =>
        prev
          ? { ...prev, is_favourite: prev.is_favourite === 1 ? 0 : 1 }
          : prev
      );
    } catch {}
  }, [detail, id]);

  const renderDayCard = useCallback(
    ({ item }: { item: WorkoutDay }) => (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() =>
          navigation.navigate("WorkoutDayExercises", {
            workoutDayId: item.id,
            dayName: item.day_title,
          })
        }
      >
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          colors={[Colors.CARD_START, Colors.CARD_END]}
          style={styles.dayCard}
        >
          <View style={styles.dayCardLeft}>
            <Text style={styles.dayTitle}>{item.day_title}</Text>
            <Text style={styles.daySequence}>Day {item.sequence}</Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={Colors.TEXT_SECONDARY}
          />
        </LinearGradient>
      </TouchableOpacity>
    ),
    [navigation, styles]
  );

  const keyExtractor = useCallback(
    (item: WorkoutDay) => item.id.toString(),
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
              <Text style={styles.headerTitle}>Workout</Text>
              <View style={styles.backBtn} />
            </View>
            <View style={styles.content}>
              {[1, 2, 3].map((i) => (
                <View key={i} style={{ marginBottom: 12 }}>
                  <LoadingSkeletonMem
                    width="100%"
                    height="70@ratio"
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
              <Text style={styles.headerTitle}>Workout</Text>
              <View style={styles.backBtn} />
            </View>
            <ErrorRetryMem message={error} onRetry={fetchDetail} />
          </View>
          <StatusBar style="dark" />
        </SafeAreaView>
      </View>
    );
  }

  if (!detail) return null;

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
            <Text style={styles.headerTitle}>Workout</Text>
            <TouchableOpacity style={styles.backBtn} onPress={handleFavourite}>
              <Ionicons
                name={
                  detail.is_favourite === 1 ? "heart" : "heart-outline"
                }
                size={24}
                color={
                  detail.is_favourite === 1
                    ? Colors.PINK_ACCENT
                    : Colors.TEXT_SECONDARY
                }
              />
            </TouchableOpacity>
          </View>

          <FlatList
            data={detail.workout_day}
            renderItem={renderDayCard}
            keyExtractor={keyExtractor}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <View style={styles.detailHeader}>
                <Text style={styles.detailTitle}>{detail.title}</Text>
                {detail.description ? (
                  <Text style={styles.detailDesc}>{detail.description}</Text>
                ) : null}
                <View style={styles.badgeRow}>
                  {detail.level_title ? (
                    <View style={styles.badge}>
                      <Ionicons
                        name="bar-chart-outline"
                        size={12}
                        color={Colors.TEXT_SECONDARY}
                      />
                      <Text style={styles.badgeText}>
                        {detail.level_title}
                      </Text>
                    </View>
                  ) : null}
                  {detail.workout_type_title ? (
                    <View style={styles.badge}>
                      <Ionicons
                        name="fitness-outline"
                        size={12}
                        color={Colors.TEXT_SECONDARY}
                      />
                      <Text style={styles.badgeText}>
                        {detail.workout_type_title}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
            }
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <EmptyStateMem
                icon="calendar-outline"
                title="No workout days"
                message="This workout has no days yet"
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
    },
    content: {
      paddingHorizontal: "16@ratio",
    },
    listContent: {
      paddingHorizontal: "16@ratio",
      paddingBottom: "24@ratio",
    },
    detailHeader: {
      marginBottom: "20@ratio",
    },
    detailTitle: {
      fontFamily: "Gilroy-Bold",
      fontSize: "24@ratio",
      color: Colors.TEXT_PRIMARY,
      marginBottom: "8@ratio",
    },
    detailDesc: {
      fontFamily: "Gilroy-Regular",
      fontSize: "14@ratio",
      color: Colors.TEXT_SECONDARY,
      lineHeight: "20@ratio",
      marginBottom: "16@ratio",
    },
    badgeRow: {
      flexDirection: "row",
      gap: 8,
    },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#E5E5EA",
      borderRadius: "20@ratio",
      paddingHorizontal: "10@ratio",
      paddingVertical: "4@ratio",
      gap: 4,
    },
    badgeText: {
      fontFamily: "Gilroy-Medium",
      fontSize: "12@ratio",
      color: Colors.TEXT_SECONDARY,
    },
    dayCard: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderRadius: "16@ratio",
      padding: "16@ratio",
      marginBottom: "12@ratio",
    },
    dayCardLeft: {
      flex: 1,
    },
    dayTitle: {
      fontFamily: "Gilroy-Bold",
      fontSize: "16@ratio",
      color: Colors.TEXT_PRIMARY,
      marginBottom: "4@ratio",
    },
    daySequence: {
      fontFamily: "Gilroy-Medium",
      fontSize: "13@ratio",
      color: Colors.TEXT_SECONDARY,
    },
  });
}
