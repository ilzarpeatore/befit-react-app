import React, { useEffect, useState, useCallback } from "react";
import {
  ImageBackground,
  FlatList,
  View,
  Text,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useResponsiveStyleSheet } from "../helper/responsiveStyleSheet";
import { Colors } from "../constants/colors";
import { workoutsApi } from "../api/workouts";
import { WorkoutCardMem } from "../components/WorkoutCard";
import { LoadingSkeletonMem } from "../components/LoadingSkeleton";
import { EmptyStateMem } from "../components/EmptyState";
import { ErrorRetryMem } from "../components/ErrorRetry";

interface FavouriteWorkout {
  id: number;
  title: string;
  description?: string;
  workout_type?: { title: string };
  level?: { title: string };
  workout_duration?: string;
}

export default function FavouriteWorkouts() {
  const styles = useStyle();
  const navigation = useNavigation<any>();
  const [data, setData] = useState<FavouriteWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFavourites = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await workoutsApi.getFavourite();
      setData(res.data?.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load favourites");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchFavourites();
  }, [fetchFavourites]);

  if (error && !loading) {
    return (
      <ImageBackground source={require("@assets/bg3.png")} style={styles.bg} resizeMode="cover">
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <Ionicons name="chevron-back" size={24} color={Colors.TEXT_PRIMARY} onPress={() => navigation.goBack()} />
            <Text style={styles.headerTitle}>Favourites</Text>
            <View style={{ width: 40 }} />
          </View>
          <ErrorRetryMem message={error} onRetry={() => fetchFavourites()} />
        </SafeAreaView>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={require("@assets/bg3.png")} style={styles.bg} resizeMode="cover">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="chevron-back" size={24} color={Colors.TEXT_PRIMARY} onPress={() => navigation.goBack()} />
          <Text style={styles.headerTitle}>Favourites</Text>
          <View style={{ width: 40 }} />
        </View>

        {loading ? (
          <View style={styles.list}>
            {[1, 2, 3].map((i) => (
              <LoadingSkeletonMem key={i} width="100%" height={100} borderRadius={16} />
            ))}
          </View>
        ) : (
          <FlatList
            data={data}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <WorkoutCardMem
                title={item.title}
                subtitle={item.workout_type?.title}
                duration={item.workout_duration}
                level={item.level?.title}
                onPress={() => navigation.navigate("WorkoutDetail", { id: item.id })}
              />
            )}
            contentContainerStyle={styles.list}
            ListEmptyComponent={<EmptyStateMem icon="heart-outline" title="No favourites yet" message="Workouts you favourite will appear here." />}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchFavourites(true)} tintColor={Colors.ACCENT_START} />}
          />
        )}
        <StatusBar style="dark" />
      </SafeAreaView>
    </ImageBackground>
  );
}

function useStyle() {
  return useResponsiveStyleSheet({
    bg: { width: "100%", height: "100%", backgroundColor: Colors.BG_PRIMARY },
    container: { flex: 1 },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: "20@ratio", paddingTop: "10@ratio", height: "48@ratio" },
    headerTitle: { fontFamily: "Gilroy-Bold", fontSize: "18@ratio", color: Colors.TEXT_PRIMARY },
    list: { paddingHorizontal: "16@ratio", paddingBottom: "30@ratio", gap: 12 },
  });
}
