import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { Colors } from "@constants/colors";

interface Props {
  title: string;
  onSeeAll?: () => void;
  seeAllText?: string;
}

function SectionHeader({ title, onSeeAll, seeAllText = "See All" }: Props) {
  const styles = useStyle();

  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll} activeOpacity={0.7}>
          <Text style={styles.seeAll}>{seeAllText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export const SectionHeaderMem = React.memo(SectionHeader);

function useStyle() {
  return useResponsiveStyleSheet({
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "16@ratio",
    },
    title: {
      fontFamily: "Gilroy-ExtraBold",
      fontSize: "18@ratio",
      color: Colors.TEXT_PRIMARY,
    },
    seeAll: {
      fontFamily: "Gilroy-Medium",
      fontSize: "14@ratio",
      color: Colors.TEXT_SECONDARY,
    },
  });
}
