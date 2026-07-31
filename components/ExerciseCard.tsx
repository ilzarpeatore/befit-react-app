import React from "react";
import { Text, TouchableOpacity, View, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { Colors } from "@constants/colors";

interface Props {
  title: string;
  bodyPart?: string;
  equipment?: string;
  level?: string;
  image?: string;
  onPress: () => void;
}

function ExerciseCard({
  title,
  bodyPart,
  equipment,
  level,
  image,
  onPress,
}: Props) {
  const styles = useStyle();

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        colors={[Colors.CARD_START, Colors.CARD_END]}
        style={styles.container}
      >
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]} />
        )}

        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>

          <View style={styles.tagRow}>
            {bodyPart ? (
              <View style={styles.tag}>
                <Text style={styles.tagText} numberOfLines={1}>{bodyPart}</Text>
              </View>
            ) : null}
            {equipment ? (
              <View style={styles.tag}>
                <Text style={styles.tagText} numberOfLines={1}>{equipment}</Text>
              </View>
            ) : null}
            {level ? (
              <View style={styles.tag}>
                <Text style={styles.tagText} numberOfLines={1}>{level}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

export const ExerciseCardMem = React.memo(ExerciseCard);

function useStyle() {
  return useResponsiveStyleSheet({
    container: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: "12@ratio",
      overflow: "hidden",
      marginBottom: "10@ratio",
      padding: "8@ratio",
    },
    image: {
      width: "56@ratio",
      height: "56@ratio",
      borderRadius: "8@ratio",
      resizeMode: "cover",
    },
    imagePlaceholder: {
      backgroundColor: "#E5E5EA",
    },
    content: {
      flex: 1,
      marginLeft: "12@ratio",
    },
    title: {
      fontFamily: "Gilroy-Bold",
      fontSize: "14@ratio",
      color: Colors.TEXT_PRIMARY,
      marginBottom: "4@ratio",
    },
    tagRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 4,
    },
    tag: {
      backgroundColor: "#E5E5EA",
      borderRadius: "20@ratio",
      paddingHorizontal: "8@ratio",
      paddingVertical: "2@ratio",
      maxWidth: "100@ratio",
    },
    tagText: {
      fontFamily: "Gilroy-Medium",
      fontSize: "11@ratio",
      color: Colors.TEXT_SECONDARY,
    },
  });
}
