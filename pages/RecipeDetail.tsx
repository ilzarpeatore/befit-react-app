import React, { useCallback, useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Image,
  Share,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { Colors } from "@constants/colors";
import { dietApi, RecipeDetail as RecipeDetailType } from "../api/diet";
import { ErrorRetryMem } from "../components/ErrorRetry";
import { LoadingSkeletonMem } from "../components/LoadingSkeleton";

export default function RecipeDetail() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const styles = useStyle();
  const { id } = route.params ?? {};
  const [data, setData] = useState<RecipeDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favourite, setFavourite] = useState(false);

  const fetchData = useCallback(async () => {
    if (!id) {
      setError("No recipe ID provided.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await dietApi.getRecipeDetail(id);
      const recipeData = res.data?.data;
      setData(recipeData);
      if (recipeData) setFavourite(recipeData.is_favourite === 1);
    } catch {
      setError("Failed to load recipe details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleFavourite = useCallback(async () => {
    try {
      setFavourite((prev) => !prev);
      await dietApi.setFavourite(id);
    } catch {
      setFavourite((prev) => !prev);
    }
  }, [id]);

  const onShare = useCallback(async () => {
    if (!data) return;
    try {
      await Share.share({
        message: `Check out this recipe: ${data.title} - ${data.calories} kcal`,
      });
    } catch {
      // share cancelled
    }
  }, [data]);

  if (loading) {
    return (
      <ImageBackground source={require("@assets/bg3.png")} style={styles.bg}>
        <SafeAreaView style={styles.container} edges={["right", "left", "top"]}>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={Colors.TEXT_PRIMARY} />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <LoadingSkeletonMem width="100%" height="200@ratio" borderRadius={0} />
            <View style={styles.bodyWrap}>
              <LoadingSkeletonMem width="70%" height="24@ratio" borderRadius={8} />
              <View style={{ height: 12 }} />
              <LoadingSkeletonMem width="100%" height="16@ratio" borderRadius={8} />
              <View style={{ height: 8 }} />
              <LoadingSkeletonMem width="90%" height="16@ratio" borderRadius={8} />
            </View>
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  if (error) {
    return (
      <ImageBackground source={require("@assets/bg3.png")} style={styles.bg}>
        <SafeAreaView style={styles.container} edges={["right", "left", "top"]}>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={Colors.TEXT_PRIMARY} />
            </TouchableOpacity>
          </View>
          <ErrorRetryMem message={error} onRetry={fetchData} />
        </SafeAreaView>
      </ImageBackground>
    );
  }

  if (!data) return null;

  const ingredients = data.recipe_ingredients || [];
  let steps: string[] = [];
  try {
    steps = JSON.parse(data.preparation_methods || "[]");
  } catch {
    steps = data.preparation_methods
      ? data.preparation_methods.split(/\n|(?<=\.)\s+/).filter(Boolean)
      : [];
  }

  return (
    <ImageBackground source={require("@assets/bg3.png")} style={styles.bg}>
      <SafeAreaView style={styles.container} edges={["right", "left", "top"]}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.TEXT_PRIMARY} />
          </TouchableOpacity>
          <View style={styles.topActions}>
            <TouchableOpacity onPress={onShare} style={styles.iconBtn}>
              <Ionicons name="share-outline" size={22} color={Colors.TEXT_PRIMARY} />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleFavourite} style={styles.iconBtn}>
              <Ionicons
                name={favourite ? "heart" : "heart-outline"}
                size={22}
                color={favourite ? Colors.PINK_ACCENT : Colors.TEXT_PRIMARY}
              />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {data.recipe_image ? (
            <Image source={{ uri: data.recipe_image }} style={styles.heroImage} />
          ) : null}

          <Text style={styles.title}>{data.title}</Text>

          <View style={styles.macrosRow}>
            <View style={styles.macroItem}>
              <Ionicons name="flame-outline" size={18} color={Colors.ACCENT_START} />
              <Text style={styles.macroValue}>{data.calories}</Text>
              <Text style={styles.macroLabel}>kcal</Text>
            </View>
            <View style={styles.macroItem}>
              <Ionicons name="leaf-outline" size={18} color={Colors.SUCCESS} />
              <Text style={styles.macroValue}>{data.protein}g</Text>
              <Text style={styles.macroLabel}>Protein</Text>
            </View>
            <View style={styles.macroItem}>
              <Ionicons name="flash-outline" size={18} color={Colors.PINK_ACCENT} />
              <Text style={styles.macroValue}>{data.carbs}g</Text>
              <Text style={styles.macroLabel}>Carbs</Text>
            </View>
            <View style={styles.macroItem}>
              <Ionicons name="water-outline" size={18} color={Colors.DANGER} />
              <Text style={styles.macroValue}>{data.fats}g</Text>
              <Text style={styles.macroLabel}>Fats</Text>
            </View>
          </View>

          {data.description ? (
            <Text style={styles.description}>{data.description}</Text>
          ) : null}

          {data.preparation_time != null && (
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={16} color={Colors.TEXT_SECONDARY} />
              <Text style={styles.infoText}>{data.preparation_time} min</Text>
            </View>
          )}

          {ingredients.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ingredients</Text>
              {ingredients.map((ing) => (
                <View key={ing.id} style={styles.ingredientRow}>
                  <View style={styles.ingredientDot} />
                  <Text style={styles.ingredientName}>{ing.ingredient_name}</Text>
                  <Text style={styles.ingredientQty}>
                    {ing.quantity} {ing.measurement_unit_name}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {steps.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Instructions</Text>
              {steps.map((step, index) => (
                <View key={index} style={styles.stepRow}>
                  <LinearGradient
                    start={{ x: 0.24, y: -0.09 }}
                    end={{ x: 0.78, y: 0.93 }}
                    colors={[Colors.ACCENT_START, Colors.ACCENT_END]}
                    style={styles.stepBadge}
                  >
                    <Text style={styles.stepNumber}>{index + 1}</Text>
                  </LinearGradient>
                  <Text style={styles.stepText}>{step.replace(/^"|"$/g, "")}</Text>
                </View>
              ))}
            </View>
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
    topBar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: "16@ratio",
      paddingVertical: "12@ratio",
    },
    backBtn: {
      width: "40@ratio",
      height: "40@ratio",
      borderRadius: "12@ratio",
      backgroundColor: Colors.BG_CARD,
      alignItems: "center",
      justifyContent: "center",
    },
    topActions: {
      flexDirection: "row",
      gap: "8@ratio",
    },
    iconBtn: {
      width: "40@ratio",
      height: "40@ratio",
      borderRadius: "12@ratio",
      backgroundColor: Colors.BG_CARD,
      alignItems: "center",
      justifyContent: "center",
    },
    scrollContent: {
      paddingBottom: "32@ratio",
    },
    heroImage: {
      width: "100%",
      height: "220@ratio",
      resizeMode: "cover",
    },
    bodyWrap: {
      paddingHorizontal: "16@ratio",
      paddingTop: "20@ratio",
    },
    title: {
      fontFamily: "Gilroy-ExtraBold",
      fontSize: "22@ratio",
      color: Colors.TEXT_PRIMARY,
      paddingHorizontal: "16@ratio",
      marginTop: "20@ratio",
    },
    macrosRow: {
      flexDirection: "row",
      justifyContent: "space-around",
      paddingHorizontal: "16@ratio",
      paddingVertical: "20@ratio",
      marginTop: "8@ratio",
      marginHorizontal: "16@ratio",
      backgroundColor: Colors.BG_CARD,
      borderRadius: "16@ratio",
    },
    macroItem: {
      alignItems: "center",
    },
    macroValue: {
      fontFamily: "Gilroy-Bold",
      fontSize: "16@ratio",
      color: Colors.TEXT_PRIMARY,
      marginTop: "4@ratio",
    },
    macroLabel: {
      fontFamily: "Gilroy-Regular",
      fontSize: "11@ratio",
      color: Colors.TEXT_SECONDARY,
      marginTop: "2@ratio",
    },
    description: {
      fontFamily: "Gilroy-Regular",
      fontSize: "14@ratio",
      color: Colors.TEXT_SECONDARY,
      lineHeight: "22@ratio",
      paddingHorizontal: "16@ratio",
      marginTop: "20@ratio",
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: "6@ratio",
      paddingHorizontal: "16@ratio",
      marginTop: "12@ratio",
    },
    infoText: {
      fontFamily: "Gilroy-Medium",
      fontSize: "14@ratio",
      color: Colors.TEXT_SECONDARY,
    },
    section: {
      paddingHorizontal: "16@ratio",
      marginTop: "24@ratio",
    },
    sectionTitle: {
      fontFamily: "Gilroy-Bold",
      fontSize: "18@ratio",
      color: Colors.TEXT_PRIMARY,
      marginBottom: "12@ratio",
    },
    ingredientRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: "10@ratio",
    },
    ingredientDot: {
      width: "6@ratio",
      height: "6@ratio",
      borderRadius: "3@ratio",
      backgroundColor: Colors.ACCENT_START,
      marginRight: "10@ratio",
    },
    ingredientName: {
      flex: 1,
      fontFamily: "Gilroy-Medium",
      fontSize: "14@ratio",
      color: Colors.TEXT_PRIMARY,
    },
    ingredientQty: {
      fontFamily: "Gilroy-Regular",
      fontSize: "13@ratio",
      color: Colors.TEXT_SECONDARY,
    },
    stepRow: {
      flexDirection: "row",
      marginBottom: "14@ratio",
    },
    stepBadge: {
      width: "28@ratio",
      height: "28@ratio",
      borderRadius: "14@ratio",
      alignItems: "center",
      justifyContent: "center",
      marginRight: "12@ratio",
      marginTop: "2@ratio",
    },
    stepNumber: {
      fontFamily: "Gilroy-Bold",
      fontSize: "13@ratio",
      color: Colors.TEXT_PRIMARY,
    },
    stepText: {
      flex: 1,
      fontFamily: "Gilroy-Regular",
      fontSize: "14@ratio",
      color: Colors.TEXT_SECONDARY,
      lineHeight: "22@ratio",
    },
  });
}
