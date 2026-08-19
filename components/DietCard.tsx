import React from "react";
import { Text, Pressable, View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { Colors } from "@constants/colors";

interface Props {
  title: string;
  calories?: number;
  category?: string;
  image?: string;
  onPress: () => void;
}

function DietCard({ title, calories, category, image, onPress }: Props) {
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
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>

          <View style={styles.infoRow}>
            {category ? (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{category}</Text>
              </View>
            ) : null}
          </View>

          {calories != null ? (
            <View style={styles.calorieRow}>
              <Ionicons
                name="flame-outline"
                size={16}
                color={Colors.TEXT_PRIMARY}
              />
              <Text style={styles.calorieText}>{calories} kcal</Text>
            </View>
          ) : null}
        </View>
      </LinearGradient>
    </Pressable>
  );
}

export const DietCardMem = React.memo(DietCard);

function useStyle() {
  return useResponsiveStyleSheet({
    container: {
      borderRadius: "16@ratio",
      overflow: "hidden",
      marginBottom: "12@ratio",
    },
    image: {
      width: "100%",
      height: "140@ratio",
    },
    content: {
      padding: "16@ratio",
    },
    title: {
      fontFamily: "Gilroy-Bold",
      fontSize: "16@ratio",
      color: Colors.TEXT_PRIMARY,
      marginBottom: "8@ratio",
    },
    infoRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
      marginBottom: "8@ratio",
    },
    tag: {
      backgroundColor: "#E5E5EA",
      borderRadius: "20@ratio",
      paddingHorizontal: "10@ratio",
      paddingVertical: "4@ratio",
    },
    tagText: {
      fontFamily: "Gilroy-Medium",
      fontSize: "12@ratio",
      color: Colors.TEXT_SECONDARY,
    },
    calorieRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    calorieText: {
      fontFamily: "Gilroy-Medium",
      fontSize: "14@ratio",
      color: Colors.TEXT_PRIMARY,
    },
  });
}
