import React, { useCallback, useEffect, useState, useRef } from "react";
import {
  FlatList,
  Text,
  View,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { Colors } from "@constants/colors";
import { dietApi, DietListItem, DietCategory } from "../api/diet";
import { DietCardMem } from "../components/DietCard";
import { EmptyStateMem } from "../components/EmptyState";
import { ErrorRetryMem } from "../components/ErrorRetry";
import { LoadingSkeletonMem } from "../components/LoadingSkeleton";

interface Props {
  navigation: any;
}

export default function DietList({ navigation }: Props) {
  const styles = useStyle();
  const [data, setData] = useState<DietListItem[]>([]);
  const [categories, setCategories] = useState<DietCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchData = useCallback(
    async (catId?: number | null, search?: string, pageNum: number = 1) => {
      try {
        if (pageNum === 1) setLoading(true);
        setError(null);
        let res;
        if (search && search.trim().length > 0) {
          res = await dietApi.search(search.trim(), pageNum);
        } else {
          res = await dietApi.getList({
            categorydiet_id: catId ?? undefined,
            page: pageNum,
          });
        }
        if (pageNum === 1) {
          setData(res.data?.data ?? []);
        } else {
          setData((prev) => [...prev, ...(res.data?.data ?? [])]);
        }
        setTotalPages(res.data?.pagination?.totalPages ?? 1);
      } catch {
        setError("Failed to load diet list.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  const fetchCategories = useCallback(async () => {
    try {
      const res = await dietApi.getCategories();
      setCategories(res.data?.data ?? []);
    } catch {
      // categories are optional, fail silently
    }
  }, []);

  useEffect(() => {
    fetchData(selectedCategory, searchQuery, 1);
    fetchCategories();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    await fetchData(selectedCategory, searchQuery, 1);
    setRefreshing(false);
  }, [selectedCategory, searchQuery, fetchData]);

  const onCategoryPress = useCallback(
    (catId: number | null) => {
      setSelectedCategory(catId);
      setPage(1);
      setSearchQuery("");
      fetchData(catId, "", 1);
    },
    [fetchData]
  );

  const onSearchChange = useCallback(
    (text: string) => {
      setSearchQuery(text);
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
      searchTimeout.current = setTimeout(() => {
        setPage(1);
        fetchData(selectedCategory, text, 1);
      }, 500);
    },
    [selectedCategory, fetchData]
  );

  const loadMore = useCallback(() => {
    if (loadingMore || page >= totalPages) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    fetchData(selectedCategory, searchQuery, nextPage);
  }, [loadingMore, page, totalPages, selectedCategory, searchQuery, fetchData]);

  const renderHeader = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color={Colors.TEXT_MUTED} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search diets..."
          placeholderTextColor={Colors.TEXT_MUTED}
          value={searchQuery}
          onChangeText={onSearchChange}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange("")}>
            <Ionicons name="close-circle" size={20} color={Colors.TEXT_MUTED} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={[{ id: 0, title: "All", categorydiet_image: "" } as DietCategory, ...categories]}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.chipList}
        renderItem={({ item }) => {
          const isActive =
            item.id === 0 ? selectedCategory === null : selectedCategory === item.id;
          return (
            <TouchableOpacity
              onPress={() =>
                onCategoryPress(item.id === 0 ? null : item.id)
              }
              activeOpacity={0.85}
            >
              {isActive ? (
                <LinearGradient
                  start={{ x: 0.24, y: -0.09 }}
                  end={{ x: 0.78, y: 0.93 }}
                  colors={[Colors.ACCENT_START, Colors.ACCENT_END]}
                  style={styles.chip}
                >
                  <Text style={styles.chipTextActive}>{item.title}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.chipInactive}>
                  <Text style={styles.chipText}>{item.title}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );

  if (loading && !refreshing) {
    return (
      <ImageBackground source={require("@assets/bg3.png")} style={styles.bg}>
        <SafeAreaView style={styles.container} edges={["right", "left", "top"]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#1E1C3A', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
              <Ionicons name="chevron-back" size={22} color="#FBFBFB" />
            </TouchableOpacity>
            <Text style={{ flex: 1, fontSize: 18, fontFamily: 'Gilroy-Bold', color: '#FBFBFB' }}>Diet List</Text>
            <View style={{ width: 40 }} />
          </View>
          <View style={styles.skeletonWrap}>
            {[1, 2, 3].map((i) => (
              <React.Fragment key={i}>
                <LoadingSkeletonMem width="100%" height="160@ratio" borderRadius={16} />
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
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#1E1C3A', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
              <Ionicons name="chevron-back" size={22} color="#FBFBFB" />
            </TouchableOpacity>
            <Text style={{ flex: 1, fontSize: 18, fontFamily: 'Gilroy-Bold', color: '#FBFBFB' }}>Diet List</Text>
            <View style={{ width: 40 }} />
          </View>
          <ErrorRetryMem message={error} onRetry={() => fetchData(selectedCategory, searchQuery, 1)} />
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
          <Text style={{ flex: 1, fontSize: 18, fontFamily: 'Gilroy-Bold', color: '#FBFBFB' }}>Diet List</Text>
          <View style={{ width: 40 }} />
        </View>
        <FlatList
          data={data}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            <EmptyStateMem
              icon="nutrition-outline"
              title="No Diets Found"
              message="Try a different search or category."
            />
          }
          renderItem={({ item }) => (
            <View style={styles.cardWrap}>
              <DietCardMem
                title={item.title}
                calories={Number(item.calories)}
                image={item.diet_image}
                onPress={() =>
                  navigation.navigate("Migrated", { screen: "MigratedDietDetail", params: { id: item.id } })
                }
              />
            </View>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.ACCENT_START}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
        />
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
    searchContainer: {
      paddingHorizontal: "16@ratio",
      marginBottom: "8@ratio",
    },
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: Colors.BG_INPUT,
      borderRadius: "12@ratio",
      paddingHorizontal: "12@ratio",
      paddingVertical: "10@ratio",
      marginBottom: "12@ratio",
    },
    searchInput: {
      flex: 1,
      fontFamily: "Gilroy-Regular",
      fontSize: "14@ratio",
      color: Colors.TEXT_PRIMARY,
      marginLeft: "8@ratio",
    },
    chipList: {
      paddingBottom: "8@ratio",
    },
    chip: {
      paddingHorizontal: "16@ratio",
      paddingVertical: "8@ratio",
      borderRadius: "20@ratio",
      marginRight: "8@ratio",
    },
    chipInactive: {
      paddingHorizontal: "16@ratio",
      paddingVertical: "8@ratio",
      borderRadius: "20@ratio",
      marginRight: "8@ratio",
      backgroundColor: Colors.BG_CARD,
    },
    chipTextActive: {
      fontFamily: "Gilroy-SemiBold",
      fontSize: "13@ratio",
      color: Colors.TEXT_PRIMARY,
    },
    chipText: {
      fontFamily: "Gilroy-SemiBold",
      fontSize: "13@ratio",
      color: Colors.TEXT_SECONDARY,
    },
    cardWrap: {
      paddingHorizontal: "16@ratio",
    },
    listContent: {
      paddingBottom: "32@ratio",
    },
    skeletonWrap: {
      paddingHorizontal: "16@ratio",
      paddingTop: "16@ratio",
    },
  });
}
