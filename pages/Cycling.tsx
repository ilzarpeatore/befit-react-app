import React, { useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Animated,
  Platform,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ToggleSwitch from "toggle-switch-react-native";
import MaskedView from "@react-native-masked-view/masked-view";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { Mapstyle } from "../map/Mapstyle";
import { StatusBar } from "expo-status-bar";
import { CyclingPropsInterface, ResultboxdatalistInterface } from "./_types/Cycling.i";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { route_coordinates } from "static/Cycling";
import { user_current_location } from "static/Clubmap";
import { get_region_from_latlon } from "@helper/map";
const window = Dimensions.get("window");
/**
 * Resultboxdatalist
 */
const Resultboxdatalist = ({ title, value, unit, styles }: ResultboxdatalistInterface) => {
  return (
    <View style={styles.recordboxdatali}>
      <Text style={styles.recordboxdatatitle}>{title}</Text>
      <View style={styles.recordboxdatarow}>
        <Text style={styles.recordboxdatavalue}>{value}</Text>
        {unit ? <Text style={styles.recordboxdataunit}>{unit}</Text> : null}
      </View>
    </View>
  );
};
/**
 * Cycling
 * figma page names : Start Cycling,While Cycling,Stop Cycling (2 pages)
 */
export default function Cycling({ navigation }: CyclingPropsInterface) {
  const styles = useStyle();
  const activity_box_opacity_Anim = useRef(new Animated.Value(0)).current; //activity box opacity Animate
  const record_box_opacity_Anim = useRef(new Animated.Value(0)).current; //record box opacity Anim Animate
  const [timer_running, setTimerRunning] = useState<boolean>(false);
  const [autorecord, setAutorecord] = useState<boolean>(false);
  const [showrecord, setShowrecord] = useState<boolean>(false);
  const _render_record_box = () => {
    /**
     * _render_record_box
     * render record box
     */
    return (
      <Animated.View
        style={[
          styles.recordbox,
          {
            transform: [
              {
                translateY: record_box_opacity_Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [343, 0],
                }),
              },
            ],
            opacity: record_box_opacity_Anim,
          },
        ]}
      >
        <Image
          source={require("@assets/resultboxoverlay.png")}
          style={styles.recordboxoverlay}
        />
        <Image
          source={require("@assets/bigactivityborder.png")}
          style={styles.recordboxborder}
        />
        {/*record box data start*/}
        <View style={styles.recordboxdata}>
          <Resultboxdatalist title="Distance" value="12.03" unit="km" styles={styles} />
          <Resultboxdatalist title="Duration" value="26:57:07" unit="" styles={styles} />
          <Resultboxdatalist title="Max Speed" value="31.7" unit="km/h" styles={styles} />
          <Resultboxdatalist title="Avg Speed" value="18.9" unit="km/h" styles={styles} />
          <Resultboxdatalist title="Max Elevation" value="58" unit="m" styles={styles} />
          <Resultboxdatalist title="Calories Burn" value="782" unit="Kcal" styles={styles} />
        </View>
        {/*record box data end*/}
        {/*record box bottom actions start*/}
        <View style={styles.activityboxbottom}>
          {/*record box finish record btn*/}
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("Clubnav", { screen: "Congratulation" }); // navigate to Congratulation page
            }}
            style={styles.activityboxbottombtn}
          >
            <Text style={styles.activityboxbottombtntxt}>Finish Record</Text>
          </TouchableOpacity>
          {/*record box auto record switch*/}
          <View style={styles.recordboxautorecord}>
            <ToggleSwitch
              isOn={autorecord}
              onColor="#000000"
              offColor="#AEAEB2"
              label="Auto Record"
              labelStyle={styles.recordboxautorecordlabel}
              size="medium"
              onToggle={() => {
                toggle_auto_record_switch();
              }}
              thumbOnStyle={styles.recordboxautorecordthumbon}
              thumbOffStyle={styles.recordboxautorecordthumboff}
              trackOnStyle={styles.recordboxautorecordtrackon}
              trackOffStyle={styles.recordboxautorecordtrackoff}
            />
          </View>
        </View>
        {/*record box bottom actions end*/}
      </Animated.View>
    );
  }
  const toggle_activity_timer = () => {
    if (!timer_running) {
      /* if timer is not running show timer */
      Animated.parallel([
        Animated.timing(activity_box_opacity_Anim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(record_box_opacity_Anim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
      setTimerRunning(true);
      setShowrecord(false);
    } else {
      /* if timer is running show show record */
      Animated.parallel([
        Animated.timing(activity_box_opacity_Anim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(record_box_opacity_Anim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
      setTimerRunning(false);
      setShowrecord(true);
    }
  }
  const toggle_auto_record_switch = () => {
    /* toggle auto record switch */
    setAutorecord((state) => !state);
  }
  return (
    <SafeAreaView style={styles.container}>
      {/*map start*/}
      <MapView
        initialRegion={get_region_from_latlon(
          40.6945517,
          -73.7468122,
          650
        )}
        customMapStyle={Mapstyle}
        style={styles.mapview}
      >
        {/*maker path taken start*/}
        {/*maker path taken dotted*/}
        {/* if timer is running or record are showing show the route coordinates */}
        {timer_running || showrecord ? (
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
        ) : null}
        {/*maker path taken highlight*/}
        {timer_running || showrecord ? (
          <Polyline
            key={"coordinateshighlight"}
            coordinates={route_coordinates}
            strokeWidth={8}
            //@ts-ignore
            miterlimit={1.30541}
            strokeColor={"rgba(251,85,139,0.1)"}
            linecap="round"
          />
        ) : null}
        {/*maker path taken startpoint*/}
        {(timer_running || showrecord) &&
          route_coordinates.length ? (
          <Marker
            key={"startpoint"}
            coordinate={route_coordinates[0]}
            anchor={{ x: 0.5, y: 0.5 }}
            rotation={
              (Math.atan2(
                route_coordinates[1].longitude -
                route_coordinates[0].longitude,
                route_coordinates[1].latitude -
                route_coordinates[0].latitude
              ) *
                180) /
              Math.PI
            }
          >
            <View style={styles.mapmarkerstartpoint}></View>
          </Marker>
        ) : null}
        {/*map user current location maker start*/}
        <Marker
          key={"user_current_location"}
          coordinate={
            timer_running || showrecord
              ? route_coordinates[
              route_coordinates.length - 1
              ]
              : user_current_location
          }
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View>
            <Image
              source={require("../assets/icons/mylocation.png")}
              style={styles.mapuser_current_locationimg}
            />
          </View>
        </Marker>
        {/*map user current location maker end*/}
      </MapView>
      {/*map end*/}
      <View>
        {/*activity box start*/}
        <Animated.View
          style={[
            styles.activitybox,
            {
              transform: [
                {
                  translateY: record_box_opacity_Anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -310],
                  }),
                },
              ],
            },
          ]}
        >
          {/* activity box title */}
          <MaskedView
            style={[
              styles.maskview,
              timer_running || showrecord
                ? { opacity: 0 }
                : {},
            ]}
            maskElement={
              <View style={styles.masklabel}>
                <Text style={styles.masklabeltext}>Start Cycling</Text>
              </View>
            }
          >
            <Image
              source={require("@assets/startcyclingmask.png")}
              style={styles.masklabelimg}
            />
          </MaskedView>
          {/* start activity timer box */}
          <Animated.View
            style={[
              styles.activitytimerbox,
              { opacity: activity_box_opacity_Anim },
            ]}
          >
            <Image
              style={styles.activitytimerboxoverlay}
              source={require("@assets/activitytimerboxoverlay.png")}
            />
            <Image
              style={styles.activitytimerboxoverlay}
              source={require("@assets/activitytimerboxoverlay2.png")}
            />
            <View style={[styles.activitytimerlabel, { borderLeftWidth: 0 }]}>
              <Text style={styles.activitytimerlabeltxt}>12.03</Text>
              <Text style={styles.activitytimerunit}>km</Text>
            </View>
            <View style={styles.activitytimerlabel}>
              <Text style={styles.activitytimerlabeltxt}>26:57</Text>
            </View>
          </Animated.View>
          {/* end activity timer box */}
          {/* start activity button */}
          <TouchableOpacity
            onPress={() => {
              toggle_activity_timer();
            }}
            style={styles.activitybutton}
          >
            <Image
              source={require("@assets/startbtnbg.png")}
              style={styles.activitybuttonbg}
            />
            <Image
              source={require("@assets/startbtnshadow.png")}
              style={styles.activitybuttonshadow}
            />
            <Image
              source={
                timer_running
                  ? require("@assets/icons/pauseicon.png")
                  : require("@assets/icons/starticon.png")
              }
              style={styles.activitybuttonicon}
            />
          </TouchableOpacity>
          {/* end activity button */}
        </Animated.View>
        {/*activity box end*/}
        {/*record box start*/}
        {_render_record_box()}
        {/*record box end*/}
      </View>
      {/*return button start*/}
      <TouchableOpacity
        onPress={() => {
          navigation.goBack();
        }}
        style={styles.returnbutton}
      >
        <Image
          source={require("@assets/icons/arrow-left.png")}
          style={styles.returnbuttonimg}
        />
      </TouchableOpacity>
      {/*return button end*/}
      <StatusBar style="dark" />
    </SafeAreaView>
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
      backgroundColor: "#EBEBF0",
    },
    mapview: {
      width: "100%",
      height: "100%",
      backgroundColor: "#EBEBF0",
    },
    mapmarkerstartpoint: {
      width: 0,
      height: 0,
      backgroundColor: "transparent",
      borderStyle: "solid",
      borderLeftWidth: '4@ratio',
      borderRightWidth: '4@ratio',
      borderBottomWidth: '8@ratio',
      borderLeftColor: "transparent",
      borderRightColor: "transparent",
      borderBottomColor: "#000000",
    },
    returnbutton: {
      position: "absolute",
      left: '16@ratio',
      top: Platform.OS == "ios" ? '60@ratio' : '40@ratio', //ios fix
      width: '44@ratio',
      height: '44@ratio',
      borderRadius: Platform.OS == "ios" ? '22@ratio' : '44@ratio', //ios fix
      backgroundColor: "rgba(0,0,0,0.08)",
      justifyContent: "center",
      alignItems: "center",
    },
    returnbuttonimg: {
      width: '9@ratio',
      height: '16@ratio',
      resizeMode: "contain",
    },
    mapuser_current_locationimg: {
      width: '188@ratio',
      height: '188@ratio',
    },
    activitybox: {
      position: "absolute",
      left: "3%",
      height: '133@ratio',
      width: "94%",
      bottom: '6@ratio',
      justifyContent: "center",
      alignItems: "center",
      zIndex: 2,
    },
    maskview: {
      height: '70@ratio',
    },
    masklabel: {
      backgroundColor: "transparent",
      width: '185@ratio',
      height: '37@ratio',
      alignSelf: "center",
    },
    masklabeltext: {
      fontSize: '30@ratio',
      color: "white",
      fontFamily: "Gilroy-ExtraBold",
    },
    masklabelimg: {
      width: '210@ratio',
      height: "100%",
      marginTop: '-10@ratio',
      marginLeft: '-5@ratio',
      resizeMode: "cover",
      alignSelf: "center",
    },
    activitybutton: {
      width: '70@ratio',
      height: '80@ratio',
      justifyContent: "center",
      alignItems: "center",
      marginTop: '-15@ratio',
      zIndex: 2,
      transform: [{ translateY: 0 }], //-310
    },
    activitybuttonbg: {
      width: '70@ratio',
      height: '70@ratio',
      position: "absolute",
      top: 0,
      left: 0,
      resizeMode: "contain",
      borderRadius: Platform.OS == "ios" ? '35@ratio' : '70@ratio', //ios fix
      zIndex: 2,
    },
    activitybuttonshadow: {
      width: '110@ratio',
      height: '105@ratio',
      position: "absolute",
      top: '-10@ratio',
      left: '-20@ratio',
      resizeMode: "contain",
      zIndex: 1,
    },
    activitybuttonicon: {
      position: "relative",
      width: '15@ratio',
      height: '15@ratio',
      zIndex: 3,
      resizeMode: "contain",
      marginTop: '-10@ratio',
    },
    activitytimerbox: {
      width: '208@ratio',
      height: '44@ratio',
      borderRadius: '14@ratio',
      backgroundColor: "#FFFFFF",
      position: "absolute",
      top: 0,
      flexDirection: "row",
      alignItems: "center",
      opacity: 0,
    },
    activitytimerboxoverlay: {
      position: "absolute",
      left: 0,
      top: 0,
      width: "100%",
      height: "100%",
      resizeMode: "cover",
      borderRadius: '12@ratio',
    },
    activitytimerlabel: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
      borderLeftWidth: '1@ratio',
      borderLeftColor: "#E5E5EA",
    },
    activitytimerlabeltxt: {
      fontSize: '24@ratio',
      color: "#000000",
      fontFamily: "Gilroy-ExtraBold",
    },
    activitytimerunit: {
      fontSize: '14@ratio',
      color: "#AEAEB2",
      fontFamily: "Gilroy-ExtraBold",
      marginLeft: '3@ratio',
      marginTop: '7@ratio',
    },
    recordbox: {
      position: "absolute",
      bottom: '17@ratio',
      left: "3%",
      height: '343@ratio',
      width: "94%",
      borderRadius: '12@ratio',
      backgroundColor: "#FFFFFF",
      zIndex: 1,
      opacity: 0,
      transform: [{ translateY: 343 }],
    },
    recordboxoverlay: {
      position: "absolute",
      width: "100%",
      height: "100%",
      resizeMode: "stretch",
      top: 0,
      left: 0,
      zIndex: 2,
    },
    recordboxborder: {
      position: "absolute",
      width: "100%",
      height: "100%",
      resizeMode: "stretch",
      top: 0,
      left: 0,
      zIndex: 1,
    },
    recordboxdata: {
      zIndex: 3,
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: '50@ratio',
    },
    recordboxdatali: {
      flexBasis: "50%",
      alignItems: "center",
      justifyContent: "center",
      borderLeftWidth: '1@ratio',
      borderLeftColor: "#E5E5EA",
      marginBottom: '24@ratio',
    },
    recordboxdatatitle: {
      fontFamily: "Gilroy-Medium",
      fontSize: '14@ratio',
      color: "#AEAEB2",
      marginBottom: '5@ratio',
    },
    recordboxdatarow: {
      flexDirection: "row",
      alignItems: "flex-end",
    },
    recordboxdatavalue: {
      fontFamily: "Gilroy-ExtraBold",
      fontSize: '24@ratio',
      color: "#000000",
    },
    recordboxdataunit: {
      fontFamily: "Gilroy-ExtraBold",
      fontSize: '14@ratio',
      color: "#AEAEB2",
      marginLeft: '5@ratio',
      marginBottom: '3@ratio',
    },
    recordboxautorecordlabel: {
      fontFamily: "Gilroy-Bold",
      fontSize: window.width <= 320 ? '12@ratio' : '16@ratio', //responsive fix
      color: "#000000",
    },
    activityboxbottom: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: '6@ratio',
      zIndex: 4,
    },
    activityboxbottombtn: {
      flex: 1,
      alignItems: "center",
      height: '30@ratio',
      justifyContent: "center",
    },
    activityboxbottombtntxt: {
      color: "#000000",
      fontSize: window.width <= 320 ? '14@ratio' : '16@ratio', //responsive fix
      fontFamily: "Gilroy-Bold",
    },
    recordboxautorecord: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    recordboxautorecordthumbon: {
      width: '26@ratio',
      height: '26@ratio',
      borderRadius: Platform.OS == "ios" ? '13@ratio' : '26@ratio', //ios fix
    },
    recordboxautorecordthumboff: {
      width: '26@ratio',
      height: '26@ratio',
      borderRadius: Platform.OS == "ios" ? '13@ratio' : '26@ratio', //ios fix
    },
    recordboxautorecordtrackon: {
      width: '52@ratio',
      height: '30@ratio',
      padding: '2@ratio',
    },
    recordboxautorecordtrackoff: {
      width: '52@ratio',
      height: '30@ratio',
      padding: '2@ratio',
    }
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
    backgroundColor: "#1A1735",
  },
  mapview: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(60, 63, 105, 0.47)",
  },
  mapmarkerstartpoint: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderBottomWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#505EDC",
  },
  returnbutton: {
    position: "absolute",
    left: 16,
    top: Platform.OS == "ios" ? 60 : 40, //ios fix
    width: 44,
    height: 44,
    borderRadius: Platform.OS == "ios" ? 22 : 44, //ios fix
    backgroundColor: "rgba(60,63,105,0.49)",
    justifyContent: "center",
    alignItems: "center",
  },
  returnbuttonimg: {
    width: 9,
    height: 16,
    resizeMode: "contain",
  },
  mapuser_current_locationimg: {
    width: 188,
    height: 188,
  },
  activitybox: {
    position: "absolute",
    left: "3%",
    height: 133,
    width: "94%",
    bottom: 6,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  maskview: {
    height: 70,
  },
  masklabel: {
    backgroundColor: "transparent",
    width: 185,
    height: 37,
    alignSelf: "center",
  },
  masklabeltext: {
    fontSize: 30,
    color: "white",
    fontFamily: "Gilroy-ExtraBold",
  },
  masklabelimg: {
    width: 210,
    height: "100%",
    marginTop: -10,
    marginLeft: -5,
    resizeMode: "cover",
    alignSelf: "center",
  },
  activitybutton: {
    width: 70,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -15,
    zIndex: 2,
    transform: [{ translateY: 0 }], //-310
  },
  activitybuttonbg: {
    width: 70,
    height: 70,
    position: "absolute",
    top: 0,
    left: 0,
    resizeMode: "contain",
    borderRadius: Platform.OS == "ios" ? 35 : 70, //ios fix
    zIndex: 2,
  },
  activitybuttonshadow: {
    width: 110,
    height: 105,
    position: "absolute",
    top: -10,
    left: -20,
    resizeMode: "contain",
    zIndex: 1,
  },
  activitybuttonicon: {
    position: "relative",
    width: 15,
    height: 15,
    zIndex: 3,
    resizeMode: "contain",
    marginTop: -10,
  },
  activitytimerbox: {
    width: 208,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(20,18,39,0.85)",
    position: "absolute",
    top: 0,
    flexDirection: "row",
    alignItems: "center",
    opacity: 0,
  },
  activitytimerboxoverlay: {
    position: "absolute",
    left: 0,
    top: 0,
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    borderRadius: 12,
  },
  activitytimerlabel: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    borderLeftWidth: 1,
    borderLeftColor: "rgba(138,140,178,0.15)",
  },
  activitytimerlabeltxt: {
    fontSize: 24,
    color: "white",
    fontFamily: "Gilroy-ExtraBold",
  },
  activitytimerunit: {
    fontSize: 14,
    color: "#8A8CB2",
    fontFamily: "Gilroy-ExtraBold",
    marginLeft: 3,
    marginTop: 7,
  },
  recordbox: {
    position: "absolute",
    bottom: 17,
    left: "3%",
    height: 343,
    width: "94%",
    borderRadius: 12,
    backgroundColor: "rgba(20,18,39,0.85)",
    zIndex: 1,
    opacity: 0,
    transform: [{ translateY: 343 }],
  },
  recordboxoverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    resizeMode: "stretch",
    top: 0,
    left: 0,
    zIndex: 2,
  },
  recordboxborder: {
    position: "absolute",
    width: "100%",
    height: "100%",
    resizeMode: "stretch",
    top: 0,
    left: 0,
    zIndex: 1,
  },
  recordboxdata: {
    zIndex: 3,
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 50,
  },
  recordboxdatali: {
    flexBasis: "50%",
    alignItems: "center",
    justifyContent: "center",
    borderLeftWidth: 1,
    borderLeftColor: "rgba(138,140,178,0.15)",
    marginBottom: 24,
  },
  recordboxdatatitle: {
    fontFamily: "Gilroy-Medium",
    fontSize: 14,
    color: "#8A8CB2",
    marginBottom: 5,
  },
  recordboxdatarow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  recordboxdatavalue: {
    fontFamily: "Gilroy-ExtraBold",
    fontSize: 24,
    color: "#ffffff",
  },
  recordboxdataunit: {
    fontFamily: "Gilroy-ExtraBold",
    fontSize: 14,
    color: "#8A8CB2",
    marginLeft: 5,
    marginBottom: 3,
  },
  recordboxautorecordlabel: {
    fontFamily: "Gilroy-Bold",
    fontSize: window.width <= 320 ? 12 : 16, //responsive fix
    color: "#fff",
  },
  activityboxbottom: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 6,
    zIndex: 4,
  },
  activityboxbottombtn: {
    flex: 1,
    alignItems: "center",
    height: 30,
    justifyContent: "center",
  },
  activityboxbottombtntxt: {
    color: "#FB558B",
    fontSize: window.width <= 320 ? 14 : 16, //responsive fix
    fontFamily: "Gilroy-Bold",
  },
  recordboxautorecord: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  recordboxautorecordthumbon: {
    width: 26,
    height: 26,
    borderRadius: Platform.OS == "ios" ? 13 : 26, //ios fix
  },
  recordboxautorecordthumboff: {
    width: 26,
    height: 26,
    borderRadius: Platform.OS == "ios" ? 13 : 26, //ios fix
  },
  recordboxautorecordtrackon: {
    width: 52,
    height: 30,
    padding: 2,
  },
  recordboxautorecordtrackoff: {
    width: 52,
    height: 30,
    padding: 2,
  },
});
