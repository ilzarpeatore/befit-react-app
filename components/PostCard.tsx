import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { Colors } from "@constants/colors";
import { AvatarMem } from "./Avatar";

interface Props {
  username: string;
  avatar?: string;
  content: string;
  image?: string;
  likes?: number;
  comments?: number;
  time?: string;
  onLike?: () => void;
  onComment?: () => void;
  onPress: () => void;
}

function PostCard({
  username,
  avatar,
  content,
  image,
  likes = 0,
  comments = 0,
  time,
  onLike,
  onComment,
  onPress,
}: Props) {
  const styles = useStyle();

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
      <View style={styles.container}>
        <View style={styles.header}>
          <AvatarMem uri={avatar} name={username} size={40} />
          <View style={styles.headerText}>
            <Text style={styles.username} numberOfLines={1}>
              {username}
            </Text>
            {time ? (
              <Text style={styles.time}>{time}</Text>
            ) : null}
          </View>
        </View>

        <Text style={styles.content}>{content}</Text>

        {image ? (
          <Image source={{ uri: image }} contentFit="cover" style={styles.image} />
        ) : null}

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={onLike}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name="heart-outline"
              size={20}
              color={Colors.TEXT_SECONDARY}
            />
            <Text style={styles.actionText}>{likes}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={onComment}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name="chatbubble-outline"
              size={20}
              color={Colors.TEXT_SECONDARY}
            />
            <Text style={styles.actionText}>{comments}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export const PostCardMem = React.memo(PostCard);

function useStyle() {
  return useResponsiveStyleSheet({
    container: {
      backgroundColor: Colors.BG_CARD,
      borderRadius: "16@ratio",
      padding: "16@ratio",
      marginBottom: "12@ratio",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: "12@ratio",
    },
    headerText: {
      flex: 1,
      marginLeft: "10@ratio",
    },
    username: {
      fontFamily: "Gilroy-Bold",
      fontSize: "14@ratio",
      color: Colors.TEXT_PRIMARY,
    },
    time: {
      fontFamily: "Gilroy-Regular",
      fontSize: "12@ratio",
      color: Colors.TEXT_SECONDARY,
      marginTop: "2@ratio",
    },
    content: {
      fontFamily: "Gilroy-Regular",
      fontSize: "14@ratio",
      color: Colors.TEXT_PRIMARY,
      lineHeight: "20@ratio",
      marginBottom: "12@ratio",
    },
    image: {
      width: "100%",
      height: "200@ratio",
      borderRadius: "12@ratio",
      marginBottom: "12@ratio",
    },
    actions: {
      flexDirection: "row",
      gap: "24@ratio",
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
  });
}
