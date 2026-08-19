import MaskedView from "@react-native-masked-view/masked-view";
import { View, Image, Text, StyleSheet } from "react-native";
import React from "react";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import ResponsiveImage from "@helper/responsiveImage";
import { ItemPropsInterface } from "./_types/Item.i";
/**
 * unboarding carousel item
 * @example
 * <ItemMem item={{
        source: require("@assets/slider/healthy.png"),
        sources: {
          2: require('@assets/slider/healthy-2x.png'),
          3: require('@assets/slider/healthy-3x.png'),
          4: require('@assets/slider/healthy-4x.png'),
        },
        titlel: "Be",
        title: "Healthy",
        info:
            "Health meaning of health has evolved over time...",
    }} />
 */
function Item({ item }: ItemPropsInterface) {
  const styles = useStyle();
  return (
    <View style={styles.slideritem}>
      <View style={styles.sliderimgbox}>
        <ResponsiveImage
          sources={item.sources}
          source={item.source}
          contentFit="contain"
          style={styles.sliderimg}
        />
      </View>
      <View style={styles.slideritemdata}>
        <MaskedView
          style={styles.masklabel}
          maskElement={
            <View style={styles.masklabelview}>
              <Text style={styles.masklabeltextl}>{item.titlel}</Text>
              <Text style={styles.masklabeltext}>{item.title}</Text>
            </View>
          }
        >
          <Image
            source={require("@assets/slidertitlemask.png")}
            style={styles.masklabelimg}
          />
        </MaskedView>
        <Text style={styles.slideriteminfo}>{item.info}</Text>
      </View>
    </View>
  );
};
/**
 * return as memo
 */
export const ItemMem = React.memo(Item);
/**
 * style
 * * note : stylesheet is converted to responsiveStyleSheet because we need to use responsive ratio . if you don't want to use resposive ratio you can use the normal stylesheet version
 */
function useStyle() {
  const styles = useResponsiveStyleSheet({
    masklabel: {
      height: '39@ratio',
      marginBottom: '10@ratio',
    },
    masklabelview: {
      backgroundColor: "transparent",
      height: '39@ratio',
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
    },
    masklabeltext: {
      fontSize: '32@ratio',
      color: "white",
      fontFamily: "Gilroy-ExtraBold",
    },
    masklabeltextl: {
      fontSize: '32@ratio',
      color: "white",
      fontFamily: "Gilroy-Light",
      marginRight: '11@ratio',
    },
    masklabelimg: {
      resizeMode: "cover",
      width: "100%",
      height: '205@ratio',
      marginTop: '-83@ratio',
    },
    slideritemdata: {
      justifyContent: "center",
      flexDirection: "column",
      paddingHorizontal: '33@ratio',
      marginTop: '-160@ratio',
    },
    sliderimgbox: {
      height: '494@ratio',
    },
    sliderimg: {
      position: "absolute",
      width: "100%",
      height: '440@ratio',
      top: '40@ratio',
    },
    slideriteminfo: {
      fontFamily: "Gilroy-Regular",
      fontSize: '16@ratio',
      color: "#6B6B70",
      lineHeight: '24@ratio',
      textAlign: "center",
    }
  });
  return styles
}
/**
 * style
 * * you can remove this const
 * * use this style if you don't want to use ratio
 */
const styles_old = StyleSheet.create({
  masklabel: {
    height: 39,
    marginBottom: 10,
  },
  masklabelview: {
    backgroundColor: "transparent",
    height: 39,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  masklabeltext: {
    fontSize: 32,
    color: "white",
    fontFamily: "Gilroy-ExtraBold",
  },
  masklabeltextl: {
    fontSize: 32,
    color: "white",
    fontFamily: "Gilroy-Light",
    marginRight: 11,
  },
  masklabelimg: {
    resizeMode: "cover",
    width: "100%",
    height: 205,
    marginTop: -83,
  },
  slideritemdata: {
    justifyContent: "center",
    flexDirection: "column",
    paddingHorizontal: 33,
    marginTop: -160,
  },
  sliderimgbox: {
    height: 494,
  },
  sliderimg: {
    position: "absolute",
    width: "100%",
    height: 440,
    resizeMode: "contain",
    top: 40,
  },
  slideriteminfo: {
    fontFamily: "Gilroy-Regular",
    fontSize: 16,
    color: "#8A8CB2",
    lineHeight: 25,
    textAlign: "center",
  }
});
