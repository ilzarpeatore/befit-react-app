import React, { useCallback, useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  RefreshControl,
  ImageBackground,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { Colors } from "@constants/colors";
import { dietApi, DietListItem } from "../api/diet";
import { DietCardMem } from "../components/DietCard";
import { EmptyStateMem } from "../components/EmptyState";
import { ErrorRetryMem } from "../components/ErrorRetry";
import { LoadingSkeletonMem } from "../components/LoadingSkeleton";

interface Props {
  navigation: any;
}

export default function DietDashboard({ navigation }: Props) {
  const styles = useStyle();
  const [data, setData] = useState<DietListItem[]>([]);
  const [assignedDiets, setAssignedDiets] = useState<DietListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [dashboardRes, assignedRes] = await Promise.allSettled([
        dietApi.getDashboard(),
        dietApi.getAssignedDiets(),
      ]);
      if (dashboardRes.status === "fulfilled") {
        setData(dashboardRes.value.data?.data ?? []);
      }
      if (assignedRes.status === "fulfilled") {
        setAssignedDiets(assignedRes.value.data?.data ?? []);
      }
      if (dashboardRes.status === "rejected") {
        setError("Failed to load diet dashboard.");
      }
    } catch {
      setError("Failed to load diet dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const openDietDetail = useCallback(
    (id: number) => {
      navigation.navigate("Migrated", { screen: "MigratedDietDetail", params: { id } });
    },
    [navigation]
  );

  const featuredDiets = data.filter((d) => d.is_featured === "1");
  const recentMeals = data.filter((d) => d.is_featured !== "1");

  if (loading && !refreshing) {
    return (
      <ImageBackground
        source={require("@assets/bg3.png")}
        style={styles.bg}
      >
        <SafeAreaView style={styles.container} edges={["right", "left", "top"]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#1E1C3A', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
              <Ionicons name="chevron-back" size={22} color="#FBFBFB" />
            </TouchableOpacity>
            <Text style={{ flex: 1, fontSize: 18, fontFamily: 'Gilroy-Bold', color: '#FBFBFB' }}>Diet</Text>
            <View style={{ width: 40 }} />
          </View>
          <View style={styles.skeletonWrap}>
            <LoadingSkeletonMem width="100%" height="120@ratio" borderRadius={16} />
            <View style={{ height: 16 }} />
            <LoadingSkeletonMem width="100%" height="180@ratio" borderRadius={16} />
          </View>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  if (error && !refreshing) {
    return (
      <ImageBackground
        source={require("@assets/bg3.png")}
        style={styles.bg}
      >
        <SafeAreaView style={styles.container} edges={["right", "left", "top"]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#1E1C3A', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
              <Ionicons name="chevron-back" size={22} color="#FBFBFB" />
            </TouchableOpacity>
            <Text style={{ flex: 1, fontSize: 18, fontFamily: 'Gilroy-Bold', color: '#FBFBFB' }}>Diet</Text>
            <View style={{ width: 40 }} />
          </View>
          <ErrorRetryMem message={error} onRetry={fetchData} />
        </SafeAreaView>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={require("@assets/bg3.png")} style={styles.bg}>
      <SafeAreaView style={styles.container} edges={["right", "left", "top"]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#1E1C3A', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
            <Ionicons name="chevron-back" size={22} color="#FBFBFB" />
          </TouchableOpacity>
          <Text style={{ flex: 1, fontSize: 18, fontFamily: 'Gilroy-Bold', color: '#FBFBFB' }}>Diet</Text>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.ACCENT_START}
            />
          }
        >
          {data.length === 0 && assignedDiets.length === 0 ? (
            <EmptyStateMem
              icon="nutrition-outline"
              title="No Diet Data"
              message="Start tracking your meals to see your dashboard."
            />
          ) : (
            <>
              {assignedDiets.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Assigned to Me</Text>
                  </View>
                  {assignedDiets.map((item) => (
                    <DietCardMem
                      key={`assigned-${item.id}`}
                      title={item.title}
                      calories={Number(item.calories)}
                      image={item.diet_image}
                      onPress={() => openDietDetail(item.id)}
                    />
                  ))}
                </View>
              )}

              <LinearGradient
                start={{ x: 0.24, y: -0.09 }}
                end={{ x: 0.78, y: 0.93 }}
                colors={[Colors.CARD_START, Colors.CARD_END]}
                style={styles.summaryCard}
              >
                <View style={styles.summaryRow}>
                  <View style={styles.summaryItem}>
                    <Ionicons name="flame-outline" size={28} color={Colors.ACCENT_START} />
                    <Text style={styles.summaryValue}>
                      {data.reduce((sum, d) => sum + Number(d.calories || 0), 0)}
                    </Text>
                    <Text style={styles.summaryLabel}>Total kcal</Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryItem}>
                    <Ionicons name="leaf-outline" size={28} color={Colors.SUCCESS} />
                    <Text style={styles.summaryValue}>
                      {data.reduce((sum, d) => sum + Number(d.protein || 0), 0)}
                    </Text>
                    <Text style={styles.summaryLabel}>Protein (g)</Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryItem}>
                    <Ionicons name="flash-outline" size={28} color={Colors.PINK_ACCENT} />
                    <Text style={styles.summaryValue}>
                      {data.reduce((sum, d) => sum + Number(d.carbs || 0), 0)}
                    </Text>
                    <Text style={styles.summaryLabel}>Carbs (g)</Text>
                  </View>
                </View>
              </LinearGradient>

              {featuredDiets.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Featured Diets</Text>
                    <TouchableOpacity
                      onPress={() => navigation.navigate("DietList")}
                    >
                      <Text style={styles.viewAll}>View All</Text>
                    </TouchableOpacity>
                  </View>
                  <FlatList
                    data={featuredDiets}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                      <View style={styles.featuredItem}>
                        <DietCardMem
                          title={item.title}
                          calories={Number(item.calories)}
                          image={item.diet_image}
                          onPress={() =>
                            openDietDetail(item.id)
                          }
                        />
                      </View>
                    )}
                  />
                </View>
              )}

              {recentMeals.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recent Meals</Text>
                  </View>
                  {recentMeals.map((item) => (
                    <DietCardMem
                      key={item.id.toString()}
                      title={item.title}
                      calories={Number(item.calories)}
                      image={item.diet_image}
                      onPress={() =>
                        openDietDetail(item.id)
                      }
                    />
                  ))}
                </View>
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

function useStyle() {
  return useResponsiveStyleSheet({
    bg: {
      width: "100%",
      height: "100%",
      backgroundColor: Colors.BG_PRIMARY,
    },
    container: {
      flex: 1,
    },
    header: {
      paddingHorizontal: "16@ratio",
      paddingVertical: "16@ratio",
    },
    headerTitle: {
      fontFamily: "Gilroy-ExtraBold",
      fontSize: "24@ratio",
      color: Colors.TEXT_PRIMARY,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: "16@ratio",
      paddingBottom: "32@ratio",
    },
    skeletonWrap: {
      paddingHorizontal: "16@ratio",
      paddingTop: "16@ratio",
    },
    summaryCard: {
      borderRadius: "16@ratio",
      padding: "20@ratio",
      marginBottom: "24@ratio",
    },
    summaryRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
    },
    summaryItem: {
      alignItems: "center",
    },
    summaryValue: {
      fontFamily: "Gilroy-Bold",
      fontSize: "20@ratio",
      color: Colors.TEXT_PRIMARY,
      marginTop: "8@ratio",
    },
    summaryLabel: {
      fontFamily: "Gilroy-Regular",
      fontSize: "12@ratio",
      color: Colors.TEXT_SECONDARY,
      marginTop: "4@ratio",
    },
    summaryDivider: {
      width: 1,
      height: "40@ratio",
      backgroundColor: Colors.TEXT_MUTED,
    },
    section: {
      marginBottom: "24@ratio",
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "12@ratio",
    },
    sectionTitle: {
      fontFamily: "Gilroy-Bold",
      fontSize: "18@ratio",
      color: Colors.TEXT_PRIMARY,
    },
    viewAll: {
      fontFamily: "Gilroy-SemiBold",
      fontSize: "14@ratio",
      color: Colors.ACCENT_START,
    },
    featuredItem: {
      width: "280@ratio",
      marginRight: "12@ratio",
    },
  });
}
