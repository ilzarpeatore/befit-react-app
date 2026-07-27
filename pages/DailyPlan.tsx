import React, { useCallback, useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  RefreshControl,
  ImageBackground,
  Modal,
  Pressable,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { Colors } from "@constants/colors";
import { dietApi, DailyPlanData, DailyPlanRecipeEntry } from "../api/diet";
import { recipesApi, RecipeListItem } from "../api/recipes";
import { ErrorRetryMem } from "../components/ErrorRetry";
import { LoadingSkeletonMem } from "../components/LoadingSkeleton";
import { EmptyStateMem } from "../components/EmptyState";

interface Props {
  navigation: any;
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function DailyPlan({ navigation }: Props) {
  const styles = useStyle();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [data, setData] = useState<DailyPlanData | null>(null);
  const [mealsByType, setMealsByType] = useState<Record<string, DailyPlanRecipeEntry[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [addMealFor, setAddMealFor] = useState<{ key: string; label: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<RecipeListItem[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [savingRecipeId, setSavingRecipeId] = useState<number | null>(null);

  const fetchData = useCallback(async (date: Date) => {
    try {
      setLoading(true);
      setError(null);
      const res = await dietApi.getDailyPlan(formatDate(date));
      setData(res.data?.data ?? null);
      setMealsByType(res.data?.daily_plan_recipe ?? {});
    } catch {
      setError("Failed to load daily plan.");
    } finally {
      setLoading(false);
    }
  }, []);

  const searchRecipes = useCallback(async (mealKey: string, query: string) => {
    setSearchLoading(true);
    try {
      const res = await recipesApi.getFilteredList({
        meal_type: [mealKey],
        title: query || undefined,
        per_page: 20,
      });
      setSearchResults(res.data?.data ?? []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const openAddMeal = useCallback(
    (key: string, label: string) => {
      setAddMealFor({ key, label });
      setSearchQuery("");
      setSearchResults([]);
      searchRecipes(key, "");
    },
    [searchRecipes]
  );

  useEffect(() => {
    if (!addMealFor) return;
    const timeout = setTimeout(() => searchRecipes(addMealFor.key, searchQuery), 350);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, addMealFor]);

  const addRecipeToPlan = useCallback(
    async (recipe: RecipeListItem) => {
      if (!data?.id || !addMealFor) return;
      setSavingRecipeId(recipe.id);
      try {
        await recipesApi.saveDailyPlanRecipe(data.id, recipe.id, addMealFor.key);
        setAddMealFor(null);
        await fetchData(selectedDate);
      } catch {
        Alert.alert("Error", "Could not add this meal. Please try again.");
      } finally {
        setSavingRecipeId(null);
      }
    },
    [data?.id, addMealFor, fetchData, selectedDate]
  );

  useEffect(() => {
    fetchData(selectedDate);
  }, [selectedDate, fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData(selectedDate);
    setRefreshing(false);
  }, [selectedDate, fetchData]);

  const goToPrevDay = useCallback(() => {
    setSelectedDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 1);
      return d;
    });
  }, []);

  const goToNextDay = useCallback(() => {
    setSelectedDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 1);
      return d;
    });
  }, []);

  const goToToday = useCallback(() => {
    setSelectedDate(new Date());
  }, []);

  const isToday =
    formatDate(selectedDate) === formatDate(new Date());

  const mealTypeIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
    breakfast: "sunny-outline",
    lunch: "restaurant-outline",
    dinner: "moon-outline",
    snacks: "cafe-outline",
  };

  if (loading && !refreshing) {
    return (
      <ImageBackground source={require("@assets/bg3.png")} style={styles.bg}>
        <SafeAreaView style={styles.container} edges={["right", "left", "top"]}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={22} color={Colors.TEXT_PRIMARY} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Daily Plan</Text>
          </View>
          <View style={styles.dateBar}>
            <LoadingSkeletonMem width="60@ratio" height="36@ratio" borderRadius={10} />
            <LoadingSkeletonMem width="140@ratio" height="20@ratio" borderRadius={6} />
            <LoadingSkeletonMem width="60@ratio" height="36@ratio" borderRadius={10} />
          </View>
          <View style={styles.skeletonWrap}>
            {[1, 2, 3].map((i) => (
              <React.Fragment key={i}>
                <LoadingSkeletonMem width="100%" height="120@ratio" borderRadius={16} />
                <View style={{ height: 12 }} />
              </React.Fragment>
            ))}
          </View>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  if (error && !refreshing) {
    return (
      <ImageBackground source={require("@assets/bg3.png")} style={styles.bg}>
        <SafeAreaView style={styles.container} edges={["right", "left", "top"]}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={22} color={Colors.TEXT_PRIMARY} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Daily Plan</Text>
          </View>
          <ErrorRetryMem message={error} onRetry={() => fetchData(selectedDate)} />
        </SafeAreaView>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={require("@assets/bg3.png")} style={styles.bg}>
      <SafeAreaView style={styles.container} edges={["right", "left", "top"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color={Colors.TEXT_PRIMARY} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Daily Plan</Text>
        </View>

        <View style={styles.dateBar}>
          <TouchableOpacity onPress={goToPrevDay} style={styles.dateBtn}>
            <Ionicons name="chevron-back" size={22} color={Colors.TEXT_PRIMARY} />
          </TouchableOpacity>
          <View style={styles.dateInfo}>
            <Text style={styles.dateText}>{formatDisplayDate(selectedDate)}</Text>
            {!isToday && (
              <TouchableOpacity onPress={goToToday}>
                <Text style={styles.todayLink}>Today</Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity onPress={goToNextDay} style={styles.dateBtn}>
            <Ionicons name="chevron-forward" size={22} color={Colors.TEXT_PRIMARY} />
          </TouchableOpacity>
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
          {!data ||
          Object.values(mealsByType).every((entries) => entries.length === 0) ? (
            <>
              <EmptyStateMem
                icon="calendar-outline"
                title="No Meals Planned"
                message="No meals found for this date. Tap + on a meal below to add one."
              />
              {data?.meal_type.map((mealGroup) => (
                <View key={mealGroup.key} style={styles.mealSection}>
                  <View style={styles.mealHeader}>
                    <Ionicons
                      name={mealTypeIcons[mealGroup.key] || "restaurant-outline"}
                      size={20}
                      color={Colors.ACCENT_START}
                    />
                    <Text style={styles.mealTypeTitle}>{mealGroup.display_name}</Text>
                    <TouchableOpacity
                      style={styles.addMealBtn}
                      onPress={() => openAddMeal(mealGroup.key, mealGroup.display_name)}
                    >
                      <Ionicons name="add" size={18} color={Colors.TEXT_PRIMARY} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </>
          ) : (
            <>
              {data.meal_type.map((mealGroup) => {
                const entries = mealsByType[mealGroup.key] ?? [];
                return (
                  <View key={mealGroup.key} style={styles.mealSection}>
                    <View style={styles.mealHeader}>
                      <Ionicons
                        name={mealTypeIcons[mealGroup.key] || "restaurant-outline"}
                        size={20}
                        color={Colors.ACCENT_START}
                      />
                      <Text style={styles.mealTypeTitle}>{mealGroup.display_name}</Text>
                      <Text style={styles.mealCals}>{mealGroup.total.total_calories} kcal</Text>
                      <TouchableOpacity
                        style={styles.addMealBtn}
                        onPress={() => openAddMeal(mealGroup.key, mealGroup.display_name)}
                      >
                        <Ionicons name="add" size={18} color={Colors.TEXT_PRIMARY} />
                      </TouchableOpacity>
                    </View>
                    {entries.length === 0 ? (
                      <Text style={styles.noMealText}>No {mealGroup.display_name.toLowerCase()} logged yet.</Text>
                    ) : (
                      entries.map((entry) => (
                        <TouchableOpacity
                          key={entry.id}
                          activeOpacity={0.85}
                          disabled={!entry.recipe}
                          onPress={() =>
                            navigation.navigate("RecipeDetail", { id: entry.recipe_id })
                          }
                        >
                          <LinearGradient
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            colors={[Colors.CARD_START, Colors.CARD_END]}
                            style={styles.mealCard}
                          >
                            {entry.recipe?.recipe_image ? (
                              <Image
                                source={{ uri: entry.recipe.recipe_image }}
                                style={styles.mealCardImage}
                              />
                            ) : null}
                            <View style={styles.mealCardBody}>
                              <Text style={styles.mealCardTitle} numberOfLines={1}>
                                {entry.recipe?.title ?? "Recipe unavailable"}
                              </Text>
                              <View style={styles.mealCardMacros}>
                                <Text style={styles.mealCardCal}>{entry.calories} kcal</Text>
                                <Text style={styles.mealCardMacro}>P {entry.protein}g</Text>
                                <Text style={styles.mealCardMacro}>C {entry.carbs}g</Text>
                                <Text style={styles.mealCardMacro}>F {entry.fats}g</Text>
                              </View>
                            </View>
                            <Ionicons
                              name="chevron-forward"
                              size={18}
                              color={Colors.TEXT_MUTED}
                            />
                          </LinearGradient>
                        </TouchableOpacity>
                      ))
                    )}
                  </View>
                );
              })}

              <LinearGradient
                start={{ x: 0.24, y: -0.09 }}
                end={{ x: 0.78, y: 0.93 }}
                colors={[Colors.ACCENT_START, Colors.ACCENT_END]}
                style={styles.totalCard}
              >
                <View style={styles.totalRow}>
                  <Ionicons name="flame-outline" size={24} color={Colors.TEXT_PRIMARY} />
                  <Text style={styles.totalLabel}>Daily Total</Text>
                </View>
                <Text style={styles.totalValue}>{data.daily_kcal} kcal</Text>
                <View style={styles.totalMacros}>
                  <View style={styles.totalMacroItem}>
                    <Text style={styles.totalMacroValue}>{data.protein}g</Text>
                    <Text style={styles.totalMacroLabel}>Protein</Text>
                  </View>
                  <View style={styles.totalMacroItem}>
                    <Text style={styles.totalMacroValue}>{data.carbs}g</Text>
                    <Text style={styles.totalMacroLabel}>Carbs</Text>
                  </View>
                  <View style={styles.totalMacroItem}>
                    <Text style={styles.totalMacroValue}>{data.fats}g</Text>
                    <Text style={styles.totalMacroLabel}>Fats</Text>
                  </View>
                </View>
              </LinearGradient>

              <View style={styles.summaryBar}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{data.eaten}</Text>
                  <Text style={styles.summaryLabel}>Eaten</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{data.left_eat}</Text>
                  <Text style={styles.summaryLabel}>Left</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{data.daily_kcal}</Text>
                  <Text style={styles.summaryLabel}>Goal</Text>
                </View>
              </View>
            </>
          )}
        </ScrollView>

        <Modal visible={!!addMealFor} transparent animationType="slide">
          <Pressable style={styles.modalOverlay} onPress={() => setAddMealFor(null)}>
            <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>
                Add to {addMealFor?.label ?? ""}
              </Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search recipes..."
                placeholderTextColor={Colors.TEXT_MUTED}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchLoading ? (
                <ActivityIndicator
                  size="small"
                  color={Colors.ACCENT_START}
                  style={{ marginTop: 20 }}
                />
              ) : searchResults.length === 0 ? (
                <Text style={styles.noResultsText}>No recipes found.</Text>
              ) : (
                <ScrollView style={styles.searchResultsScroll}>
                  {searchResults.map((recipe) => (
                    <TouchableOpacity
                      key={recipe.id}
                      style={styles.searchResultRow}
                      disabled={savingRecipeId === recipe.id}
                      onPress={() => addRecipeToPlan(recipe)}
                    >
                      {recipe.recipe_image ? (
                        <Image
                          source={{ uri: recipe.recipe_image }}
                          style={styles.searchResultImage}
                        />
                      ) : (
                        <View style={styles.searchResultImage} />
                      )}
                      <View style={{ flex: 1 }}>
                        <Text style={styles.searchResultTitle} numberOfLines={1}>
                          {recipe.title}
                        </Text>
                        <Text style={styles.searchResultMeta}>
                          {recipe.calories} kcal
                        </Text>
                      </View>
                      {savingRecipeId === recipe.id ? (
                        <ActivityIndicator size="small" color={Colors.ACCENT_START} />
                      ) : (
                        <Ionicons name="add-circle-outline" size={26} color={Colors.ACCENT_START} />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </Pressable>
          </Pressable>
        </Modal>
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
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: "16@ratio",
      paddingVertical: "16@ratio",
    },
    backBtn: {
      width: "40@ratio",
      height: "40@ratio",
      borderRadius: "12@ratio",
      backgroundColor: Colors.BG_CARD,
      alignItems: "center",
      justifyContent: "center",
      marginRight: "8@ratio",
    },
    headerTitle: {
      fontFamily: "Gilroy-ExtraBold",
      fontSize: "24@ratio",
      color: Colors.TEXT_PRIMARY,
    },
    dateBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: "16@ratio",
      paddingVertical: "12@ratio",
    },
    dateBtn: {
      width: "40@ratio",
      height: "40@ratio",
      borderRadius: "12@ratio",
      backgroundColor: Colors.BG_CARD,
      alignItems: "center",
      justifyContent: "center",
    },
    dateInfo: {
      alignItems: "center",
    },
    dateText: {
      fontFamily: "Gilroy-SemiBold",
      fontSize: "16@ratio",
      color: Colors.TEXT_PRIMARY,
    },
    todayLink: {
      fontFamily: "Gilroy-Medium",
      fontSize: "12@ratio",
      color: Colors.ACCENT_START,
      marginTop: "2@ratio",
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
    mealSection: {
      marginBottom: "20@ratio",
    },
    mealHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: "8@ratio",
      marginBottom: "10@ratio",
    },
    mealTypeTitle: {
      fontFamily: "Gilroy-Bold",
      fontSize: "16@ratio",
      color: Colors.TEXT_PRIMARY,
      flex: 1,
    },
    mealCals: {
      fontFamily: "Gilroy-SemiBold",
      fontSize: "13@ratio",
      color: Colors.TEXT_SECONDARY,
    },
    addMealBtn: {
      width: "28@ratio",
      height: "28@ratio",
      borderRadius: "14@ratio",
      backgroundColor: Colors.BG_CARD,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: "8@ratio",
    },
    noMealText: {
      fontFamily: "Gilroy-Regular",
      fontSize: "13@ratio",
      color: Colors.TEXT_MUTED,
      marginBottom: "8@ratio",
    },
    mealCard: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: "12@ratio",
      paddingHorizontal: "14@ratio",
      paddingVertical: "12@ratio",
      marginBottom: "8@ratio",
    },
    mealCardImage: {
      width: "44@ratio",
      height: "44@ratio",
      borderRadius: "10@ratio",
      marginRight: "12@ratio",
      backgroundColor: Colors.BG_CARD,
    },
    mealCardBody: {
      flex: 1,
    },
    mealCardTitle: {
      fontFamily: "Gilroy-Bold",
      fontSize: "14@ratio",
      color: Colors.TEXT_PRIMARY,
      marginBottom: "4@ratio",
    },
    mealCardMacros: {
      flexDirection: "row",
      gap: "10@ratio",
    },
    mealCardCal: {
      fontFamily: "Gilroy-SemiBold",
      fontSize: "12@ratio",
      color: Colors.ACCENT_START,
    },
    mealCardMacro: {
      fontFamily: "Gilroy-Regular",
      fontSize: "12@ratio",
      color: Colors.TEXT_SECONDARY,
    },
    totalCard: {
      borderRadius: "16@ratio",
      padding: "20@ratio",
      marginBottom: "16@ratio",
      marginTop: "8@ratio",
    },
    totalRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: "8@ratio",
      marginBottom: "8@ratio",
    },
    totalLabel: {
      fontFamily: "Gilroy-Bold",
      fontSize: "16@ratio",
      color: Colors.TEXT_PRIMARY,
    },
    totalValue: {
      fontFamily: "Gilroy-ExtraBold",
      fontSize: "28@ratio",
      color: Colors.TEXT_PRIMARY,
    },
    totalMacros: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginTop: "16@ratio",
    },
    totalMacroItem: {
      alignItems: "center",
    },
    totalMacroValue: {
      fontFamily: "Gilroy-Bold",
      fontSize: "16@ratio",
      color: Colors.TEXT_PRIMARY,
    },
    totalMacroLabel: {
      fontFamily: "Gilroy-Regular",
      fontSize: "12@ratio",
      color: Colors.TEXT_SECONDARY,
      marginTop: "2@ratio",
    },
    summaryBar: {
      flexDirection: "row",
      justifyContent: "space-around",
      backgroundColor: Colors.BG_CARD,
      borderRadius: "16@ratio",
      paddingVertical: "16@ratio",
    },
    summaryItem: {
      alignItems: "center",
    },
    summaryValue: {
      fontFamily: "Gilroy-Bold",
      fontSize: "18@ratio",
      color: Colors.TEXT_PRIMARY,
    },
    summaryLabel: {
      fontFamily: "Gilroy-Regular",
      fontSize: "12@ratio",
      color: Colors.TEXT_SECONDARY,
      marginTop: "4@ratio",
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
    },
    modalSheet: {
      backgroundColor: Colors.BG_PRIMARY,
      borderTopLeftRadius: "24@ratio",
      borderTopRightRadius: "24@ratio",
      padding: "24@ratio",
      maxHeight: "70%",
    },
    modalHandle: {
      width: "40@ratio",
      height: "4@ratio",
      borderRadius: "2@ratio",
      backgroundColor: Colors.BG_CARD,
      alignSelf: "center",
      marginBottom: "16@ratio",
    },
    modalTitle: {
      fontFamily: "Gilroy-Bold",
      fontSize: "18@ratio",
      color: Colors.TEXT_PRIMARY,
      marginBottom: "16@ratio",
    },
    searchInput: {
      backgroundColor: Colors.BG_CARD,
      borderRadius: "12@ratio",
      paddingHorizontal: "14@ratio",
      paddingVertical: "10@ratio",
      fontFamily: "Gilroy-Regular",
      fontSize: "14@ratio",
      color: Colors.TEXT_PRIMARY,
      marginBottom: "12@ratio",
    },
    noResultsText: {
      fontFamily: "Gilroy-Regular",
      fontSize: "14@ratio",
      color: Colors.TEXT_MUTED,
      textAlign: "center",
      marginTop: "20@ratio",
    },
    searchResultsScroll: {
      maxHeight: "320@ratio",
    },
    searchResultRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: "10@ratio",
      borderBottomWidth: 1,
      borderBottomColor: Colors.BG_CARD,
    },
    searchResultImage: {
      width: "44@ratio",
      height: "44@ratio",
      borderRadius: "10@ratio",
      marginRight: "12@ratio",
      backgroundColor: Colors.BG_CARD,
    },
    searchResultTitle: {
      fontFamily: "Gilroy-SemiBold",
      fontSize: "14@ratio",
      color: Colors.TEXT_PRIMARY,
    },
    searchResultMeta: {
      fontFamily: "Gilroy-Regular",
      fontSize: "12@ratio",
      color: Colors.TEXT_SECONDARY,
      marginTop: "2@ratio",
    },
  });
}
