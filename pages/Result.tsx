import React from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Platform,
  Share,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import MapView, { PROVIDER_GOOGLE, Polyline, Marker } from "react-native-maps";
import { Mapstyle } from "../map/Mapstyle";
import { ResultboxdatalistPropsInterface } from "./_types/Result.i";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { route_coordinates } from "static/Result";
import { get_region_from_latlon } from "@helper/map";
import { useNavigation, useRoute } from "@react-navigation/native";


const Resultboxdatalist = ({ title, value, unit, styles }: ResultboxdatalistPropsInterface) => {
  return (
    <View style={styles.resultboxdatali}>
      <Text style={styles.resultboxdatatitle}>{title}</Text>
      <View style={styles.resultboxdatarow}>
        <Text style={styles.resultboxdatavalue}>{value}</Text>
        {unit ? <Text style={styles.resultboxdataunit}>{unit}</Text> : null}
      </View>
    </View>
  );
};

export default function Result() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const styles = useStyle();
  const params = (route?.params as any) as {
    distance?: string;
    duration?: string;
    maxSpeed?: string;
    avgSpeed?: string;
    maxElevation?: string;
    calories?: string;
    date?: string;
  } | undefined;
  return (
    <ImageBackground
      source={require("@assets/bg2.png")}
      style={styles.bg}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.container2}>
          <ScrollView contentContainerStyle={styles.scrollviewcontainer}>
            {/*map start*/}
            <View style={styles.map}>
              <LinearGradient
                start={{ x: 0.44, y: -0.81 }}
                end={{ x: 1.31, y: -0.34 }}
                colors={[
                  "rgba(60,63,105,1)",
                  "rgba(38,40,67,0)",
                  "rgba(17,18,30,0)",
                  "rgba(80, 94, 220, 0.32)",
                ]}
                style={styles.mapbox}
              >
                <View style={styles.mapviewbox}>
                  <MapView
                    initialRegion={get_region_from_latlon(40.6971117, -73.7468122, 650)}
                    customMapStyle={Mapstyle}
                    style={styles.mapview}
                  >
                    <Polyline
                      key={"coordinates"}
                      coordinates={route_coordinates}
                      strokeWidth={3}
                      //@ts-ignore
                      miterlimit={1.30541}
                      lineDashPattern={Platform.OS == "ios" ? [8, 8] : [0.1, 8]}
                      strokeColor={"#FB558B"}
                      linecap="round"
                    />
                    <Polyline
                      key={"coordinateshighlight"}
                      coordinates={route_coordinates}
                      strokeWidth={8}
                      //@ts-ignore
                      miterlimit={1.30541}
                      strokeColor={"rgba(251,85,139,0.1)"}
                      linecap="round"
                    />
                    {route_coordinates.length > 0 && (
                    <Marker
                      key={"startpoint"}
                      coordinate={route_coordinates[0]}
                      anchor={{ x: 0.5, y: 0.5 }}
                      rotation={
                        route_coordinates.length >= 2
                          ? (Math.atan2(
                              route_coordinates[1].longitude - route_coordinates[0].longitude,
                              route_coordinates[1].latitude - route_coordinates[0].latitude
                            ) * 180) / Math.PI
                          : 0
                      }
                    >
                      <View style={styles.mapmarkerstartpoint}></View>
                    </Marker>
                    )}
                    {route_coordinates.length >= 2 && (
                    <Marker
                      key={"endpoint"}
                      coordinate={route_coordinates[route_coordinates.length - 1]}
                      anchor={{ x: 0.5, y: 0.5 }}
                      rotation={
                        (Math.atan2(
                          route_coordinates[route_coordinates.length - 2].longitude - route_coordinates[route_coordinates.length - 1].longitude,
                          route_coordinates[route_coordinates.length - 2].latitude - route_coordinates[route_coordinates.length - 1].latitude
                        ) * 180) / Math.PI - 45
                      }
                    >
                      <View style={styles.mapmarkerendpoint}></View>
                    </Marker>
                    )}
                  </MapView>
                </View>
              </LinearGradient>
            </View>
            {/*map end*/}

            {/*title start*/}
            <View style={styles.resaulttitle}>
              <Image style={styles.resaulttitleicon} source={require("@assets/icons/small/cycling.png")} />
              <Text style={styles.resaulttitletext}>{params?.date || "Workout Result"}</Text>
            </View>
            {/*result box data start*/}
            <View style={styles.resultboxdata}>
              <Resultboxdatalist title="Distance" value={params?.distance || "0"} unit="km" styles={styles} />
              <Resultboxdatalist title="Duration" value={params?.duration || "00:00:00"} unit="" styles={styles} />
              <Resultboxdatalist title="Max Speed" value={params?.maxSpeed || "0"} unit="km/h" styles={styles} />
              <Resultboxdatalist title="Avg Speed" value={params?.avgSpeed || "0"} unit="km/h" styles={styles} />
              <Resultboxdatalist title="Max Elevation" value={params?.maxElevation || "0"} unit="m" styles={styles} />
              <Resultboxdatalist title="Calories Burn" value={params?.calories || "0"} unit="Kcal" styles={styles} />
            </View>
            {/*result box data end*/}

            {/* actions start */}
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => Share.share({ message: `Check out my workout result!\nDistance: ${params?.distance || "0"} km\nDuration: ${params?.duration || "00:00:00"}\nCalories Burned: ${params?.calories || "0"} kcal` })}>
                <LinearGradient
                  start={{ x: 0.24, y: -0.09 }}
                  end={{ x: 0.26, y: 1.05 }}
                  colors={["#7773FA", "#5652E5"]}
                  style={styles.sharebutton}
                >
                  <Text style={styles.sharebuttontext}>Share</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("Home");
                }}
                style={styles.homebutton}
              >
                <Text style={styles.homebuttontext}>Go to Home</Text>
              </TouchableOpacity>
            </View>
            {/* actions end */}
          </ScrollView>
        </View>
        <StatusBar style="light" />
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
      paddingTop: '64@ratio',
    },
    bg: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
      backgroundColor: "#1A1735",
    },
    map: {
      paddingHorizontal: '16@ratio',
    },
    mapbox: {
      width: "100%",
      height: '289@ratio',
      borderRadius: '16@ratio',
      padding: '1@ratio',
    },
    mapboxbg: {
      position: "absolute",
      width: "96%",
      height: "100%",
      backgroundColor: "rgba(208,210,232,0.04)",
      borderRadius: '16@ratio',
      top: '-11@ratio',
      right: "3%",
    },
    mapboxinside: {
      width: "100%",
      height: '289@ratio',
      backgroundColor: "#141227",
      borderRadius: '16@ratio',
    },
    mapboxinsideshadow: {
      position: "absolute",
      top: 0,
      left: '1@ratio',
      width: "100%",
      height: "100%",
      resizeMode: "cover",
      marginLeft: '-1@ratio',
      zIndex: 2,
      borderRadius: '16@ratio',
    },
    mapviewbox: {
      borderRadius: '16@ratio',
      overflow: "hidden",
    },
    mapview: {
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(60, 63, 105, 0.47)",
      opacity: 0.9,
    },
    actions: {
      alignItems: "center",
      marginTop: '24@ratio',
    },
    sharebutton: {
      width: '218@ratio',
      height: '55@ratio',
      alignItems: "center",
      justifyContent: "center",
      borderRadius: '12@ratio',
    },
    sharebuttontext: {
      fontFamily: "Gilroy-Bold",
      fontSize: '18@ratio',
      color: "#ffffff",
    },
    homebutton: {
      height: '40@ratio',
      justifyContent: "center",
      marginTop: '15@ratio',
    },
    homebuttontext: {
      color: "#8A8CB2",
      fontFamily: "Gilroy-Bold",
      fontSize: '16@ratio',
    },
    mapmarkerstartpoint: {
      width: 0,
      height: 0,
      backgroundColor: "transparent",
      borderStyle: "solid",
      borderLeftWidth: '4.5@ratio',
      borderRightWidth: '4.5@ratio',
      borderBottomWidth: '9@ratio',
      borderLeftColor: "transparent",
      borderRightColor: "transparent",
      borderBottomColor: "#505EDC",
    },
    mapmarkerendpoint: {
      width: '10@ratio',
      height: '10@ratio',
      backgroundColor: "#FB558B",
    },
    resaulttitle: {
      paddingHorizontal: '16@ratio',
      flexDirection: "row",
      alignItems: "center",
      marginTop: '22@ratio',
    },
    resaulttitleicon: {
      width: '28@ratio',
      height: '28@ratio',
      resizeMode: "contain",
      marginRight: '12@ratio',
    },
    resaulttitletext: {
      fontFamily: "Gilroy-Bold",
      fontSize: '14@ratio',
      color: "#ffffff",
    },
    resultboxdata: {
      zIndex: 3,
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: '30@ratio',
    },
    resultboxdatali: {
      flexBasis: "50%",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: '20@ratio',
    },
    resultboxdatatitle: {
      fontFamily: "Gilroy-Medium",
      fontSize: '14@ratio',
      color: "#8A8CB2",
      marginBottom: '5@ratio',
    },
    resultboxdatarow: {
      flexDirection: "row",
      alignItems: "flex-end",
    },
    resultboxdatavalue: {
      fontFamily: "Gilroy-ExtraBold",
      fontSize: '24@ratio',
      color: "#ffffff",
    },
    resultboxdataunit: {
      fontFamily: "Gilroy-ExtraBold",
      fontSize: '14@ratio',
      color: "#8A8CB2",
      marginLeft: '5@ratio',
      marginBottom: '3@ratio',
    },
    scrollviewcontainer: {
      paddingBottom: '30@ratio',
    },
  });
  return styles;
}
/**
 * style
 * * you can remove this const
 * * use this style if you don't want to use ratio ( comment the code on line 26 )
 */
const styles_old = StyleSheet.create({
  container: {
    flex: 1,
  },
  container2: {
    flex: 1,
    paddingTop: 64,
  },
  bg: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    backgroundColor: "#1A1735",
  },
  map: {
    paddingHorizontal: 16,
  },
  mapbox: {
    width: "100%",
    height: 289,
    borderRadius: 16,
    padding: 1,
  },
  mapboxbg: {
    position: "absolute",
    width: "96%",
    height: "100%",
    backgroundColor: "rgba(208,210,232,0.04)",
    borderRadius: 16,
    top: -11,
    right: "3%",
  },
  mapboxinside: {
    width: "100%",
    height: 289,
    backgroundColor: "#141227",
    borderRadius: 16,
  },
  mapboxinsideshadow: {
    position: "absolute",
    top: 0,
    left: 1,
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    marginLeft: -1,
    zIndex: 2,
    borderRadius: 16,
  },
  mapviewbox: {
    borderRadius: 16,
    overflow: "hidden",
  },
  mapview: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(60, 63, 105, 0.47)",
    opacity: 0.9,
  },
  actions: {
    alignItems: "center",
    marginTop: 24,
  },
  sharebutton: {
    width: 218,
    height: 55,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  sharebuttontext: {
    fontFamily: "Gilroy-Bold",
    fontSize: 18,
    color: "#ffffff",
  },
  homebutton: {
    height: 40,
    justifyContent: "center",
    marginTop: 15,
  },
  homebuttontext: {
    color: "#8A8CB2",
    fontFamily: "Gilroy-Bold",
    fontSize: 16,
  },
  mapmarkerstartpoint: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 4.5,
    borderRightWidth: 4.5,
    borderBottomWidth: 9,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#505EDC",
  },
  mapmarkerendpoint: {
    width: 10,
    height: 10,
    backgroundColor: "#FB558B",
  },
  resaulttitle: {
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 22,
  },
  resaulttitleicon: {
    width: 28,
    height: 28,
    resizeMode: "contain",
    marginRight: 12,
  },
  resaulttitletext: {
    fontFamily: "Gilroy-Bold",
    fontSize: 14,
    color: "#ffffff",
  },
  resultboxdata: {
    zIndex: 3,
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 30,
  },
  resultboxdatali: {
    flexBasis: "50%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  resultboxdatatitle: {
    fontFamily: "Gilroy-Medium",
    fontSize: 14,
    color: "#8A8CB2",
    marginBottom: 5,
  },
  resultboxdatarow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  resultboxdatavalue: {
    fontFamily: "Gilroy-ExtraBold",
    fontSize: 24,
    color: "#ffffff",
  },
  resultboxdataunit: {
    fontFamily: "Gilroy-ExtraBold",
    fontSize: 14,
    color: "#8A8CB2",
    marginLeft: 5,
    marginBottom: 3,
  },
  scrollviewcontainer: {
    paddingBottom: 30,
  },
});
