import React, { useMemo, useState } from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  ScrollView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ImageStyle,
  StyleProp,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import MaskedView from "@react-native-masked-view/masked-view";
import {
  Svg,
  Path,
  Defs,
  Stop,
  LinearGradient as SlinearGradient,
} from "react-native-svg";
import { HeightPropsInterface, HeightsliderscrollbgInterface } from "./_types/Height.i";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { useAuth } from "@store/AuthContext";
import { profileApi } from "@api/profile";
/**
 * Heightsliderscrollbg
 * Height slider scroll bg for rendering in Height slider item using PureComponent for better performance
 */
function Heightsliderscrollbg({ styles }: HeightsliderscrollbgInterface) {
  return (
    <Image
      source={require("@assets/sliderg.png")}
      style={styles.heightsliderscrollbg as StyleProp<ImageStyle>}
    />
  );
}
/**
 * Height
 * figma page names : Height
 */
export default function Height({ navigation }: HeightPropsInterface) {
  const styles = useStyle();
  const height_slider_items = useMemo(() => Array.from(Array(250).keys()), []);
  const [height_slider_value, setHeightSliderValue] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const _render_height_slider = () => {
    /**
     * _render_height_slider
     * render height slider
     */
    return (
      <View style={styles.heightsliderbox}>
        {/*height slider box header start*/}
        <View style={styles.heightsliderheader}>
          {/*height slider value -5 if more than 5*/}
          <Text style={styles.heightsliderh1}>
            {height_slider_value < 5
              ? "-"
              : height_slider_value - 5}
          </Text>
          {/*height slider value*/}
          <Text style={styles.heightsliderh2}>
            {height_slider_value}
          </Text>
          {/*height slider value +5 */}
          <Text style={styles.heightsliderh3}>
            {height_slider_value <
              height_slider_items.length
              ? height_slider_value + 5
              : "-"}
          </Text>
        </View>
        {/*height slider box header end*/}
        {/*height slider start*/}
        <View style={styles.heightslider}>
          {/*height slider bg*/}
          <LinearGradient
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 0 }}
            colors={[
              "rgba(20, 18, 39, 0.5)",
              "rgba(60, 63, 105, 0.5)",
              "rgba(138, 140, 178, 0.7)",
              "rgba(60, 63, 105, 0.5)",
              "rgba(20, 18, 38, 0.5)",
            ]}
            locations={[0, 0.15587, 0.500517, 0.851209, 1]}
            style={styles.heightsliderbg}
          />
          {/*height slider overlay right*/}
          <LinearGradient
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 0 }}
            colors={["#141227", "rgba(20,18,39,0)"]}
            style={styles.heightsliderbgcoverright}
          />
          {/*height slider overlay left*/}
          <LinearGradient
            start={{ x: 2, y: 1 }}
            end={{ x: 1, y: 1 }}
            colors={["#141227", "rgba(20,18,39,0)"]}
            style={styles.heightsliderbgcoverleft}
          />
          {/*height slider top highlight*/}
          <LinearGradient
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 0 }}
            colors={[
              "rgba(20, 18, 39, 0.5)",
              "rgba(60, 63, 105, 0.5)",
              "rgba(138, 140, 178, 1)",
              "rgba(60, 63, 105, 0.5)",
              "rgba(20, 18, 38, 0.5)",
            ]}
            locations={[0, 0.15587, 0.500517, 0.851209, 1]}
            style={styles.heightsliderbgbordertop}
          />
          {/*height slider bottom highlight*/}
          <LinearGradient
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 0 }}
            colors={[
              "rgba(20, 18, 39, 0.5)",
              "rgba(60, 63, 105, 0.5)",
              "rgba(138, 140, 178, 1)",
              "rgba(60, 63, 105, 0.5)",
              "rgba(20, 18, 38, 0.5)",
            ]}
            locations={[0, 0.15587, 0.500517, 0.851209, 1]}
            style={styles.heightsliderbgborderbottom}
          />
          {/*height slider drag list start*/}
          <FlatList
            style={{ zIndex: 1 }}
            contentContainerStyle={styles.heightsliderscrollcontainer}
            data={height_slider_items}
            horizontal={true}
            decelerationRate={"fast"}
            keyExtractor={(item, index) => index.toString()}
            showsHorizontalScrollIndicator={false}
            onScroll={(event) => {
              height_slider_onscroll(event);
            }}
            initialNumToRender={12}
            renderItem={({ index }) => <Heightsliderscrollbg styles={styles} key={index} />}
          />
          {/*height slider drag list end*/}
        </View>
        {/*height slider end*/}
      </View>
    );
  }
  const height_slider_onscroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    /* set height slider value based on contentOffset of flatlist scroll*/
    setHeightSliderValue(Math.round(event.nativeEvent.contentOffset.x / 32))
  }
  return (
    <ImageBackground
      source={require("@assets/bg3.png")}
      style={styles.bg}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.container2}>
          <ScrollView
            contentContainerStyle={styles.scrollViewcontentcontainer}
          >
            {/*title start*/}
            <MaskedView
              style={styles.masklabel}
              maskElement={
                <View style={styles.masklabelview}>
                  <Text style={styles.masklabeltextl}>Your</Text>
                  <Text style={styles.masklabeltext}>Height</Text>
                </View>
              }
            >
              <Image
                source={require("@assets/pagetitlemask2.png")}
                style={styles.masklabelimg}
              />
            </MaskedView>
            {/*title end*/}
            {/*heightbox start*/}
            <View style={styles.heightbox}>
              {/*heightbox bg start*/}
              <Svg
                width="212"
                height="212"
                viewBox="0 0 212 212"
                fill="none"
                style={styles.heightboxsvg}
              >
                <Path
                  d="M3 106C3 49.1147 49.1147 3 106 3C162.885 3 209 49.1147 209 106C209 162.885 162.885 209 106 209C49.1147 209 3 162.885 3 106Z"
                  stroke="url(#paint0_linear)"
                  strokeWidth="6"
                />
                <Defs>
                  <SlinearGradient
                    id="paint0_linear"
                    x1="10.3415"
                    y1="-21.931"
                    x2="182.263"
                    y2="269.287"
                    gradientUnits="userSpaceOnUse"
                  >
                    <Stop stopColor="#5652E5" />
                    <Stop
                      offset="0.348069"
                      stopColor="#8A8CB3"
                      stopOpacity="0"
                    />
                    <Stop
                      offset="0.596479"
                      stopColor="#8A8CB3"
                      stopOpacity="0"
                    />
                    <Stop offset="1" stopColor="#7DA9F4" stopOpacity="0.5" />
                  </SlinearGradient>
                </Defs>
              </Svg>
              {/*heightbox bg end*/}
              {/*heightbox label start*/}
              <View style={styles.heightboxlabel}>
                <Text style={styles.heightboxtext}>
                  {height_slider_value}
                </Text>
                <Text style={styles.heightboxunit}>cm</Text>
              </View>
              {/*heightbox label end*/}
            </View>
            {/*height slider box start*/}
            {_render_height_slider()}
            {/*height slider box end*/}
            {/*height actions start*/}
            <View style={styles.actions}>
              {/*height actions save*/}
              <TouchableOpacity
                style={[styles.btn, styles.btnsave]}
                onPress={async () => {
                  setLoading(true);
                  try {
                    await profileApi.updateProfile({ height: String(height_slider_value), height_unit: "cm" });
                    navigation.navigate("Home");
                  } catch (err: any) {
                    Alert.alert("Error", err.response?.data?.message || "Failed to save height");
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                <LinearGradient
                  start={{ x: 0.88, y: 1.21 }}
                  end={{ x: 0.56, y: 0.5 }}
                  colors={["rgba(255,255,255,0.13)", "rgba(255,255,255,0)"]}
                  style={[styles.btnborder, styles.btnsave]}
                >
                  <LinearGradient
                    start={{ x: 0.24, y: -0.09 }}
                    end={{ x: 0.5, y: 1 }}
                    colors={["#7773FA", "#5652E5"]}
                    style={[styles.btnbg, styles.btnsave]}
                  >
                    {loading ? <ActivityIndicator color="#ffffff" size="small" /> : <Text style={styles.btnsavetext}>Save</Text>}
                  </LinearGradient>
                </LinearGradient>
              </TouchableOpacity>
            </View>
            {/*height actions skip*/}
            <TouchableOpacity
              style={styles.skipbtn}
              onPress={() => {
                console.log("skip");
              }}
            >
              <Text style={styles.skipbtntext}>Skip</Text>
            </TouchableOpacity>
            {/*height actions end*/}
          </ScrollView>
        </View>
        <StatusBar style="dark" />
      </SafeAreaView>
    </ImageBackground>
  );
}
/**
 * style
 * * note : stylesheet is converted to responsiveStyleSheet because we need to use responsive ratio . if you don't want to use resposive ratio you can use the normal stylesheet version
 */
function useStyle() {
  const styles = useResponsiveStyleSheet({
    container: {
      flex: 1,
    },
    container2: {
      flex: 1,
    },
    scrollViewcontentcontainer: {
      paddingTop: '108@ratio',
    },
    bg: {
      width: "100%",
      height: "100%",
      backgroundColor: "#1A1735",
    },
    masklabel: {
      height: '49@ratio',
      marginBottom: '10@ratio',
    },
    masklabelview: {
      backgroundColor: "transparent",
      height: '49@ratio',
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
    },
    masklabeltext: {
      fontSize: '40@ratio',
      color: "white",
      fontFamily: "Gilroy-ExtraBold",
    },
    masklabeltextl: {
      fontSize: '40@ratio',
      color: "white",
      fontFamily: "Gilroy-Light",
      marginRight: '11@ratio',
    },
    masklabelimg: {
      resizeMode: "cover",
      width: "100%",
      height: '200@ratio',
      marginTop: '-60@ratio',
    },
    btn: {
      width: '64@ratio',
      height: '64@ratio',
      borderRadius: '18@ratio',
      marginHorizontal: '11@ratio',
    },
    btnborder: {
      padding: '1@ratio',
      width: '64@ratio',
      height: '64@ratio',
      borderRadius: '18@ratio',
    },
    btnbg: {
      width: '64@ratio',
      height: '64@ratio',
      borderRadius: '18@ratio',
      justifyContent: "center",
      alignItems: "center",
    },
    btnimg: {
      width: '40@ratio',
      height: '40@ratio',
    },
    actions: {
      flexDirection: "row",
      justifyContent: "center",
    },
    skipbtn: {
      marginTop: '30@ratio',
      marginBottom: '30@ratio',
      justifyContent: "center",
      alignItems: "center",
    },
    skipbtntext: {
      fontFamily: "Gilroy-Bold",
      fontSize: '16@ratio',
      color: "#8A8CB2",
    },
    btnsave: {
      width: '300@ratio',
    },
    btnsavetext: {
      fontFamily: "Gilroy-Bold",
      fontSize: '18@ratio',
      color: "#ffffff",
    },
    heightbox: {
      alignItems: "center",
      width: '212@ratio',
      height: '212@ratio',
      alignSelf: "center",
      justifyContent: "center",
      marginTop: '52@ratio',
    },
    heightboxsvg: {
      position: "absolute",
      top: 0,
      left: 0,
    },
    heightboxlabel: {
      flexDirection: "row",
    },
    heightboxtext: {
      fontSize: '50@ratio',
      fontFamily: "Gilroy-Bold",
      color: "#ffffff",
    },
    heightboxunit: {
      fontSize: '22@ratio',
      fontFamily: "Gilroy-Bold",
      color: "#ffffff",
      alignSelf: "flex-end",
      marginBottom: '8@ratio',
    },
    heightsliderbox: {
      marginTop: '30@ratio',
      marginBottom: '60@ratio',
    },
    heightslider: {
      width: "100%",
      height: '75@ratio',
    },
    heightsliderbg: {
      position: "absolute",
      width: "100%",
      height: '75@ratio',
      top: 0,
      right: 0,
      zIndex: 1,
    },
    heightsliderbgcoverright: {
      position: "absolute",
      width: '65@ratio',
      height: '75@ratio',
      right: 0,
      top: 0,
      zIndex: 3,
    },
    heightsliderbgcoverleft: {
      position: "absolute",
      width: '65@ratio',
      height: '75@ratio',
      left: 0,
      top: 0,
      zIndex: 3,
    },
    heightsliderbgbordertop: {
      position: "absolute",
      width: "100%",
      height: '1@ratio',
      top: 0,
      zIndex: 2,
    },
    heightsliderbgborderbottom: {
      position: "absolute",
      width: "100%",
      height: '1@ratio',
      bottom: 0,
      zIndex: 2,
    },
    heightsliderheader: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: '5@ratio',
    },
    heightsliderh1: {
      fontSize: '15@ratio',
      fontFamily: "Gilroy-Bold",
      color: "rgba(138,140,178,0.5)",
    },
    heightsliderh2: {
      fontSize: '20@ratio',
      fontFamily: "Gilroy-Bold",
      color: "rgba(138,140,178,0.5)",
      flexBasis: "75%",
      textAlign: "center",
    },
    heightsliderh3: {
      fontSize: '15@ratio',
      fontFamily: "Gilroy-Bold",
      color: "rgba(138,140,178,0.5)",
    },
    heightsliderscrollcontainer: {
      paddingVertical: '20@ratio',
    },
    heightsliderscrollbg: {
      width: '34@ratio',
      height: '37@ratio',
      resizeMode: "contain",
    },
  });
  return styles
}
/**
 * style
 * * you can remove this const
 * * use this style if you don't want to use ratio ( comment the code on line 24 )
 */
const styles_old = StyleSheet.create({
  container: {
    flex: 1,
  },
  container2: {
    flex: 1,
  },
  scrollViewcontentcontainer: {
    paddingTop: 108,
  },
  bg: {
    width: "100%",
    height: "100%",
    backgroundColor: "#1A1735",
  },
  masklabel: {
    height: 49,
    marginBottom: 10,
  },
  masklabelview: {
    backgroundColor: "transparent",
    height: 49,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  masklabeltext: {
    fontSize: 40,
    color: "white",
    fontFamily: "Gilroy-ExtraBold",
  },
  masklabeltextl: {
    fontSize: 40,
    color: "white",
    fontFamily: "Gilroy-Light",
    marginRight: 11,
  },
  masklabelimg: {
    resizeMode: "cover",
    width: "100%",
    height: 200,
    marginTop: -60,
  },
  btn: {
    width: 64,
    height: 64,
    borderRadius: 18,
    marginHorizontal: 11,
  },
  btnborder: {
    padding: 1,
    width: 64,
    height: 64,
    borderRadius: 18,
  },
  btnbg: {
    width: 64,
    height: 64,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  btnimg: {
    width: 40,
    height: 40,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "center",
  },
  skipbtn: {
    marginTop: 30,
    marginBottom: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  skipbtntext: {
    fontFamily: "Gilroy-Bold",
    fontSize: 16,
    color: "#8A8CB2",
  },
  btnsave: {
    width: 300,
  },
  btnsavetext: {
    fontFamily: "Gilroy-Bold",
    fontSize: 18,
    color: "#ffffff",
  },
  heightbox: {
    alignItems: "center",
    width: 212,
    height: 212,
    alignSelf: "center",
    justifyContent: "center",
    marginTop: 52,
  },
  heightboxsvg: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  heightboxlabel: {
    flexDirection: "row",
  },
  heightboxtext: {
    fontSize: 50,
    fontFamily: "Gilroy-Bold",
    color: "#ffffff",
  },
  heightboxunit: {
    fontSize: 22,
    fontFamily: "Gilroy-Bold",
    color: "#ffffff",
    alignSelf: "flex-end",
    marginBottom: 8,
  },
  heightsliderbox: {
    marginTop: 30,
    marginBottom: 60,
  },
  heightslider: {
    width: "100%",
    height: 75,
  },
  heightsliderbg: {
    position: "absolute",
    width: "100%",
    height: 75,
    top: 0,
    right: 0,
    zIndex: 1,
  },
  heightsliderbgcoverright: {
    position: "absolute",
    width: 65,
    height: 75,
    right: 0,
    top: 0,
    zIndex: 3,
  },
  heightsliderbgcoverleft: {
    position: "absolute",
    width: 65,
    height: 75,
    left: 0,
    top: 0,
    zIndex: 3,
  },
  heightsliderbgbordertop: {
    position: "absolute",
    width: "100%",
    height: 1,
    top: 0,
    zIndex: 2,
  },
  heightsliderbgborderbottom: {
    position: "absolute",
    width: "100%",
    height: 1,
    bottom: 0,
    zIndex: 2,
  },
  heightsliderheader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 5,
  },
  heightsliderh1: {
    fontSize: 15,
    fontFamily: "Gilroy-Bold",
    color: "rgba(138,140,178,0.5)",
  },
  heightsliderh2: {
    fontSize: 20,
    fontFamily: "Gilroy-Bold",
    color: "rgba(138,140,178,0.5)",
    flexBasis: "75%",
    textAlign: "center",
  },
  heightsliderh3: {
    fontSize: 15,
    fontFamily: "Gilroy-Bold",
    color: "rgba(138,140,178,0.5)",
  },
  heightsliderscrollcontainer: {
    paddingVertical: 20,
  },
  heightsliderscrollbg: {
    width: 34,
    height: 37,
    resizeMode: "contain",
  },
});
