import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  ImageBackground,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { Colors } from "@constants/colors";
import { workoutsApi, WorkoutListItem } from "../api/workouts";
import { WorkoutCardMem } from "../components/WorkoutCard";
import { EmptyStateMem } from "../components/EmptyState";
import { ErrorRetryMem } from "../components/ErrorRetry";
import { LoadingSkeletonMem } from "../components/LoadingSkeleton";

interface WorkoutType {
  id: number;
  title: string;
}

interface Props {
  navigation: any;
}

export default function WorkoutList({ navigation }: Props) {
  const styles = useStyle();
  const [workouts, setWorkouts] = useState<WorkoutListItem[]>([]);
  const [types, setTypes] = useState<WorkoutType[]>([]);
  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchWorkouts = useCallback(
    async (pageNum: number = 1, typeId: number | null = selectedType) => {
      try {
        setError(null);
        const params: any = { page: pageNum };
        if (typeId) params.workout_type_id = typeId;
        const res = typeId
          ? await workoutsApi.getFilteredList(params)
          : await workoutsApi.getList(pageNum);
        const data = res.data?.data ?? [];
        if (pageNum === 1) {
          setWorkouts(data);
        } else {
          setWorkouts((prev) => [...prev, ...data]);
        }
        setHasMore(pageNum < (res.data?.pagination?.total_pages ?? 1));
      } catch (e: any) {
        setError(e?.message || "Failed to load workouts");
      }
    },
    [selectedType]
  );

  const fetchTypes = useCallback(async () => {
    try {
      const res = await workoutsApi.getTypes();
      setTypes(res.data?.data ?? []);
    } catch {}
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchWorkouts(1), fetchTypes()]).finally(() =>
      setLoading(false)
    );
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    await fetchWorkouts(1);
    setRefreshing(false);
  }, [fetchWorkouts]);

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchWorkouts(nextPage);
    }
  }, [loading, hasMore, page, fetchWorkouts]);

  const handleTypeFilter = useCallback(
    (typeId: number | null) => {
      setSelectedType(typeId);
      setPage(1);
      setLoading(true);
      fetchWorkouts(1, typeId).finally(() => setLoading(false));
    },
    [fetchWorkouts]
  );

  const renderSkeleton = () => (
    <View style={styles.listContent}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.skeletonCard}>
          <LoadingSkeletonMem
            width="100%"
            height="160@ratio"
            borderRadius={16}
          />
        </View>
      ))}
    </View>
  );

  const renderTypeChip = (type: WorkoutType) => {
    const isActive = selectedType === type.id;
    return (
      <TouchableOpacity
        key={type.id}
        activeOpacity={0.85}
        onPress={() => handleTypeFilter(isActive ? null : type.id)}
      >
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          colors={
            isActive
              ? [Colors.ACCENT_START, Colors.ACCENT_END]
              : [Colors.CARD_START, Colors.CARD_END]
          }
          style={[styles.chip, isActive && styles.chipActive]}
        >
          <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
            {type.title}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderItem = useCallback(
    ({ item }: { item: WorkoutListItem }) => (
      <WorkoutCardMem
        title={item.title}
        subtitle={item.workout_type_title}
        level={item.level_title}
        image={item.workout_image}
        isFavourite={item.is_favourite === 1}
        onPress={() => navigation.navigate("WorkoutDetail", { id: item.id })}
      />
    ),
    [navigation]
  );

  const keyExtractor = useCallback((item: WorkoutListItem) => item.id.toString(), []);

  return (
    <ImageBackground
      source={require("@assets/bg3.png")}
      style={styles.bg}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container} edges={["right", "left", "top"]}>
        <View style={styles.container2}>
          <View style={styles.topbar}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={24} color={Colors.TEXT_PRIMARY} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Workouts</Text>
            <View style={styles.backBtn} />
          </View>

          <View style={styles.chipContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipScroll}
            >
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => handleTypeFilter(null)}
              >
                <LinearGradient
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  colors={
                    selectedType === null
                      ? [Colors.ACCENT_START, Colors.ACCENT_END]
                      : [Colors.CARD_START, Colors.CARD_END]
                  }
                  style={styles.chip}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedType === null && styles.chipTextActive,
                    ]}
                  >
                    All
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
              {types.map(renderTypeChip)}
            </ScrollView>
          </View>

          {loading && !refreshing ? (
            renderSkeleton()
          ) : error ? (
            <ErrorRetryMem
              message={error}
              onRetry={() => {
                setLoading(true);
                fetchWorkouts(1).finally(() => setLoading(false));
              }}
            />
          ) : workouts.length === 0 ? (
            <EmptyStateMem
              icon="barbell-outline"
              title="No workouts found"
              message="Check back later for new workouts"
            />
          ) : (
            <FlatList
              data={workouts}
              renderItem={renderItem}
              keyExtractor={keyExtractor}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                undefined
              }
              onRefresh={handleRefresh}
              refreshing={refreshing}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.3}
            />
          )}
        </View>
        <StatusBar style="dark" />
      </SafeAreaView>
    </ImageBackground>
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
    chipContainer: {
      marginBottom: "16@ratio",
    },
    chipScroll: {
      paddingHorizontal: "16@ratio",
      gap: 8,
    },
    chip: {
      borderRadius: "20@ratio",
      paddingHorizontal: "16@ratio",
      paddingVertical: "8@ratio",
      marginRight: "8@ratio",
    },
    chipActive: {},
    chipText: {
      fontFamily: "Gilroy-SemiBold",
      fontSize: "13@ratio",
      color: Colors.TEXT_SECONDARY,
    },
    chipTextActive: {
      color: Colors.TEXT_PRIMARY,
    },
    listContent: {
      paddingHorizontal: "16@ratio",
      paddingBottom: "24@ratio",
    },
    skeletonCard: {
      marginBottom: "12@ratio",
    },
  });
}
