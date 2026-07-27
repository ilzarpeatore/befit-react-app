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
        ) : null}

        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>

          <View style={styles.tagRow}>
            {bodyPart ? (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{bodyPart}</Text>
              </View>
            ) : null}
            {equipment ? (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{equipment}</Text>
              </View>
            ) : null}
            {level ? (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{level}</Text>
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
      borderRadius: "16@ratio",
      overflow: "hidden",
      marginBottom: "12@ratio",
    },
    image: {
      width: "100%",
      height: "140@ratio",
      resizeMode: "cover",
    },
    content: {
      padding: "16@ratio",
    },
    title: {
      fontFamily: "Gilroy-Bold",
      fontSize: "16@ratio",
      color: Colors.TEXT_PRIMARY,
      marginBottom: "10@ratio",
    },
    tagRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
    },
    tag: {
      backgroundColor: "rgba(90,93,135,0.3)",
      borderRadius: "20@ratio",
      paddingHorizontal: "10@ratio",
      paddingVertical: "4@ratio",
    },
    tagText: {
      fontFamily: "Gilroy-Medium",
      fontSize: "12@ratio",
      color: Colors.TEXT_SECONDARY,
    },
  });
}
