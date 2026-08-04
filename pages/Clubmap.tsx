import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Animated,
  Easing,
  Platform,
  BackHandler,
  Dimensions,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from "expo-linear-gradient";
import {
  Svg,
  Rect,
  Defs,
  LinearGradient as SLinearGradient,
  Stop,
  G,
  Path,
  Ellipse,
  ClipPath,
} from "react-native-svg";
import { BlurView } from "expo-blur";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { Mapstyle } from "../map/Mapstyle";
import { StatusBar } from "expo-status-bar";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { ClubmapPropsInterface, mapMakerActivityType, mapMakerInterface } from "./_types/Clubmap.i";
import { map_markers, user_current_location } from "static/Clubmap";
import { get_region_from_latlon } from "@helper/map";
/* create TouchableOpacity AnimatedComponent for online member box animation */
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(
  TouchableOpacity
);
const window = Dimensions.get("window");
/**
 * Clubmap
 * figma page names : Club Map (3 pages)
 */
export default function Clubmap({ navigation }: ClubmapPropsInterface) {
  const Map = useRef<MapView>(null);
  const styles = useStyle();
  
  const [open_memebers_box, setOpenMemebersBox] = useState<boolean>(false);
  const [show_online_memeber_box, setShowOnlineMemeberBox] = useState<boolean>(true);
  const [current_memeber_marker_index, setCurrentMemeberMarkerIndex] = useState<number>(0);
  const open_memebers_boxheight_Anim = useRef(new Animated.Value(75)).current; //open memebers box height animate

  useEffect(() => {
    const handleBackButtonClick = () => {
      /* if online memeber box is hidden ( means member maker box is visible) show it if not regular backpress function */
      if (!show_online_memeber_box) {
        setShowOnlineMemeberBox(true);
        return true;
      }
    }
    /* add listener to back press*/
    const subscribe = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackButtonClick
    );
    return subscribe.remove()
  }, [])

  const _render_map_marker = (marker: mapMakerInterface, index: number) => {
    /**
     * _render_map_marker
     * render map markers
     * @param marker
     * key: marker key | type : integer
     * id: marker id | type : integer
     * username: marker username | type : string
     * name: marker user fullname | type : string
     * activity: marker activity | type : string | "cycling","running","walking"
     * distance: marker activity distance | type : string/integer
     * unit: marker activity unit | type : string
     * latitude: marker last location latitude | type : integer
     * longitude: marker last location longitude | type : integer
     * color: marker background color gradient | type : object of hex color | example : {start: "#D3FDBE",stop: "#94CF76"}
     * avatar: marker user avatar | type : image
     * coordinates: marker user route | type: array of object | example : [{latitude: 40.69718,longitude: -73.74559,}]
     * coordinateshighlightcolor: marker user route highlight color | type: rgba/hex | use 0.1 on alpha or don't :D
     * @param index
     * index : marker index
     */
    return (
      <View key={index}>
        <Marker
          key={index + "marker"}
          coordinate={{
            latitude: marker.latitude,
            longitude: marker.longitude,
          }}
          onPress={() => {
          }}
        >
          <View>
            <Svg width={styles.marker.width} height={styles.marker.height} viewBox="0 0 60 63" fill="none">
              <G clip-path="url(#clip0)">
                <Path
                  d="M43.7349 13.189C47.3778 16.8319 49.4244 21.7728 49.4244 26.9246C49.4244 32.0764 47.3778 37.0172 43.7349 40.6601L33.2362 51.1589C32.3777 52.0174 31.2134 52.4996 29.9994 52.4996C28.7854 52.4996 27.6211 52.0174 26.7626 51.1589L16.2638 40.6601C12.6209 37.0172 10.5744 32.0764 10.5744 26.9246C10.5744 21.7728 12.6209 16.8319 16.2638 13.189C19.9067 9.54615 24.8476 7.49959 29.9994 7.49959C35.1512 7.49959 40.092 9.54615 43.7349 13.189Z"
                  fill="url(#paint0_linear)"
                />
                <Path
                  d="M30 33.59C33.6809 33.59 36.665 30.606 36.665 26.925C36.665 23.244 33.6809 20.26 30 20.26C26.319 20.26 23.335 23.244 23.335 26.925C23.335 30.606 26.319 33.59 30 33.59Z"
                  stroke="#FBFBFB"
                  strokeWidth='1.5'
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </G>
              <Ellipse cx="30" cy="60.5" rx="6" ry="2.5" fill="rgba(0,0,0,0.08)" />
              <Defs>
                <SLinearGradient
                  id="paint0_linear"
                  x1="16.5"
                  y1="7.5"
                  x2="36"
                  y2="54"
                  gradientUnits="userSpaceOnUse"
                >
                  <Stop stopColor={marker.color.start} />
                  <Stop offset="0.919054" stopColor={marker.color.stop} />
                </SLinearGradient>
                <ClipPath id="clip0">
                  <Rect width="60" height="60" fill="white" />
                </ClipPath>
              </Defs>
            </Svg>
            <Image source={marker.avatar} style={styles.mapmarkeravatar} />
          </View>
        </Marker>
        {/*maker path taken start*/}
        {/*maker path taken dotted*/}
        <Polyline
          key={index + "coordinates"}
          coordinates={marker.coordinates}
          strokeWidth={3}
          //@ts-ignore
          miterlimit={1.30541}
          lineDashPattern={Platform.OS == "ios" ? [8, 8] : [0.1, 8]}
          strokeColor={marker.color.stop}
          linecap="round"
        />
        {/*maker path taken highlight*/}
        <Polyline
          key={index + "coordinateshighlight"}
          coordinates={marker.coordinates}
          strokeWidth={8}
          //@ts-ignore
          miterlimit={1.30541}
          strokeColor={marker.coordinateshighlightcolor}
          linecap="round"
        />
        {/*maker path taken startpoint*/}
        {marker.coordinates.length ? (
          <Marker
            key={index + "startpoint"}
            coordinate={marker.coordinates[0]}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View
              style={[
                styles.mapmarkerstartpoint,
                { backgroundColor: marker.color.stop },
              ]}
            ></View>
          </Marker>
        ) : null}
        {/*maker path taken end*/}
      </View>
    );
  }
  const _render_online_memebers_box_item = (item: mapMakerInterface, index: number) => {
    /**
     * _render_online_memebers_box_item
     * render online memebers box items
     * @param item
     * key: marker key | type : integer
     * id: marker id | type : integer
     * username: marker username | type : string
     * name: marker user fullname | type : string
     * activity: marker activity | type : string | "cycling","running","walking"
     * distance: marker activity distance | type : string/integer
     * unit: marker activity unit | type : string
     * latitude: marker last location latitude | type : integer
     * longitude: marker last location longitude | type : integer
     * color: marker background color gradient | type : object of hex color | example : {start: "#D3FDBE",stop: "#94CF76"}
     * avatar: marker user avatar | type : image
     * coordinates: marker user route | type: array of object | example : [{latitude: 40.69718,longitude: -73.74559,}]
     * coordinateshighlightcolor: marker user route highlight color | type: rgba/hex | use 0.1 on alpha or don't :D
     * @param index
     * index : marker index
     */
    return (
      <TouchableOpacity
        key={index}
        onPress={() => {
          show_memeber_markerbox(index);
        }}
        disabled={!open_memebers_box}
      >
        <View
          style={open_memebers_box ? styles.members_open : {}}
        >
          <Image source={item.avatar} style={styles.memberavatar} />
          {open_memebers_box ? (
            <Text style={styles.memberusername}>{item.username}</Text>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  }
  const _render_online_memebers_box = () => {
    /**
     * _render_online_memebers_box
     * render online members box
     */
    return (
      <View>
        <Animated.View
          style={[
            styles.mapmembergreendot,
            { bottom: open_memebers_boxheight_Anim }, // animate box toggle open
          ]}
        />
        <AnimatedTouchableOpacity
          onPress={() => {
            toggle_online_member_box();
          }}
          style={[
            styles.mapmembersbox,
            { height: open_memebers_boxheight_Anim }, // animate box toggle open
          ]}
          disabled={open_memebers_box} // disable when box is open
        >
          <BlurView intensity={Platform.OS == "ios" ? 69 : 100} tint={"light"}>
            <View style={styles.mapmembersboxinside}>
              {/*map members bg start*/}
              {open_memebers_box ?? (
                <Image
                  source={require("@assets/mapmemberoverlay.png")}
                  style={styles.mapmemberoverlay}
                />
              )}
              <Image
                source={
                  open_memebers_box
                    ? require("@assets/mapmembergreenglow2.png")
                    : require("@assets/mapmembergreenglow.png")
                }
                style={styles.mapmemberoverlay2}
              />

              {/*map members bg end*/}
              {open_memebers_box ? (
                <TouchableOpacity
                  onPress={() => {
                    toggle_online_member_box();
                  }}
                  style={styles.closememebers}
                >
                  <Image
                    source={require("@assets/icons/arrow-down.png")}
                    style={styles.closememebersimg}
                  />
                </TouchableOpacity>
              ) : null}
              {open_memebers_box ? (
                <Text style={styles.onlinemapmemberstext}>
                  {map_markers.length} Online Friends
                </Text>
              ) : null}
              {/*map members list start*/}
              <FlatList
                key={
                  open_memebers_box
                    ? "open_memebers_box"
                    : "closememebers"
                } // change the key to force flatlist to update
                style={open_memebers_box ? styles.mapmembers_open : {}}
                contentContainerStyle={[
                  styles.mapmemberscontainerstyle,
                  open_memebers_box
                    ? styles.mapmemberscontainerstyle_open
                    : {},
                ]}
                numColumns={
                  open_memebers_box
                    ? window.width < 384
                      ? 4
                      : 5
                    : undefined // responsive fix
                }
                data={
                  open_memebers_box
                    ? map_markers
                    : map_markers.slice(0, 7) // only show 7 members when box is closed
                }
                horizontal={!open_memebers_box}
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.key.toString()}
                renderItem={({ item, index }) =>
                  _render_online_memebers_box_item(item as mapMakerInterface, index)
                }
                ListFooterComponent={
                  map_markers.length > 7 ? ( // show + when markers are more than 7
                    <LinearGradient
                      start={{ x: 0.5, y: 0 }}
                      end={{ x: 0.5, y: 1 }}
                      colors={["#1C1C1E", "#000000"]}
                      style={[
                        styles.membersmore,
                        open_memebers_box ? { display: "none" } : {},
                      ]}
                    >
                      <Text style={styles.membersmoretext}>
                        +{map_markers.length - 7}
                      </Text>
                    </LinearGradient>
                  ) : null
                }
              />
              {/*map members list end*/}
            </View>
          </BlurView>
        </AnimatedTouchableOpacity>
      </View>
    );
  }
  const _render_member_maker_box = () => {
    /**
     * _render_member_maker_box
     * render member maker box
     */
    return (
      <View>
        {/* start show on the map pin icon */}
        <TouchableOpacity
          onPress={() => {
            show_member_marker_on_the_map();
          }}
          style={styles.membermarkerpin}
        >
          <LinearGradient
            start={{ x: -0.12, y: -0.34 }}
            end={{ x: 0.67, y: 1 }}
            colors={["#1C1C1E", "#000000"]}
            style={styles.membermarkerpinicon}
          >
            <Image
              source={require("../assets/icons/pin.png")}
              style={styles.membermarkerpiniconimg}
            />
          </LinearGradient>
        </TouchableOpacity>
        {/* end show on the map pin icon */}
        {/* start member marker box */}
        <BlurView
          style={styles.membermarkerbox}
          intensity={Platform.OS == "ios" ? 69 : 100}
          tint={"light"}
        >
          <View
            style={[
              styles.mapmembersboxinside,
              { flexDirection: "row", paddingHorizontal: 15 },
            ]}
          >
            <View
              style={[
                styles.membermarkeravatar,
                {
                  borderColor: map_markers[
                    current_memeber_marker_index
                  ].color.start,
                },
              ]}
            >
              {/* member marker box user avatar */}
              <Image
                source={
                  map_markers[
                    current_memeber_marker_index
                  ].avatar
                }
                style={styles.membermarkeravatarimg}
              />
            </View>
            <View style={styles.membermarkerinfo}>
              {/* member marker box user fullname */}
              <Text style={styles.membermarkerinfoname}>
                {
                  map_markers[
                    current_memeber_marker_index
                  ].name
                }
              </Text>
              <View style={styles.membermarkerinfostatus}>
                {/* member marker box activity icon */}
                <Image
                  source={get_current_memeber_marker_activity_icon(
                    map_markers[
                      current_memeber_marker_index
                    ].activity
                  )}
                  style={styles.membermarkerinfoactivityicon}
                />
                <Image
                  source={require("@assets/icons/small/distance.png")}
                  style={styles.membermarkerinfodistanceicon}
                />
                {/* member marker box activity distance */}
                <Text style={styles.membermarkerinfodistance}>
                  {
                    map_markers[
                      current_memeber_marker_index
                    ].distance
                  }
                </Text>
                {/* member marker box activity distance unit */}
                <Text style={styles.membermarkerinfodistanceunit}>
                  {
                    map_markers[
                      current_memeber_marker_index
                    ].unit
                  }
                </Text>
              </View>
            </View>
          </View>
        </BlurView>
        {/* end member marker box */}
      </View>
    );
  }
  const toggle_online_member_box = () => {
    /* open/close online member box list */
    if (open_memebers_box) {
      /* animate height */
      Animated.timing(open_memebers_boxheight_Anim, {
        toValue: 75,
        duration: 500,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();
      /* set box closed */
      setOpenMemebersBox(false);
    } else {
      /* animate height */
      Animated.timing(open_memebers_boxheight_Anim, {
        toValue: 307,
        duration: 500,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();
      /* set box open */
      setOpenMemebersBox(true);
    }
  }
  const get_current_memeber_marker_activity_icon = (activityname: mapMakerActivityType) => {
    /**
     * get_current_memeber_marker_activity_icon
     * @param activityname type:string | "cycling","running","walking"
     * @return activity icon
     */
    let icon = null;
    switch (activityname) {
      case "cycling":
        icon = require("@assets/icons/small/cycling.png");
        break;
      case "running":
        icon = require("@assets/icons/small/running.png");
        break;
      case "walking":
        icon = require("@assets/icons/small/walking.png");
        break;
      default:
        icon = require("@assets/icons/small/cycling.png");
    }
    return icon;
  }
  const show_member_marker_on_the_map = async () => {
    /* move the map camera to the location of the current memeber marker index */
    const camera = await Map.current!.getCamera();
    /* get lat and lon form current memeber marker form markers */
    camera.center.latitude = map_markers[
      current_memeber_marker_index
    ].latitude;
    camera.center.longitude = map_markers[
      current_memeber_marker_index
    ].longitude;
    /* move the map camera to the new location */
    Map.current!.animateCamera(camera!, { duration: 2000 });
  }

  const show_memeber_markerbox = (index: number) => {
    /* hide online memeber box and show memeber marker box */
    setShowOnlineMemeberBox(false);
    setCurrentMemeberMarkerIndex(index);
  }
  return (
    <SafeAreaView style={styles.container}>
      {/*map start*/}
      <MapView
        ref={Map}
        initialRegion={get_region_from_latlon(
          40.6945517,
          -73.7468122,
          650
        )}
        customMapStyle={Mapstyle}
        style={styles.mapview}
      >
        {/*map maker start*/}
        {map_markers.map((marker: mapMakerInterface, index: number) =>
          _render_map_marker(marker, index)
        )}
        {/*map maker end*/}
        {/*map my location maker start*/}
        <Marker
          key={"user_current_location"}
          coordinate={user_current_location}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View>
            <Image
              source={require("../assets/icons/mylocation.png")}
              style={styles.mapuser_current_locationimg}
            />
          </View>
        </Marker>
        {/*map my location maker end*/}
      </MapView>
      {/*map end*/}
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
      <View>
        {/*return user_current_location button start*/}
        {!open_memebers_box &&
          show_online_memeber_box ? (
          <TouchableOpacity
            onPress={() => {
            }}
            style={styles.location}
          >
            <LinearGradient
              start={{ x: -0.37, y: -1.15 }}
              end={{ x: 0.67, y: 1 }}
              colors={["#FBFBFB", "#AEAEB2"]}
              style={styles.locationbg}
            >
              <Image
                source={require("@assets/icons/location.png")}
                style={styles.locationimg}
              />
            </LinearGradient>
          </TouchableOpacity>
        ) : null}
        {/*return user_current_location button end*/}
        {/*map members start*/}
        {show_online_memeber_box
          ? _render_online_memebers_box()
          : _render_member_maker_box()}
        {/*map members end*/}
      </View>
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
    marker:{
      width:'60@ratio',
      height:'60@ratio'
    },
    container: {
      flex: 1,
      backgroundColor: "#EBEBF0",
    },
    mapview: {
      width: "100%",
      height: "100%",
      backgroundColor: "#EBEBF0",
    },
    returnbutton: {
      position: "absolute",
      left: '16@ratio',
      top: Platform.OS == "ios" ? '60@ratio' : '40@ratio', // ios fix
      width: '44@ratio',
      height: '44@ratio',
      borderRadius: Platform.OS == "ios" ? '22@ratio' : '44@ratio', // ios fix
      backgroundColor: "rgba(0,0,0,0.08)",
      justifyContent: "center",
      alignItems: "center",
    },
    returnbuttonimg: {
      width: '9@ratio',
      height: '16@ratio',
      resizeMode: "contain",
    },
    members_open: {
      marginHorizontal: '15@ratio',
      marginBottom: '17@ratio',
    },
    mapmembers_open: {
      marginBottom: '10@ratio',
    },
    mapmembersbox: {
      position: "absolute",
      width: "94%",
      height: '75@ratio',
      left: "3%",
      bottom: '6@ratio',
      borderRadius: '16@ratio',
      zIndex: 1,
      overflow: "hidden",
    },
    membermarkerbox: {
      position: "absolute",
      width: "94%",
      height: '124@ratio',
      left: "3%",
      bottom: '6@ratio',
      borderRadius: '16@ratio',
      zIndex: 1,
      overflow: "hidden",
    },
    mapmembersboxblur: {
      borderRadius: '16@ratio',
      overflow: "hidden",
    },
    mapmembersboxinside: {
      width: "100%",
      height: "100%",
      backgroundColor: "#FFFFFF",
      borderRadius: '16@ratio',
      justifyContent: "center",
      alignItems: "center",
    },
    mapmemberoverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      resizeMode: "stretch",
    },
    mapmemberoverlay2: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      resizeMode: "stretch",
    },
    mapmembergreendot: {
      position: "absolute",
      width: '10@ratio',
      height: '10@ratio',
      left: "8%",
      bottom: '75@ratio',
      backgroundColor: "#94CF76",
      borderRadius: '10@ratio',
      zIndex: 2,
    },
    memberavatar: {
      width: '44@ratio',
      height: '44@ratio',
      resizeMode: "contain",
      marginRight: '-3@ratio',
    },
    memberusername: {
      fontFamily: "Gilroy-SemiBold",
      fontSize: '12@ratio',
      color: "#6B6B70",
      marginTop: '5@ratio',
      textAlign: "center",
    },
    mapmemberscontainerstyle: {
      paddingRight: '3@ratio',
      alignItems: "center",
      flexDirection: "row",
    },
    mapmemberscontainerstyle_open: {
      flexDirection: "column",
      alignItems: "flex-start",
    },
    onlinemapmemberstext: {
      fontFamily: "Gilroy-SemiBold",
      fontSize: '16@ratio',
      color: "#94CF76",
      marginBottom: '15@ratio',
      paddingLeft: '16@ratio',
      marginTop: '24@ratio',
      alignSelf: "flex-start",
      textAlign: "left",
    },
    membersmore: {
      width: '45@ratio',
      height: '46@ratio',
      borderRadius: Platform.OS == "ios" ? '22@ratio' : '44@ratio', // ios fix
      marginLeft: '-41@ratio',
      marginTop: '-1@ratio',
      justifyContent: "center",
      alignItems: "center",
    },
    membersmoretext: {
      fontFamily: "Gilroy-SemiBold",
      fontSize: '20@ratio',
      color: "#ffffff",
    },
    closememebers: {
      height: '32@ratio',
      width: '100@ratio',
      position: "absolute",
      top: 0,
      right: "50%",
      marginRight: '-50@ratio',
      justifyContent: "center",
      alignItems: "center",
    },
    closememebersimg: {
      width: '30@ratio',
      height: '6@ratio',
      resizeMode: "contain",
    },
    location: {
      position: "absolute",
      width: '44@ratio',
      height: '44@ratio',
      bottom: '108@ratio',
      right: "3%",
    },
    locationbg: {
      width: '44@ratio',
      height: '44@ratio',
      borderRadius: Platform.OS == "ios" ? '22@ratio' : '44@ratio', // ios fix
      justifyContent: "center",
      alignItems: "center",
    },
    locationimg: {
      width: '21@ratio',
      height: '21@ratio',
      resizeMode: "contain",
    },
    mapmarkerstartpoint: {
      width: '8@ratio',
      height: '8@ratio',
      borderRadius: Platform.OS == "ios" ? '4@ratio' : '8@ratio', // ios fix
    },
    mapmarkeravatar: {
      position: "absolute",
      width: '30@ratio',
      height: '30@ratio',
      left: '15@ratio',
      top: '12@ratio',
      borderRadius: Platform.OS == "ios" ? '14@ratio' : '28@ratio', // ios fix
      borderWidth: '1@ratio',
      borderColor: "#ffffff",
    },
    mapuser_current_locationimg: {
      width: '188@ratio',
      height: '188@ratio',
    },
    membermarkeravatar: {
      width: '58@ratio',
      height: '58@ratio',
      borderRadius: Platform.OS == "ios" ? '29@ratio' : '58@ratio', // ios fix
      borderWidth: '3@ratio',
    },
    membermarkeravatarimg: {
      width: '52@ratio',
      height: '52@ratio',
      resizeMode: "contain",
      borderRadius: Platform.OS == "ios" ? '29@ratio' : '58@ratio', // ios fix
    },
    membermarkerinfo: {
      flex: 1,
      marginLeft: '20@ratio',
    },
    membermarkerinfoname: {
      fontFamily: "Gilroy-SemiBold",
      fontSize: '18@ratio',
      color: "#000000",
    },
    membermarkerinfostatus: {
      flexDirection: "row",
      alignItems: "center",
    },
    membermarkerinfoactivityicon: {
      width: '28@ratio',
      height: '28@ratio',
      resizeMode: "contain",
      marginRight: '10@ratio',
    },
    membermarkerinfodistanceicon: {
      width: '41@ratio',
      height: '6@ratio',
      resizeMode: "contain",
      marginRight: '5@ratio',
    },
    membermarkerinfodistance: {
      fontFamily: "Gilroy-SemiBold",
      fontSize: '18@ratio',
      color: "#6B6B70",
    },
    membermarkerinfodistanceunit: {
      fontFamily: "Gilroy-Bold",
      fontSize: '14@ratio',
      color: "#6B6B70",
      marginLeft: '3@ratio',
      marginTop: '4@ratio',
    },
    membermarkerpin: {
      width: '44@ratio',
      height: '44@ratio',
      position: "absolute",
      bottom: '110@ratio',
      right: "5%",
      zIndex: 2,
    },
    membermarkerpinicon: {
      width: '44@ratio',
      height: '44@ratio',
      borderRadius: Platform.OS == "ios" ? '22@ratio' : '44@ratio', // ios fix
      justifyContent: "center",
      alignItems: "center",
    },
    membermarkerpiniconimg: {
      width: '28@ratio',
      height: '28@ratio',
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
    backgroundColor: "#1A1735",
  },
  mapview: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(60, 63, 105, 0.47)",
  },
  returnbutton: {
    position: "absolute",
    left: 16,
    top: Platform.OS == "ios" ? 60 : 40, // ios fix
    width: 44,
    height: 44,
    borderRadius: Platform.OS == "ios" ? 22 : 44, // ios fix
    backgroundColor: "rgba(60,63,105,0.49)",
    justifyContent: "center",
    alignItems: "center",
  },
  returnbuttonimg: {
    width: 9,
    height: 16,
    resizeMode: "contain",
  },
  members_open: {
    marginHorizontal: 15,
    marginBottom: 17,
  },
  mapmembers_open: {
    marginBottom: 10,
  },
  mapmembersbox: {
    position: "absolute",
    width: "94%",
    height: 75,
    left: "3%",
    bottom: 6,
    borderRadius: 16,
    zIndex: 1,
    overflow: "hidden",
  },
  membermarkerbox: {
    position: "absolute",
    width: "94%",
    height: 124,
    left: "3%",
    bottom: 6,
    borderRadius: 16,
    zIndex: 1,
    overflow: "hidden",
  },
  mapmembersboxblur: {
    borderRadius: 16,
    overflow: "hidden",
  },
  mapmembersboxinside: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(60,63,105,0.69)",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  mapmemberoverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    resizeMode: "stretch",
  },
  mapmemberoverlay2: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    resizeMode: "stretch",
  },
  mapmembergreendot: {
    position: "absolute",
    width: 10,
    height: 10,
    left: "8%",
    bottom: 75,
    backgroundColor: "#94CF76",
    borderRadius: 10,
    zIndex: 2,
  },
  memberavatar: {
    width: 44,
    height: 44,
    resizeMode: "contain",
    marginRight: -3,
  },
  memberusername: {
    fontFamily: "Gilroy-SemiBold",
    fontSize: 12,
    color: "#ffffff",
    marginTop: 5,
    textAlign: "center",
  },
  mapmemberscontainerstyle: {
    paddingRight: 3,
    alignItems: "center",
    flexDirection: "row",
  },
  mapmemberscontainerstyle_open: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  onlinemapmemberstext: {
    fontFamily: "Gilroy-SemiBold",
    fontSize: 16,
    color: "#94CF76",
    marginBottom: 15,
    paddingLeft: 16,
    marginTop: 24,
    alignSelf: "flex-start",
    textAlign: "left",
  },
  membersmore: {
    width: 45,
    height: 46,
    borderRadius: Platform.OS == "ios" ? 22 : 44, // ios fix
    marginLeft: -41,
    marginTop: -1,
    justifyContent: "center",
    alignItems: "center",
  },
  membersmoretext: {
    fontFamily: "Gilroy-SemiBold",
    fontSize: 20,
    color: "#ffffff",
  },
  closememebers: {
    height: 32,
    width: 100,
    position: "absolute",
    top: 0,
    right: "50%",
    marginRight: -50,
    justifyContent: "center",
    alignItems: "center",
  },
  closememebersimg: {
    width: 30,
    height: 6,
    resizeMode: "contain",
  },
  location: {
    position: "absolute",
    width: 44,
    height: 44,
    bottom: 108,
    right: "3%",
  },
  locationbg: {
    width: 44,
    height: 44,
    borderRadius: Platform.OS == "ios" ? 22 : 44, // ios fix
    justifyContent: "center",
    alignItems: "center",
  },
  locationimg: {
    width: 21,
    height: 21,
    resizeMode: "contain",
  },
  mapmarkerstartpoint: {
    width: 8,
    height: 8,
    borderRadius: Platform.OS == "ios" ? 4 : 8, // ios fix
  },
  mapmarkeravatar: {
    position: "absolute",
    width: 30,
    height: 30,
    left: 15,
    top: 12,
    borderRadius: Platform.OS == "ios" ? 14 : 28, // ios fix
    borderWidth: 1,
    borderColor: "#ffffff",
  },
  mapuser_current_locationimg: {
    width: 188,
    height: 188,
  },
  membermarkeravatar: {
    width: 58,
    height: 58,
    borderRadius: Platform.OS == "ios" ? 29 : 58, // ios fix
    borderWidth: 3,
  },
  membermarkeravatarimg: {
    width: 52,
    height: 52,
    resizeMode: "contain",
    borderRadius: Platform.OS == "ios" ? 29 : 58, // ios fix
  },
  membermarkerinfo: {
    flex: 1,
    marginLeft: 20,
  },
  membermarkerinfoname: {
    fontFamily: "Gilroy-SemiBold",
    fontSize: 18,
    color: "#ffffff",
  },
  membermarkerinfostatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  membermarkerinfoactivityicon: {
    width: 28,
    height: 28,
    resizeMode: "contain",
    marginRight: 10,
  },
  membermarkerinfodistanceicon: {
    width: 41,
    height: 6,
    resizeMode: "contain",
    marginRight: 5,
  },
  membermarkerinfodistance: {
    fontFamily: "Gilroy-SemiBold",
    fontSize: 18,
    color: "#ffffff",
  },
  membermarkerinfodistanceunit: {
    fontFamily: "Gilroy-Bold",
    fontSize: 14,
    color: "#ffffff",
    marginLeft: 3,
    marginTop: 4,
  },
  membermarkerpin: {
    width: 44,
    height: 44,
    position: "absolute",
    bottom: 110,
    right: "5%",
    zIndex: 2,
  },
  membermarkerpinicon: {
    width: 44,
    height: 44,
    borderRadius: Platform.OS == "ios" ? 22 : 44, // ios fix
    justifyContent: "center",
    alignItems: "center",
  },
  membermarkerpiniconimg: {
    width: 28,
    height: 28,
    resizeMode: "contain",
  },
});
