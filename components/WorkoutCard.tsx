import React from "react";
import { Text, Pressable, View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { Colors } from "@constants/colors";

interface Props {
  title: string;
  subtitle?: string;
  duration?: string;
  level?: string;
  image?: string;
  onPress: () => void;
  onFavourite?: () => void;
  isFavourite?: boolean;
}

function WorkoutCard({
  title,
  subtitle,
  duration,
  level,
  image,
  onPress,
  onFavourite,
  isFavourite = false,
}: Props) {
  const styles = useStyle();

  return (
    <Pressable style={({ pressed }) => pressed && { opacity: 0.85 }} onPress={onPress}>
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        colors={[Colors.CARD_START, Colors.CARD_END]}
        style={styles.container}
      >
        {image ? (
          <Image source={{ uri: image }} contentFit="cover" style={styles.image} />
        ) : null}

        <View style={styles.content}>
          <View style={styles.textRow}>
            <View style={styles.textBlock}>
              <Text style={styles.title} numberOfLines={1}>
                {title}
              </Text>
              {subtitle ? (
                <Text style={styles.subtitle} numberOfLines={1}>
                  {subtitle}
                </Text>
              ) : null}
            </View>

            {onFavourite ? (
              <Pressable
                onPress={onFavourite}
                style={({ pressed }) => [styles.favBtn, pressed && { opacity: 0.2 }]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name={isFavourite ? "heart" : "heart-outline"}
                  size={22}
                  color={isFavourite ? Colors.PINK_ACCENT : Colors.TEXT_SECONDARY}
                />
              </Pressable>
            ) : null}
          </View>

          <View style={styles.badgeRow}>
            {duration ? (
              <View style={styles.badge}>
                <Ionicons
                  name="time-outline"
                  size={12}
                  color={Colors.TEXT_SECONDARY}
                />
                <Text style={styles.badgeText}>{duration}</Text>
              </View>
            ) : null}
            {level ? (
              <View style={styles.badge}>
                <Ionicons
                  name="bar-chart-outline"
                  size={12}
                  color={Colors.TEXT_SECONDARY}
                />
                <Text style={styles.badgeText}>{level}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

export const WorkoutCardMem = React.memo(WorkoutCard);

function useStyle() {
  return useResponsiveStyleSheet({
    container: {
      borderRadius: "16@ratio",
      overflow: "hidden",
      marginBottom: "12@ratio",
    },
    image: {
      width: "100%",
      height: "160@ratio",
    },
    content: {
      padding: "16@ratio",
    },
    textRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
    },
    textBlock: {
      flex: 1,
      marginRight: "8@ratio",
    },
    title: {
      fontFamily: "Gilroy-Bold",
      fontSize: "18@ratio",
      color: Colors.TEXT_PRIMARY,
      marginBottom: "4@ratio",
    },
    subtitle: {
      fontFamily: "Gilroy-Medium",
      fontSize: "14@ratio",
      color: Colors.TEXT_SECONDARY,
    },
    favBtn: {
      padding: "4@ratio",
    },
    badgeRow: {
      flexDirection: "row",
      marginTop: "12@ratio",
      gap: 8,
    },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#E5E5EA",
      borderRadius: "20@ratio",
      paddingHorizontal: "10@ratio",
      paddingVertical: "4@ratio",
      gap: 4,
    },
    badgeText: {
      fontFamily: "Gilroy-Medium",
      fontSize: "12@ratio",
      color: Colors.TEXT_SECONDARY,
    },
  });
}
