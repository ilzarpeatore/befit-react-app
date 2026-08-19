import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Text,
  View,
  Image,
  ImageBackground,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { Colors } from "@constants/colors";
import { postsApi, PostData } from "../api/posts";
import { AvatarMem } from "../components/Avatar";
import { ErrorRetryMem } from "../components/ErrorRetry";
import { LoadingSkeletonMem } from "../components/LoadingSkeleton";

interface CommentData {
  id: number;
  comment: string;
  user_id: number;
  posting_id: number;
  users: {
    id: number;
    first_name: string;
    last_name: string;
    display_name: string;
    profile_image: string;
  };
  created_at: string;
}

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay}d ago`;
    return d.toLocaleDateString();
  } catch {
    return dateStr;
  }
}

export default function PostDetail() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const styles = useStyle();
  const { id } = route.params ?? {};
  const [post, setPost] = useState<PostData | null>(null);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const fetchPost = useCallback(async () => {
    try {
      setError(null);
      const res = await postsApi.getDetail(id);
      setPost(res.data?.data ?? null);
    } catch (e) {
      setError("Failed to load post.");
    }
  }, [id]);

  const fetchComments = useCallback(async () => {
    try {
      const res = await postsApi.getComments(id);
      setComments(res.data?.data ?? []);
    } catch (e) {}
  }, [id]);

  const loadData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchPost(), fetchComments()]);
    setLoading(false);
  }, [fetchPost, fetchComments]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchPost(), fetchComments()]);
    setRefreshing(false);
  }, [fetchPost, fetchComments]);

  const handleLike = useCallback(async () => {
    if (!post) return;
    const wasLiked = post.is_liked;
    setPost((prev) =>
      prev
        ? {
            ...prev,
            is_liked: !wasLiked,
            posting_like_count: wasLiked
              ? prev.posting_like_count - 1
              : prev.posting_like_count + 1,
          }
        : prev
    );
    try {
      await postsApi.like(id);
    } catch {
      setPost((prev) =>
        prev
          ? {
              ...prev,
              is_liked: wasLiked,
              posting_like_count: wasLiked
                ? prev.posting_like_count + 1
                : prev.posting_like_count - 1,
            }
          : prev
      );
    }
  }, [id, post]);

  const handleBookmark = useCallback(async () => {
    if (!post) return;
    const wasBookmarked = post.is_bookmark;
    setPost((prev) =>
      prev ? { ...prev, is_bookmark: !wasBookmarked } : prev
    );
    try {
      await postsApi.bookmark(id);
    } catch {
      setPost((prev) =>
        prev ? { ...prev, is_bookmark: wasBookmarked } : prev
      );
    }
  }, [id, post]);

  const handleSendComment = useCallback(async () => {
    if (!commentText.trim() || sending) return;
    setSending(true);
    const text = commentText.trim();
    setCommentText("");
    try {
      await postsApi.saveComment(id, text);
      await fetchComments();
    } catch {
      setCommentText(text);
    } finally {
      setSending(false);
    }
  }, [commentText, sending, id, fetchComments]);

  if (loading) {
    return (
      <View style={styles.bg}>
        <SafeAreaView style={styles.container} edges={["right", "left", "top"]}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backBtn}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={Colors.TEXT_PRIMARY}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Post</Text>
            <View style={styles.headerSpacer} />
          </View>
          <View style={styles.skeletonContainer}>
            <View style={styles.skeletonHeader}>
              <LoadingSkeletonMem
                width={"40@ratio"}
                height={"40@ratio"}
                borderRadius={20}
              />
              <View style={styles.skeletonHeaderText}>
                <LoadingSkeletonMem width={"120@ratio"} height={"14@ratio"} />
                <LoadingSkeletonMem width={"80@ratio"} height={"10@ratio"} />
              </View>
            </View>
            <LoadingSkeletonMem height={"14@ratio"} />
            <LoadingSkeletonMem height={"14@ratio"} width={"250@ratio"} />
            <LoadingSkeletonMem
              height={"200@ratio"}
              borderRadius={12}
            />
          </View>
        </SafeAreaView>
        <StatusBar style="dark" />
      </View>
    );
  }

  if (error || !post) {
    return (
      <View style={styles.bg}>
        <SafeAreaView style={styles.container} edges={["right", "left", "top"]}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backBtn}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={Colors.TEXT_PRIMARY}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Post</Text>
            <View style={styles.headerSpacer} />
          </View>
          <ErrorRetryMem
            message={error || "Post not found"}
            onRetry={loadData}
          />
        </SafeAreaView>
        <StatusBar style="dark" />
      </View>
    );
  }

  return (
    <View style={styles.bg}>
      <SafeAreaView style={styles.container} edges={["right", "left", "top"]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={Colors.TEXT_PRIMARY}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post</Text>
          <View style={styles.headerSpacer} />
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          <ScrollView
            ref={scrollRef}
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={Colors.ACCENT_START}
                colors={[Colors.ACCENT_START]}
              />
            }
          >
            <View style={styles.postCard}>
              <View style={styles.postHeader}>
                <AvatarMem
                  uri={post.users?.profile_image}
                  name={post.users?.display_name || "User"}
                  size={40}
                />
                <View style={styles.postHeaderText}>
                  <Text style={styles.postUsername} numberOfLines={1}>
                    {post.users?.display_name || "User"}
                  </Text>
                  <Text style={styles.postTime}>
                    {formatDate(post.created_at)}
                  </Text>
                </View>
              </View>

              <Text style={styles.postContent}>{post.description}</Text>

              {post.posting_media_array?.[0]?.media_url ? (
                <Image
                  source={{ uri: post.posting_media_array[0].media_url }}
                  style={styles.postImage}
                />
              ) : null}

              <View style={styles.postActions}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={handleLike}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={post.is_liked ? "heart" : "heart-outline"}
                    size={22}
                    color={post.is_liked ? Colors.PINK_ACCENT : Colors.TEXT_SECONDARY}
                  />
                  <Text
                    style={[
                      styles.actionText,
                      post.is_liked ? { color: Colors.PINK_ACCENT } : {},
                    ]}
                  >
                    {post.posting_like_count}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionBtn}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="chatbubble-outline"
                    size={22}
                    color={Colors.TEXT_SECONDARY}
                  />
                  <Text style={styles.actionText}>
                    {post.posting_comment_count}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={handleBookmark}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={post.is_bookmark ? "bookmark" : "bookmark-outline"}
                    size={22}
                    color={
                      post.is_bookmark ? Colors.TEXT_PRIMARY : Colors.TEXT_SECONDARY
                    }
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.commentsSection}>
              <Text style={styles.commentsTitle}>
                Comments ({comments.length})
              </Text>
              {comments.length === 0 ? (
                <Text style={styles.noComments}>
                  No comments yet. Be the first!
                </Text>
              ) : (
                comments.map((comment) => (
                  <View key={comment.id} style={styles.commentItem}>
                    <AvatarMem
                      uri={comment.users?.profile_image}
                      name={comment.users?.display_name || "User"}
                      size={32}
                    />
                    <View style={styles.commentBody}>
                      <View style={styles.commentHeader}>
                        <Text style={styles.commentUser} numberOfLines={1}>
                          {comment.users?.display_name || "User"}
                        </Text>
                        <Text style={styles.commentTime}>
                          {formatDate(comment.created_at)}
                        </Text>
                      </View>
                      <Text style={styles.commentText}>{comment.comment}</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </ScrollView>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Write a comment..."
              placeholderTextColor={Colors.TEXT_MUTED}
              value={commentText}
              onChangeText={setCommentText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSendComment}
              disabled={!commentText.trim() || sending}
              style={[
                styles.sendBtn,
                (!commentText.trim() || sending) && styles.sendBtnDisabled,
              ]}
            >
              <LinearGradient
                start={{ x: 0.24, y: -0.09 }}
                end={{ x: 0.5, y: 1 }}
                colors={
                  commentText.trim() && !sending
                    ? [Colors.ACCENT_START, Colors.ACCENT_END]
                    : [Colors.TEXT_MUTED, Colors.TEXT_MUTED]
                }
                style={styles.sendBtnGradient}
              >
                <Ionicons
                  name="send"
                  size={18}
                  color={Colors.TEXT_PRIMARY}
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
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
    flex: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: "16@ratio",
      paddingVertical: "12@ratio",
    },
    backBtn: {
      width: "40@ratio",
      height: "40@ratio",
      borderRadius: "20@ratio",
      backgroundColor: Colors.BG_CARD,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      flex: 1,
      fontFamily: "Gilroy-Bold",
      fontSize: "18@ratio",
      color: Colors.TEXT_PRIMARY,
      textAlign: "center",
    },
    headerSpacer: {
      width: "40@ratio",
    },
    scrollContent: {
      paddingBottom: "16@ratio",
    },
    postCard: {
      backgroundColor: Colors.BG_CARD,
      borderRadius: "16@ratio",
      marginHorizontal: "16@ratio",
      padding: "16@ratio",
    },
    postHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: "12@ratio",
    },
    postHeaderText: {
      flex: 1,
      marginLeft: "10@ratio",
    },
    postUsername: {
      fontFamily: "Gilroy-Bold",
      fontSize: "14@ratio",
      color: Colors.TEXT_PRIMARY,
    },
    postTime: {
      fontFamily: "Gilroy-Regular",
      fontSize: "12@ratio",
      color: Colors.TEXT_SECONDARY,
      marginTop: "2@ratio",
    },
    postContent: {
      fontFamily: "Gilroy-Regular",
      fontSize: "14@ratio",
      color: Colors.TEXT_PRIMARY,
      lineHeight: "20@ratio",
      marginBottom: "12@ratio",
    },
    postImage: {
      width: "100%",
      height: "200@ratio",
      borderRadius: "12@ratio",
      resizeMode: "cover",
      marginBottom: "12@ratio",
    },
    postActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: "24@ratio",
      paddingTop: "8@ratio",
      borderTopWidth: "1@ratio",
      borderTopColor: "#E5E5EA",
    },
    actionBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    actionText: {
      fontFamily: "Gilroy-Medium",
      fontSize: "13@ratio",
      color: Colors.TEXT_SECONDARY,
    },
    commentsSection: {
      marginTop: "16@ratio",
      paddingHorizontal: "16@ratio",
    },
    commentsTitle: {
      fontFamily: "Gilroy-Bold",
      fontSize: "16@ratio",
      color: Colors.TEXT_PRIMARY,
      marginBottom: "12@ratio",
    },
    noComments: {
      fontFamily: "Gilroy-Regular",
      fontSize: "14@ratio",
      color: Colors.TEXT_MUTED,
      textAlign: "center",
      paddingVertical: "24@ratio",
    },
    commentItem: {
      flexDirection: "row",
      marginBottom: "16@ratio",
    },
    commentBody: {
      flex: 1,
      marginLeft: "10@ratio",
      backgroundColor: Colors.BG_CARD,
      borderRadius: "12@ratio",
      padding: "12@ratio",
    },
    commentHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: "4@ratio",
    },
    commentUser: {
      fontFamily: "Gilroy-Bold",
      fontSize: "13@ratio",
      color: Colors.TEXT_PRIMARY,
      flex: 1,
    },
    commentTime: {
      fontFamily: "Gilroy-Regular",
      fontSize: "11@ratio",
      color: Colors.TEXT_MUTED,
    },
    commentText: {
      fontFamily: "Gilroy-Regular",
      fontSize: "13@ratio",
      color: Colors.TEXT_SECONDARY,
      lineHeight: "18@ratio",
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "flex-end",
      paddingHorizontal: "16@ratio",
      paddingVertical: "12@ratio",
      borderTopWidth: "1@ratio",
      borderTopColor: "#E5E5EA",
      backgroundColor: Colors.BG_PRIMARY,
    },
    input: {
      flex: 1,
      backgroundColor: Colors.BG_CARD,
      borderRadius: "20@ratio",
      paddingHorizontal: "16@ratio",
      paddingVertical: "10@ratio",
      fontFamily: "Gilroy-Regular",
      fontSize: "14@ratio",
      color: Colors.TEXT_PRIMARY,
      maxHeight: "80@ratio",
      marginRight: "10@ratio",
    },
    sendBtn: {
      width: "40@ratio",
      height: "40@ratio",
    },
    sendBtnDisabled: {
      opacity: 0.5,
    },
    sendBtnGradient: {
      width: "40@ratio",
      height: "40@ratio",
      borderRadius: "20@ratio",
      alignItems: "center",
      justifyContent: "center",
    },
    skeletonContainer: {
      paddingHorizontal: "16@ratio",
      backgroundColor: Colors.BG_CARD,
      borderRadius: "16@ratio",
      marginHorizontal: "16@ratio",
      padding: "16@ratio",
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
  });
}
