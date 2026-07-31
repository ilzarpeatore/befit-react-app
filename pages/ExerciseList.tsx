import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  FlatList,
  Text,
  View,
  ImageBackground,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { Colors } from "@constants/colors";
import { exercisesApi, ExerciseItem, BodyPartItem, EquipmentItem, LevelItem } from "../api/exercises";
import { ExerciseCardMem } from "../components/ExerciseCard";
import { EmptyStateMem } from "../components/EmptyState";
import { ErrorRetryMem } from "../components/ErrorRetry";
import { LoadingSkeletonMem } from "../components/LoadingSkeleton";

interface Props {
  navigation: any;
}

export default function ExerciseList({ navigation }: Props) {
  const styles = useStyle();

  const [exercises, setExercises] = useState<ExerciseItem[]>([]);
  const [bodyParts, setBodyParts] = useState<BodyPartItem[]>([]);
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [levels, setLevels] = useState<LevelItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedBodyPart, setSelectedBodyPart] = useState<number | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<number | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [searchText, setSearchText] = useState("");
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchExercises = useCallback(async (refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      let res;
      if (searchText.trim()) {
        res = await exercisesApi.search(searchText.trim());
      } else if (selectedBodyPart) {
        res = await exercisesApi.getByBodyPart(selectedBodyPart);
      } else if (selectedEquipment) {
        res = await exercisesApi.getByEquipment(selectedEquipment);
      } else if (selectedLevel) {
        res = await exercisesApi.getByLevel(selectedLevel);
      } else {
        res = await exercisesApi.getList();
      }
      setExercises(res.data?.data ?? []);
    } catch (e: any) {
      setError(e?.message || "Failed to load exercises");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedBodyPart, selectedEquipment, selectedLevel, searchText]);

  const handleSearchChange = (text: string) => {
    setSearchText(text);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      fetchExercises();
    }, 400);
  };

  const fetchFilters = useCallback(async () => {
    try {
      const [bpRes, eqRes, lvRes] = await Promise.all([
        exercisesApi.getBodyParts(),
        exercisesApi.getEquipment(),
        exercisesApi.getLevels(),
      ]);
      setBodyParts(bpRes.data?.data ?? []);
      setEquipment(eqRes.data?.data ?? []);
      setLevels(lvRes.data?.data ?? []);
    } catch {}
  }, []);

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  const clearFilters = () => {
    setSelectedBodyPart(null);
    setSelectedEquipment(null);
    setSelectedLevel(null);
    setSearchText("");
  };

  const hasActiveFilter =
    selectedBodyPart !== null || selectedEquipment !== null || selectedLevel !== null || searchText.trim().length > 0;

  const renderFilterChip = (
    label: string,
    active: boolean,
    onPress: () => void
  ) => (
    <TouchableOpacity
      key={label}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        colors={
          active
            ? ["#1C1C1E", "#000000"]
            : ["#E5E5EA", "#E5E5EA"]
        }
        style={styles.chip}
      >
        <Text style={[styles.chipText, active && styles.chipTextActive]}>
          {label}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderSkeletons = () => (
    <View style={styles.skeletonList}>
      {Array.from({ length: 5 }).map((_, i) => (
        <View key={i} style={styles.skeletonItem}>
          <LoadingSkeletonMem width="100%" height="180@ratio" borderRadius={16} />
        </View>
      ))}
    </View>
  );

  const renderItem = ({ item }: { item: ExerciseItem }) => (
    <ExerciseCardMem
      title={item.title}
      bodyPart={item.bodypart_name?.[0]?.title}
      equipment={item.equipment_title}
      level={item.level_title}
      image={item.exercise_image}
      onPress={() => navigation.navigate("ExerciseInfo", { id: item.id })}
    />
  );

  return (
    <View style={styles.bg}>
      <SafeAreaView style={styles.container} edges={["right", "left", "top"]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.TEXT_PRIMARY} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Exercises</Text>
          <View style={styles.backBtn} />
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={Colors.TEXT_SECONDARY} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search exercises..."
            placeholderTextColor={Colors.TEXT_SECONDARY}
            value={searchText}
            onChangeText={handleSearchChange}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => handleSearchChange("")}>
              <Ionicons name="close-circle" size={18} color={Colors.TEXT_SECONDARY} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filterSection}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={bodyParts}
            keyExtractor={(item) => `bp-${item.id}`}
            contentContainerStyle={styles.chipRow}
            renderItem={({ item }) =>
              renderFilterChip(
                item.title,
                selectedBodyPart === item.id,
                () => {
                  setSelectedBodyPart(selectedBodyPart === item.id ? null : item.id);
                  setSelectedEquipment(null);
                  setSelectedLevel(null);
                }
              )
            }
          />
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={equipment}
            keyExtractor={(item) => `eq-${item.id}`}
            contentContainerStyle={styles.chipRow}
            renderItem={({ item }) =>
              renderFilterChip(
                item.title,
                selectedEquipment === item.id,
                () => {
                  setSelectedEquipment(selectedEquipment === item.id ? null : item.id);
                  setSelectedBodyPart(null);
                  setSelectedLevel(null);
                }
              )
            }
          />
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={levels}
            keyExtractor={(item) => `lv-${item.id}`}
            contentContainerStyle={styles.chipRow}
            renderItem={({ item }) =>
              renderFilterChip(
                item.title,
                selectedLevel === item.id,
                () => {
                  setSelectedLevel(selectedLevel === item.id ? null : item.id);
                  setSelectedBodyPart(null);
                  setSelectedEquipment(null);
                }
              )
            }
          />
          {hasActiveFilter ? (
            <TouchableOpacity onPress={clearFilters} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={16} color={Colors.TEXT_SECONDARY} />
              <Text style={styles.clearText}>Clear filters</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {error ? (
          <ErrorRetryMem message={error} onRetry={() => fetchExercises()} />
        ) : loading && !refreshing ? (
          renderSkeletons()
        ) : exercises.length === 0 ? (
          <EmptyStateMem
            icon="barbell-outline"
            title="No exercises found"
            message="Try adjusting your filters"
          />
        ) : (
          <FlatList
            data={exercises}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => fetchExercises(true)}
                tintColor={Colors.TEXT_SECONDARY}
              />
            }
          />
        )}
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
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: Colors.BG_CARD,
      borderRadius: "12@ratio",
      marginHorizontal: "16@ratio",
      marginBottom: "8@ratio",
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
    headerTitle: {
      fontFamily: "Gilroy-Bold",
      fontSize: "20@ratio",
      color: Colors.TEXT_PRIMARY,
    },
    filterSection: {
      paddingBottom: "8@ratio",
    },
    chipRow: {
      paddingHorizontal: "16@ratio",
      paddingVertical: "6@ratio",
      gap: 8,
    },
    chip: {
      borderRadius: "20@ratio",
      paddingHorizontal: "16@ratio",
      paddingVertical: "8@ratio",
    },
    chipText: {
      fontFamily: "Gilroy-Medium",
      fontSize: "13@ratio",
      color: Colors.TEXT_SECONDARY,
    },
    chipTextActive: {
      color: "#FFFFFF",
    },
    clearBtn: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "center",
      marginTop: "4@ratio",
      gap: 4,
    },
    clearText: {
      fontFamily: "Gilroy-Medium",
      fontSize: "12@ratio",
      color: Colors.TEXT_SECONDARY,
    },
    listContent: {
      paddingHorizontal: "16@ratio",
      paddingBottom: "24@ratio",
    },
    skeletonList: {
      paddingHorizontal: "16@ratio",
    },
    skeletonItem: {
      marginBottom: "12@ratio",
    },
  });
}
