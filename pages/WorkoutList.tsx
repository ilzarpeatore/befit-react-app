import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Text,
  View,
  Pressable,
  ScrollView,
  TextInput,
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

interface WorkoutLevel {
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
  const [levels, setLevels] = useState<WorkoutLevel[]>([]);
  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [searchText, setSearchText] = useState("");
  const pageRef = useRef(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasMoreRef = useRef(true);

  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchWorkouts = useCallback(
    async (
      pageNum: number = 1,
      typeId: number | null = selectedType,
      levelId: number | null = selectedLevel,
      title: string = searchText
    ) => {
      try {
        setError(null);
        const hasFilters = !!typeId || !!levelId || !!title.trim();
        const params: any = { page: pageNum };
        if (typeId) params.workout_type_id = typeId;
        if (levelId) params.level_ids = levelId;
        if (title.trim()) params.title = title.trim();
        const res = hasFilters
          ? await workoutsApi.getFilteredList(params)
          : await workoutsApi.getList(pageNum);
        const data = res.data?.data ?? [];
        if (pageNum === 1) {
          setWorkouts(data);
        } else {
          setWorkouts((prev) => [...prev, ...data]);
        }
        hasMoreRef.current = pageNum < (res.data?.pagination?.total_pages ?? 1);
      } catch (e: any) {
        setError(e?.message || "Failed to load workouts");
      }
    },
    [selectedType, selectedLevel, searchText]
  );

  const fetchTypes = useCallback(async () => {
    try {
      const res = await workoutsApi.getTypes();
      setTypes(res.data?.data ?? []);
    } catch {}
  }, []);

  const fetchLevels = useCallback(async () => {
    try {
      const res = await workoutsApi.getLevels();
      setLevels(res.data?.data ?? []);
    } catch {}
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchWorkouts(1), fetchTypes(), fetchLevels()]).finally(() =>
      setLoading(false)
    );
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    pageRef.current = 1;
    await fetchWorkouts(1);
    setRefreshing(false);
  }, [fetchWorkouts]);

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMoreRef.current) {
      const nextPage = pageRef.current + 1;
      pageRef.current = nextPage;
      fetchWorkouts(nextPage);
    }
  }, [loading, fetchWorkouts]);

  const handleTypeFilter = useCallback(
    (typeId: number | null) => {
      setSelectedType(typeId);
      pageRef.current = 1;
      setLoading(true);
      fetchWorkouts(1, typeId, selectedLevel, searchText).finally(() => setLoading(false));
    },
    [fetchWorkouts, selectedLevel, searchText]
  );

  const handleLevelFilter = useCallback(
    (levelId: number | null) => {
      setSelectedLevel(levelId);
      pageRef.current = 1;
      setLoading(true);
      fetchWorkouts(1, selectedType, levelId, searchText).finally(() => setLoading(false));
    },
    [fetchWorkouts, selectedType, searchText]
  );

  const handleSearchChange = useCallback(
    (text: string) => {
      setSearchText(text);
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = setTimeout(() => {
        pageRef.current = 1;
        setLoading(true);
        fetchWorkouts(1, selectedType, selectedLevel, text).finally(() => setLoading(false));
      }, 400);
    },
    [fetchWorkouts, selectedType, selectedLevel]
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
      <Pressable
        key={type.id}
        style={({ pressed }) => pressed && { opacity: 0.85 }}
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
      </Pressable>
    );
  };

  const renderLevelChip = (level: WorkoutLevel) => {
    const isActive = selectedLevel === level.id;
    return (
      <Pressable
        key={level.id}
        style={({ pressed }) => pressed && { opacity: 0.85 }}
        onPress={() => handleLevelFilter(isActive ? null : level.id)}
      >
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          colors={
            isActive
              ? [Colors.ACCENT_START, Colors.ACCENT_END]
              : [Colors.CARD_START, Colors.CARD_END]
          }
          style={styles.chip}
        >
          <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
            {level.title}
          </Text>
        </LinearGradient>
      </Pressable>
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
    <View
      style={styles.bg}
    >
      <SafeAreaView style={styles.container} edges={["right", "left", "top"]}>
        <View style={styles.container2}>
          <View style={styles.topbar}>
            <Pressable
              style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.2 }]}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={24} color={Colors.TEXT_PRIMARY} />
            </Pressable>
            <Text style={styles.headerTitle}>Workouts</Text>
            <View style={styles.backBtn} />
          </View>

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color={Colors.TEXT_SECONDARY} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search workouts..."
              placeholderTextColor={Colors.TEXT_SECONDARY}
              value={searchText}
              onChangeText={handleSearchChange}
            />
            {searchText.length > 0 && (
              <Pressable
                onPress={() => handleSearchChange("")}
                style={({ pressed }) => pressed && { opacity: 0.2 }}
              >
                <Ionicons name="close-circle" size={18} color={Colors.TEXT_SECONDARY} />
              </Pressable>
            )}
          </View>

          <View style={styles.chipContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipScroll}
            >
              <Pressable
                style={({ pressed }) => pressed && { opacity: 0.85 }}
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
              </Pressable>
              {types.map(renderTypeChip)}
            </ScrollView>
          </View>

          {levels.length > 0 && (
            <View style={styles.chipContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipScroll}
              >
                <Pressable
                  style={({ pressed }) => pressed && { opacity: 0.85 }}
                  onPress={() => handleLevelFilter(null)}
                >
                  <LinearGradient
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    colors={
                      selectedLevel === null
                        ? [Colors.ACCENT_START, Colors.ACCENT_END]
                        : [Colors.CARD_START, Colors.CARD_END]
                    }
                    style={styles.chip}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selectedLevel === null && styles.chipTextActive,
                      ]}
                    >
                      All levels
                    </Text>
                  </LinearGradient>
                </Pressable>
                {levels.map(renderLevelChip)}
              </ScrollView>
            </View>
          )}

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
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: Colors.BG_CARD,
      borderRadius: "12@ratio",
      marginHorizontal: "16@ratio",
      marginBottom: "12@ratio",
      paddingHorizontal: "12@ratio",
      paddingVertical: "8@ratio",
      gap: 8,
    },
    searchInput: {
      flex: 1,
      fontFamily: "Gilroy-Regular",
      fontSize: "14@ratio",
      color: Colors.TEXT_PRIMARY,
      padding: 0,
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
