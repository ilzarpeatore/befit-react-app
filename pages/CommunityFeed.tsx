import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Text,
  View,
  Pressable,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { Colors } from "@constants/colors";
import { postsApi, PostData } from "../api/posts";
import { PostCardMem } from "../components/PostCard";
import { EmptyStateMem } from "../components/EmptyState";
import { ErrorRetryMem } from "../components/ErrorRetry";
import { LoadingSkeletonMem } from "../components/LoadingSkeleton";

interface Props {
  navigation: any;
}

export default function CommunityFeed({ navigation }: Props) {
  const styles = useStyle();
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = useCallback(
    async (pageNum: number = 1, isRefresh: boolean = false) => {
      try {
        if (isRefresh) setRefreshing(true);
        else if (pageNum === 1) setLoading(true);

        setError(null);
        const res = await postsApi.getList(pageNum);
        const newData = res.data?.data ?? [];
        const pagination = res.data?.pagination;

        if (pageNum === 1) {
          setPosts(newData);
        } else {
          setPosts((prev) => [...prev, ...newData]);
        }
        setHasMore(pagination ? pageNum < pagination.totalPages : false);
        setPage(pageNum);
      } catch (e) {
        if (pageNum === 1) setError("Failed to load posts. Please try again.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  const handleRefresh = useCallback(() => {
    fetchPosts(1, true);
  }, [fetchPosts]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !loading && !refreshing) {
      fetchPosts(page + 1);
    }
  }, [hasMore, loading, refreshing, page, fetchPosts]);

  const handlePostPress = useCallback(
    (id: number) => {
      navigation.navigate("PostDetail", { id });
    },
    [navigation]
  );

  const renderSkeleton = () => (
    <View style={styles.skeletonList}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.skeletonItem}>
          <View style={styles.skeletonHeader}>
            <LoadingSkeletonMem
              width={"40@ratio"}
              height={"40@ratio"}
              borderRadius={20}
            />
            <View style={styles.skeletonHeaderText}>
              <LoadingSkeletonMem width={"120@ratio"} height={"14@ratio"} />
              <LoadingSkeletonMem
                width={"80@ratio"}
                height={"10@ratio"}
              />
            </View>
          </View>
          <LoadingSkeletonMem height={"14@ratio"} />
          <LoadingSkeletonMem width={"200@ratio"} height={"14@ratio"} />
          <LoadingSkeletonMem
            height={"180@ratio"}
            borderRadius={12}
          />
        </View>
      ))}
    </View>
  );

  const renderItem = useCallback(
    ({ item }: { item: PostData }) => (
      <PostCardMem
        username={item.users?.display_name || "User"}
        avatar={item.users?.profile_image}
        content={item.description}
        image={item.posting_media_array?.[0]?.media_url}
        likes={item.posting_like_count}
        comments={item.posting_comment_count}
        time={item.created_at}
        onPress={() => handlePostPress(item.id)}
      />
    ),
    [handlePostPress]
  );

  const keyExtractor = useCallback((item: PostData) => item.id.toString(), []);

  if (loading && posts.length === 0) {
    return (
      <View
        style={styles.bg}
      >
        <SafeAreaView style={styles.container} edges={["right", "left", "top"]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={({ pressed }) => [
                { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E5E5EA', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
                pressed && { opacity: 0.2 },
              ]}
            >
              <Ionicons name="chevron-back" size={22} color="#000000" />
            </Pressable>
            <Text style={{ flex: 1, fontSize: 18, fontFamily: 'Gilroy-Bold', color: '#000000' }}>Community</Text>
            <View style={{ width: 40 }} />
          </View>
          {renderSkeleton()}
        </SafeAreaView>
        <StatusBar style="dark" />
      </View>
    );
  }

  if (error && posts.length === 0) {
    return (
      <View
        style={styles.bg}
      >
        <SafeAreaView style={styles.container} edges={["right", "left", "top"]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={({ pressed }) => [
                { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E5E5EA', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
                pressed && { opacity: 0.2 },
              ]}
            >
              <Ionicons name="chevron-back" size={22} color="#000000" />
            </Pressable>
            <Text style={{ flex: 1, fontSize: 18, fontFamily: 'Gilroy-Bold', color: '#000000' }}>Community</Text>
            <View style={{ width: 40 }} />
          </View>
          <ErrorRetryMem message={error} onRetry={() => fetchPosts(1)} />
        </SafeAreaView>
        <StatusBar style="dark" />
      </View>
    );
  }

  return (
    <View style={styles.bg}>
      <SafeAreaView style={styles.container} edges={["right", "left", "top"]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [
              { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E5E5EA', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
              pressed && { opacity: 0.2 },
            ]}
          >
            <Ionicons name="chevron-back" size={22} color="#000000" />
          </Pressable>
          <Text style={{ flex: 1, fontSize: 18, fontFamily: 'Gilroy-Bold', color: '#000000' }}>Community</Text>
          <View style={{ width: 40 }} />
        </View>

        {posts.length === 0 && !loading ? (
          <EmptyStateMem
            icon="people-outline"
            title="No posts yet"
            message="Be the first to share something with the community!"
          />
        ) : (
          <FlatList
            data={posts}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={Colors.ACCENT_START}
                colors={[Colors.ACCENT_START]}
              />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
          />
        )}

        <Pressable
          style={({ pressed }) => [styles.fab, pressed && { opacity: 0.85 }]}
          onPress={() => Alert.alert("Coming Soon", "Post creation will be available soon!")}
        >
          <LinearGradient
            start={{ x: 0.24, y: -0.09 }}
            end={{ x: 0.5, y: 1 }}
            colors={[Colors.ACCENT_START, Colors.ACCENT_END]}
            style={styles.fabGradient}
          >
            <Ionicons name="add" size={28} color={Colors.TEXT_PRIMARY} />
          </LinearGradient>
        </Pressable>
      </SafeAreaView>
      <StatusBar style="dark" />
    </View>
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
      paddingVertical: "12@ratio",
    },
    headerTitle: {
      fontFamily: "Gilroy-ExtraBold",
      fontSize: "28@ratio",
      color: Colors.TEXT_PRIMARY,
    },
    listContent: {
      paddingHorizontal: "16@ratio",
      paddingBottom: "100@ratio",
    },
    skeletonList: {
      paddingHorizontal: "16@ratio",
    },
    skeletonItem: {
      backgroundColor: Colors.BG_CARD,
      borderRadius: "16@ratio",
      padding: "16@ratio",
      marginBottom: "12@ratio",
    },
    skeletonHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: "12@ratio",
    },
    skeletonHeaderText: {
      flex: 1,
      marginLeft: "10@ratio",
      gap: "6@ratio",
    },
    fab: {
      position: "absolute",
      bottom: "24@ratio",
      right: "20@ratio",
      shadowColor: Colors.ACCENT_START,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 8,
    },
    fabGradient: {
      width: "56@ratio",
      height: "56@ratio",
      borderRadius: "28@ratio",
      alignItems: "center",
      justifyContent: "center",
    },
  });
}
