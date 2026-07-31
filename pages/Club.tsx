import React, { useEffect, useRef } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Animated,
  Easing,
  ImageBackground,
  Platform,
  Dimensions,
} from "react-native";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import {
  Svg,
  Circle,
  Defs,
  LinearGradient as SLinearGradient,
  Stop,
} from "react-native-svg";
import { BlurView } from "expo-blur";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import { Mapstyle } from "../map/Mapstyle";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { ClubPropsInterface, EventsItemInterface, OnlineMembersItemInterface, StoriesItemInterface } from "./_types/Club.i";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { events, map_online_memebers, stories } from "static/Club";
import { get_region_from_latlon } from "@helper/map";
const window = Dimensions.get("window");
/**
 * Club
 * figma page names : Club
 */
export default function Club({ navigation }: ClubPropsInterface) {
  const styles = useStyle();
  const live_account_animationr1 = useRef(new Animated.ValueXY({ x: 1, y: 1.1 })).current; // animate the live account ring 1
  const live_account_animationr2 = useRef(new Animated.ValueXY({ x: 0.7, y: 1.25 })).current; // animate the live account ring 2
  const live_account_animationr3 = useRef(new Animated.ValueXY({ x: 0.3, y: 1.45 })).current; // animate the live account ring 3
  useEffect(() => {
    /* animate the live account */
    Animated.loop(
      Animated.parallel([
        Animated.timing(live_account_animationr1, {
          toValue: { x: 0.7, y: 1.25 },
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
        Animated.timing(live_account_animationr2, {
          toValue: { x: 0.3, y: 1.45 },
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
        Animated.timing(live_account_animationr3, {
          toValue: { x: 0, y: 1.65 },
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
      ]),
      {
        iterations: -1,
      }
    ).start();
  }, [])
  const _render_story_items = (item: StoriesItemInterface) => {
    /**
     * _render_story_items
     */
    return (
      <View style={styles.story}>
        <TouchableOpacity
          onPress={() => {
            open_story_carousel();
          }}
        >
          {/*show overlay only for add story*/}
          {typeof item.add != "undefined" ? (
            <View style={styles.storyoverlay} />
          ) : null}
          {/*show diffrend type of ring for seen , live , add*/}
          {typeof item.add != "undefined" ? (
            <Svg
              width={styles.storyitem.width}
              height={styles.storyitem.height}
              viewBox="0 0 57 57"
              fill="none"
            >
              <Circle
                cx="28.5"
                cy="28.5"
                r="27.5"
                stroke="#8A8CB3"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="1 6"
              />
            </Svg>
          ) : item.islive || !item.seen ? (
            <Svg
              width={styles.storyitem.width}
              height={styles.storyitem.height}
              viewBox="0 0 57 57"
              fill="none"
            >
              <Circle
                cx="28.5"
                cy="28.5"
                r="27.5"
                stroke="url(#paint0_linear)"
                strokeWidth={styles.storyitem.borderWidth}
              />
              <Defs>
                <SLinearGradient
                  id="paint0_linear"
                  x1="14.5"
                  y1="1"
                  x2="34.5"
                  y2="57.5"
                  gradientUnits="userSpaceOnUse"
                >
                  <Stop offset="0.0310714" stopColor="#5652E5" />
                  <Stop
                    offset="0.284608"
                    stopColor="#B5BFFF"
                    stopOpacity="0.47"
                  />
                  <Stop offset="0.533119" stopColor="#9557AD" />
                  <Stop offset="1" stopColor="#F85365" />
                </SLinearGradient>
              </Defs>
            </Svg>
          ) : (
            <Svg
              width={styles.storyitem.width}
              height={styles.storyitem.height}
              viewBox="0 0 57 57"
              fill="none"
            >
              <Circle
                cx="28.5"
                cy="28.5"
                r="27.5"
                stroke="url(#paint0_linear)"
                strokeWidth={styles.storyitem.borderWidth}
              />
              <Defs>
                <SLinearGradient
                  id="paint0_linear"
                  x1="28.5"
                  y1="1"
                  x2="44.5"
                  y2="56"
                  gradientUnits="userSpaceOnUse"
                >
                  <Stop stopColor="white" />
                  <Stop offset="1" stopColor="#8A8CB3" />
                </SLinearGradient>
              </Defs>
            </Svg>
          )}
          <Image source={item.avatar} style={styles.storyavatar} />
          {/*show add icon only for add story*/}
          {typeof item.add != "undefined" ? (
            <Image
              source={require("@assets/icons/add.png")}
              style={styles.storyicon}
            />
          ) : null}
          {/*show live animation start*/}
          {item.islive ? (
            <View style={styles.storyliveanim}>
              <Animated.Image
                source={require("@assets/storyliveglow.png")}
                style={[
                  styles.storyliveanimrglow,
                  styles.storyliveanimr1,
                  {
                    opacity: live_account_animationr1.x,
                    transform: [
                      { scale: live_account_animationr1.y },
                    ],
                  },
                ]}
              />
              <Animated.Image
                source={require("@assets/storyliveglow.png")}
                style={[
                  styles.storyliveanimrglow,
                  styles.storyliveanimr2,
                  {
                    opacity: live_account_animationr2.x,
                    transform: [
                      { scale: live_account_animationr2.y },
                    ],
                  },
                ]}
              />
              <Animated.Image
                source={require("@assets/storyliveglow.png")}
                style={[
                  styles.storyliveanimrglow,
                  styles.storyliveanimr3,
                  {
                    opacity: live_account_animationr3.x,
                    transform: [
                      { scale: live_account_animationr3.y },
                    ],
                  },
                ]}
              />
            </View>
          ) : null}
          {/*show live animation end*/}
          {/*show live text start*/}
          {item.islive ? (
            <LinearGradient
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              colors={["#F85365", "#FE828F"]}
              style={styles.storylivelabel}
            >
              <MaskedView
                maskElement={
                  <View style={styles.storylivelabelmaskview}>
                    <Text style={styles.storylivelabelmasktext}>LIVE</Text>
                  </View>
                }
              >
                <LinearGradient
                  start={{ x: 0.52, y: -0.2 }}
                  end={{ x: 0.52, y: 1.4 }}
                  colors={["rgba(255,255,255,1)", "rgba(255,255,255,0.2)"]}
                  style={styles.storylivelabelmaskbg}
                ></LinearGradient>
              </MaskedView>
            </LinearGradient>
          ) : null}
          {/*show live text end*/}
        </TouchableOpacity>
      </View>
    );
  }
  const _render_event_items = (item: EventsItemInterface) => {
    /**
     * _render_event_items
     */
    return (
      <View style={styles.eventcard} key={item.key}>
        <Image
          source={require("@assets/eventbullet.png")}
          style={styles.eventbullet}
        />
        {/*show connecting line if not last event*/}
        {item.key < events.length - 1 ? (
          <LinearGradient
            start={{ x: 0, y: 1 }}
            end={{ x: 0, y: 0 }}
            colors={[
              "rgba(60,63,105,1)",
              "rgba(60,63,105,0)",
              "rgba(60,63,105,1)",
              "rgba(60,63,105,0)",
            ]}
            locations={[0, 0.0001, 0.514034, 1]}
            style={styles.eventbulletline}
          ></LinearGradient>
        ) : null}
        {/*event icon start*/}
        <TouchableOpacity
          onPress={() => {
            console.log(item.id + "-icon");
            navigation.navigate("Clubnav", { screen: "Cycling" }); // navigate to cycling page
          }}
          style={styles.eventiconbox}
        >
          <View
            style={[
              styles.eventiconboxdrop,
              { backgroundColor: item.boxdropcolor },
            ]}
          />
          <LinearGradient
            start={{ x: 0.3, y: -0.4 }}
            end={{ x: 1.14, y: 0.945774 }}
            colors={item.gradientcolors as unknown as readonly [string, string, ...string[]]}
            style={styles.eventiconboxinside}
          >
            <Image source={item.icon} style={styles.eventicon} />
          </LinearGradient>
        </TouchableOpacity>
        {/*event icon end*/}
        <LinearGradient
          start={{ x: 0.32, y: -0.85 }}
          end={{ x: 0.42, y: 1.24 }}
          colors={["#8A8CB3", "#3C3F69"]}
          style={styles.eventbox}
        >
          {/*event number start*/}
          <MaskedView
            maskElement={
              <View style={styles.eventlabelmaskview}>
                <Text style={styles.eventlabelmasktext}>{item.number}</Text>
              </View>
            }
          >
            <LinearGradient
              start={{ x: 0.41, y: -0.3 }}
              end={{ x: 0.74, y: 1.69 }}
              colors={["rgba(60,63,105,1)", "rgba(60,63,105,0)"]}
              style={styles.eventlabelmaskbg}
            ></LinearGradient>
          </MaskedView>
          {/*event number end*/}
          <Text style={styles.eventlabel}>{item.title}</Text>
          {/* don't show time and bell in hdpi and below */}
          {window.width > 320 ? (
            <View style={styles.eventboxdata}>
              <Text style={styles.eventtime}>{item.time}</Text>
              <TouchableOpacity
                onPress={() => {
                  console.log(item.id + "-notification");
                }}
                style={styles.eventnotification}
              >
                <Image
                  source={require("@assets/icons/bell-notifications.png")}
                  style={styles.eventnotificationicon}
                />
              </TouchableOpacity>
            </View>
          ) : null}
        </LinearGradient>
      </View>
    );
  }
  const _render_map_online_members = (item: OnlineMembersItemInterface) => {
    /**
     * _render_map_online_members
     */
    return (
      <View>
        <Image source={item.avatar} style={styles.memberavatar} />
      </View>
    );
  }
  const _render_map_as_event_flatlist_header = () => {
    /**
     * render map and online members and club event title as event flatlist header
     */
    return (
      <View>
        {/*stories start*/}
        <View>
          <FlatList
            style={styles.stories}
            contentContainerStyle={styles.storycontainer}
            data={stories}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.key.toString()}
            renderItem={({ item }) => _render_story_items(item as StoriesItemInterface)}
          />
        </View>
        {/*stories end*/}
        <View style={styles.map}>
          <LinearGradient
            start={{ x: 0.26, y: -0.5 }}
            end={{ x: 0.83, y: 0.93 }}
            colors={["rgba(208, 210, 232, 0.15)", "rgba(208, 210, 232, 0)"]}
            style={styles.mapbox}
          >
            <View style={styles.mapboxbg} />
            <LinearGradient
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              colors={[
                "rgba(60, 63, 105, 0.47)",
                "rgba(60, 63, 105, 0.25)",
                "rgba(60, 63, 105, 0)",
              ]}
              locations={[0, 0.458569, 1]}
              style={styles.mapboxinside}
            >
              <Image
                source={require("@assets/mapboxinnershadow.png")}
                style={styles.mapboxinsideshadow}
              />
              {/*map view start*/}
              <View style={styles.mapviewbox}>
                <MapView
                  initialRegion={get_region_from_latlon(
                    40.6975517,
                    -73.7468122,
                    500
                  )}
                  customMapStyle={Mapstyle}
                  style={styles.mapview}
                  zoomEnabled={false}
                  zoomTapEnabled={false}
                  zoomControlEnabled={false}
                  scrollEnabled={false}
                  onPress={() =>
                    navigation.navigate("Clubnav", { screen: "Clubmap" })
                  }
                />
              </View>
              {/*map view end*/}
              {/*map members start*/}
              <View style={styles.mapmembergreendot} />
              <BlurView
                intensity={Platform.OS == "ios" ? 69 : 100}
                tint={"dark"}
                style={styles.mapmembersbox}
              >
                <View style={styles.mapmembersboxinside}>
                  {/*map members bg start*/}
                  <Image
                    source={require("@assets/mapmemberoverlay.png")}
                    style={styles.mapmemberoverlay}
                  />
                  <Image
                    source={require("@assets/mapmembergreenglow.png")}
                    style={styles.mapmemberoverlay2}
                  />

                  {/*map members bg end*/}
                  {/*map members list start*/}
                  <FlatList
                    style={styles.mapmembers}
                    contentContainerStyle={styles.mapmemberscontainerstyle}
                    data={map_online_memebers}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.key.toString()}
                    renderItem={({ item }) =>
                      _render_map_online_members(item)
                    }
                    ListFooterComponent={
                      <LinearGradient
                        start={{ x: 0.5, y: 0 }}
                        end={{ x: 0.5, y: 1 }}
                        colors={["rgba(60,63,105,1)", "rgba(60,63,105,0.72)"]}
                        style={styles.membersmore}
                      >
                        <Text style={styles.membersmoretext}>
                          +{map_online_memebers.length - 6}
                        </Text>
                      </LinearGradient>
                    }
                  />
                  {/*map members list end*/}
                  {/*map members scan start*/}
                  <TouchableOpacity
                    onPress={() => {
                      console.log("click");
                    }}
                  >
                    <LinearGradient
                      start={{ x: -0.12, y: -0.34 }}
                      end={{ x: 0.67, y: 1 }}
                      colors={["#505EDC", "#FB558B"]}
                      style={styles.mapmemberscanbtn}
                    >
                      <Image
                        source={require("../assets/icons/scan.png")}
                        style={styles.mapmemberscanbtnicon}
                      />
                    </LinearGradient>
                  </TouchableOpacity>
                  {/*map members scan end*/}
                </View>
              </BlurView>
              {/*map members end*/}
            </LinearGradient>
          </LinearGradient>
        </View>
        {/*club event title*/}
        <Text style={styles.eventtitle}>Club Events</Text>
      </View>
    );
  }
  const open_story_carousel = () => {
    /* navigate to Stories */
    navigation.navigate("Clubnav", { screen: "Stories" });
  }
  return (
    <ImageBackground
      source={require("@assets/bg2.png")}
      style={styles.bg}
    >
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        {/*toolbar start*/}
        <View style={styles.topbar}>
          {/*toolbar title start*/}
          <View style={styles.title}>
            <MaskedView
              maskElement={
                <View style={styles.masklabelview}>
                  <Text style={styles.masklabeltext}>My Club</Text>
                </View>
              }
            >
              <Image
                source={require("@assets/pagetitlemask.png")}
                style={styles.masklabelimg}
              />
            </MaskedView>
          </View>
          {/*toolbar title end*/}
          {/*toolbar actions start*/}
          <TouchableOpacity
            onPress={() => {
              console.log("click");
            }}
            style={styles.action}
          >
            <View style={[styles.actionstate, styles.actionstateactive]} />
            <Image
              source={require("@assets/icons/notification.png")}
              style={styles.actionicon}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              console.log("click");
            }}
            style={styles.action}
          >
            <View
              style={[
                styles.actionstate,
                styles.actionstate2,
                styles.actionstateactive,
              ]}
            />
            <Image
              source={require("@assets/icons/chat.png")}
              style={styles.actionicon2}
            />
          </TouchableOpacity>
          {/*toolbar actions end*/}
        </View>
        {/*toolbar end*/}
        <View style={styles.containerscroll}>
          {/*event start*/}
          <View style={styles.events}>
            <FlatList
              data={events}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={() =>
                _render_map_as_event_flatlist_header()
              }
              keyExtractor={(item) => item.key.toString()}
              renderItem={({ item }) => _render_event_items(item)}
            />
          </View>
          {/*event end*/}
        </View>
        {/*navigation start (remove comment when you don't want to use react native navigation bottom tab)*/}
        {/*<Navigation activepageindex={1} />*/}
        {/*navigation end*/}
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
    storyitem: {
      width: "55@ratio",
      height: "55@ratio",
      borderWidth: "1.5@ratio"
    },
    container: {
      flex: 1,
    },
    containerscroll: {
      marginTop: '15@ratio',
      flex: 1,
    },
    bg: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
      paddingTop: '44@ratio',
      backgroundColor: "#1A1735",
    },
    topbar: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: '16@ratio',
    },
    title: {
      flex: 1,
      height: '37@ratio',
    },
    masklabelview: {
      backgroundColor: "transparent",
      height: '37@ratio',
      alignItems: "flex-start",
    },
    masklabeltext: {
      fontSize: '30@ratio',
      color: "white",
      fontFamily: "Gilroy-ExtraBold",
    },
    masklabelimg: {
      resizeMode: "contain",
      width: "100%",
      height: '199@ratio',
      marginLeft: '-40@ratio',
      marginTop: '-37@ratio',
    },
    action: {
      width: '38@ratio',
      height: '38@ratio',
      justifyContent: "center",
      alignItems: "center",
      marginLeft: '10@ratio',
    },
    actionicon: {
      width: '38@ratio',
      height: '38@ratio',
      resizeMode: "contain",
    },
    actionicon2: {
      width: '26@ratio',
      height: '26@ratio',
      resizeMode: "contain",
    },
    actionstate: {
      position: "absolute",
      width: '10@ratio',
      height: '10@ratio',
      top: '5@ratio',
      right: '6@ratio',
      borderRadius: '10@ratio',
      backgroundColor: "#F85365",
      borderWidth: '1@ratio',
      borderColor: "#000000",
      zIndex: 1,
      opacity: 0,
    },
    actionstate2: {
      top: '4@ratio',
      right: '3@ratio',
    },
    actionstateactive: {
      opacity: 1,
    },
    stories: {
      marginTop: '8@ratio',
      marginBottom: '15@ratio',
    },
    story: {
      width: '55@ratio',
      height: '55@ratio',
      marginRight: '15@ratio',
    },
    storycontainer: {
      paddingLeft: '16@ratio',
      paddingVertical: '15@ratio',
    },
    storyavatar: {
      position: "absolute",
      width: '48@ratio',
      height: '48@ratio',
      borderRadius: '48@ratio',
      resizeMode: "contain",
      left: '3.5@ratio',
      top: '3.5@ratio',
      zIndex: 1,
    },
    storyoverlay: {
      position: "absolute",
      width: '48@ratio',
      height: '48@ratio',
      borderRadius: '48@ratio',
      left: '3.5@ratio',
      top: '3.5@ratio',
      backgroundColor: "rgba(60,63,105,0.74)",
      zIndex: 2,
    },
    storyicon: {
      position: "absolute",
      width: '14@ratio',
      height: '14@ratio',
      resizeMode: "contain",
      left: "50%",
      top: "50%",
      marginLeft: '-7@ratio',
      marginTop: '-7@ratio',
      zIndex: 3,
    },
    storylivelabel: {
      width: '37@ratio',
      height: '20@ratio',
      borderRadius: Platform.OS == "ios" ? '12@ratio' : '30@ratio', // ios fix
      position: "absolute",
      bottom: '-7@ratio',
      left: '9@ratio',
      justifyContent: "center",
      zIndex: 1,
    },
    storylivelabelmaskbg: {
      width: "100%",
      height: '16@ratio',
    },
    storylivelabelmaskview: {
      backgroundColor: "transparent",
      height: '16@ratio',
      alignItems: "center",
    },
    storylivelabelmasktext: {
      fontSize: '13@ratio',
      color: "white",
      fontFamily: "Gilroy-Bold",
    },
    storyliveanim: {
      position: "absolute",
      left: 0,
      top: 0,
    },
    storyliveanimrglow: {
      position: "absolute",
      width: '55@ratio',
      height: '55@ratio',
    },
    storyliveanimr1: {
      transform: [{ scale: 1 }],
      opacity: 1,
    },
    storyliveanimr2: {
      transform: [{ scale: 1.25 }],
      opacity: 0.7,
    },
    storyliveanimr3: {
      transform: [{ scale: 1.45 }],
      opacity: 0.3,
    },
    map: {
      width: "100%",
    },
    mapbox: {
      width: "100%",
      height: '258@ratio',
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
      height: '256@ratio',
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
    mapmembersbox: {
      position: "absolute",
      width: "96%",
      height: '75@ratio',
      left: "2%",
      bottom: '6@ratio',
      borderRadius: '16@ratio',
      zIndex: 1,
      overflow: "hidden",
    },
    mapmembersboxinside: {
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(60,63,105,0.69)",
      borderRadius: '16@ratio',
      justifyContent: "center",
      flexDirection: "row",
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
    mapmemberscanbtn: {
      width: '44@ratio',
      height: '44@ratio',
      borderRadius: Platform.OS == "ios" ? '22@ratio' : '44@ratio', // ios fix
      justifyContent: "center",
      alignItems: "center",
      marginRight: '15@ratio',
    },
    mapmemberscanbtnicon: {
      width: '24@ratio',
      height: '24@ratio',
      resizeMode: "contain",
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
      marginRight: '-22@ratio',
    },
    mapmembers: {
      flex: 1,
      paddingLeft: '15@ratio',
    },
    mapmemberscontainerstyle: {
      paddingRight: '22@ratio',
    },
    membersmore: {
      width: '45@ratio',
      height: '46@ratio',
      borderRadius: Platform.OS == "ios" ? '22@ratio' : '44@ratio', // ios fix
      marginLeft: '-23@ratio',
      marginTop: '-1@ratio',
      justifyContent: "center",
      alignItems: "center",
    },
    membersmoretext: {
      fontFamily: "Gilroy-SemiBold",
      fontSize: '20@ratio',
      color: "#ffffff",
    },
    events: {
      paddingRight: '16@ratio',
      paddingLeft: '8@ratio',
      flex: 1,
    },
    eventtitle: {
      fontFamily: "Gilroy-Bold",
      fontSize: '16@ratio',
      color: "#ffffff",
      marginBottom: '20@ratio',
      paddingLeft: '8@ratio',
      marginTop: '32@ratio',
    },
    eventcard: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    eventbullet: {
      width: '32@ratio',
      height: '32@ratio',
      marginTop: '-15@ratio',
    },
    eventbulletline: {
      position: "absolute",
      width: '1@ratio',
      height: '81@ratio',
      left: '15@ratio',
      top: '32@ratio',
      zIndex: -1,
    },
    eventbox: {
      flex: 1,
      height: '65@ratio',
      borderRadius: '16@ratio',
      marginLeft: '25@ratio',
      justifyContent: "center",
      flexDirection: "row",
      alignItems: "center",
      marginBottom: '17@ratio',
      paddingLeft: '30@ratio',
    },
    eventboxdata: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
    },
    eventiconbox: {
      position: "absolute",
      width: '50@ratio',
      height: '50@ratio',
      top: '7@ratio',
      left: '33@ratio',
      zIndex: 2,
    },
    eventiconboxinside: {
      width: '50@ratio',
      height: '50@ratio',
      borderRadius: '16@ratio',
      justifyContent: "center",
      alignItems: "center",
    },
    eventiconboxdrop: {
      position: "absolute",
      width: '36@ratio',
      height: '36@ratio',
      bottom: '-5@ratio',
      left: '7.5@ratio',
      borderRadius: '10@ratio',
      backgroundColor: "rgba(255,203,70,0.2)",
      zIndex: 0,
    },
    eventicon: {
      width: '40@ratio',
      height: '40@ratio',
      resizeMode: "contain",
    },
    eventlabelmaskbg: {
      minWidth: '70@ratio',
      height: '39@ratio',
    },
    eventlabelmaskview: {
      backgroundColor: "transparent",
      height: '39@ratio',
      alignItems: "center",
    },
    eventlabelmasktext: {
      fontSize: '32@ratio',
      color: "white",
      fontFamily: "Gilroy-Bold",
    },
    eventlabel: {
      fontSize: '14@ratio',
      color: "white",
      fontFamily: "Gilroy-Bold",
      marginRight: '25@ratio',
      flex: 1,
      textAlign: "center",
    },
    eventtime: {
      fontSize: '14@ratio',
      color: "#8A8CB2",
      fontFamily: "Gilroy-Bold",
      marginRight: '15@ratio',
      textAlign: "center",
    },
    eventnotification: {
      width: '24@ratio',
      height: '24@ratio',
      marginRight: '10@ratio',
    },
    eventnotificationicon: {
      width: '24@ratio',
      height: '24@ratio',
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
  containerscroll: {
    marginTop: 15,
    flex: 1,
  },
  bg: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    paddingTop: 44,
    backgroundColor: "#1A1735",
  },
  topbar: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  title: {
    flex: 1,
    height: 37,
  },
  masklabelview: {
    backgroundColor: "transparent",
    height: 37,
    alignItems: "flex-start",
  },
  masklabeltext: {
    fontSize: 30,
    color: "white",
    fontFamily: "Gilroy-ExtraBold",
  },
  masklabelimg: {
    resizeMode: "contain",
    width: "100%",
    height: 199,
    marginLeft: -40,
    marginTop: -37,
  },
  action: {
    width: 38,
    height: 38,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  actionicon: {
    width: 38,
    height: 38,
    resizeMode: "contain",
  },
  actionicon2: {
    width: 26,
    height: 26,
    resizeMode: "contain",
  },
  actionstate: {
    position: "absolute",
    width: 10,
    height: 10,
    top: 5,
    right: 6,
    borderRadius: 10,
    backgroundColor: "#F85365",
    borderWidth: 1,
    borderColor: "#000000",
    zIndex: 1,
    opacity: 0,
  },
  actionstate2: {
    top: 4,
    right: 3,
  },
  actionstateactive: {
    opacity: 1,
  },
  stories: {
    marginTop: 8,
    marginBottom: 15,
  },
  story: {
    width: 55,
    height: 55,
    marginRight: 15,
  },
  storycontainer: {
    paddingLeft: 16,
    paddingVertical: 15,
  },
  storyavatar: {
    position: "absolute",
    width: 48,
    height: 48,
    borderRadius: 48,
    resizeMode: "contain",
    left: 3.5,
    top: 3.5,
    zIndex: 1,
  },
  storyoverlay: {
    position: "absolute",
    width: 48,
    height: 48,
    borderRadius: 48,
    left: 3.5,
    top: 3.5,
    backgroundColor: "rgba(60,63,105,0.74)",
    zIndex: 2,
  },
  storyicon: {
    position: "absolute",
    width: 14,
    height: 14,
    resizeMode: "contain",
    left: "50%",
    top: "50%",
    marginLeft: -7,
    marginTop: -7,
    zIndex: 3,
  },
  storylivelabel: {
    width: 37,
    height: 20,
    borderRadius: Platform.OS == "ios" ? 12 : 30, // ios fix
    position: "absolute",
    bottom: -7,
    left: 9,
    justifyContent: "center",
    zIndex: 1,
  },
  storylivelabelmaskbg: {
    width: "100%",
    height: 16,
  },
  storylivelabelmaskview: {
    backgroundColor: "transparent",
    height: 16,
    alignItems: "center",
  },
  storylivelabelmasktext: {
    fontSize: 13,
    color: "white",
    fontFamily: "Gilroy-Bold",
  },
  storyliveanim: {
    position: "absolute",
    left: 0,
    top: 0,
  },
  storyliveanimrglow: {
    position: "absolute",
    width: 55,
    height: 55,
  },
  storyliveanimr1: {
    transform: [{ scale: 1 }],
    opacity: 1,
  },
  storyliveanimr2: {
    transform: [{ scale: 1.25 }],
    opacity: 0.7,
  },
  storyliveanimr3: {
    transform: [{ scale: 1.45 }],
    opacity: 0.3,
  },
  map: {
    width: "100%",
  },
  mapbox: {
    width: "100%",
    height: 258,
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
    height: 256,
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
  mapmembersbox: {
    position: "absolute",
    width: "96%",
    height: 75,
    left: "2%",
    bottom: 6,
    borderRadius: 16,
    zIndex: 1,
    overflow: "hidden",
  },
  mapmembersboxinside: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(60,63,105,0.69)",
    borderRadius: 16,
    justifyContent: "center",
    flexDirection: "row",
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
  mapmemberscanbtn: {
    width: 44,
    height: 44,
    borderRadius: Platform.OS == "ios" ? 22 : 44, // ios fix
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  mapmemberscanbtnicon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
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
    marginRight: -22,
  },
  mapmembers: {
    flex: 1,
    paddingLeft: 15,
  },
  mapmemberscontainerstyle: {
    paddingRight: 22,
  },
  membersmore: {
    width: 45,
    height: 46,
    borderRadius: Platform.OS == "ios" ? 22 : 44, // ios fix
    marginLeft: -23,
    marginTop: -1,
    justifyContent: "center",
    alignItems: "center",
  },
  membersmoretext: {
    fontFamily: "Gilroy-SemiBold",
    fontSize: 20,
    color: "#ffffff",
  },
  events: {
    paddingRight: 16,
    paddingLeft: 8,
    flex: 1,
  },
  eventtitle: {
    fontFamily: "Gilroy-Bold",
    fontSize: 16,
    color: "#ffffff",
    marginBottom: 20,
    paddingLeft: 8,
    marginTop: 32,
  },
  eventcard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  eventbullet: {
    width: 32,
    height: 32,
    marginTop: -15,
  },
  eventbulletline: {
    position: "absolute",
    width: 1,
    height: 81,
    left: 15,
    top: 32,
    zIndex: -1,
  },
  eventbox: {
    flex: 1,
    height: 65,
    borderRadius: 16,
    marginLeft: 25,
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 17,
    paddingLeft: 30,
  },
  eventboxdata: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  eventiconbox: {
    position: "absolute",
    width: 50,
    height: 50,
    top: 7,
    left: 33,
    zIndex: 2,
  },
  eventiconboxinside: {
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  eventiconboxdrop: {
    position: "absolute",
    width: 36,
    height: 36,
    bottom: -5,
    left: 7.5,
    borderRadius: 10,
    backgroundColor: "rgba(255,203,70,0.2)",
    zIndex: 0,
  },
  eventicon: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  eventlabelmaskbg: {
    minWidth: 70,
    height: 39,
  },
  eventlabelmaskview: {
    backgroundColor: "transparent",
    height: 39,
    alignItems: "center",
  },
  eventlabelmasktext: {
    fontSize: 32,
    color: "white",
    fontFamily: "Gilroy-Bold",
  },
  eventlabel: {
    fontSize: 14,
    color: "white",
    fontFamily: "Gilroy-Bold",
    marginRight: 25,
    flex: 1,
    textAlign: "center",
  },
  eventtime: {
    fontSize: 14,
    color: "#8A8CB2",
    fontFamily: "Gilroy-Bold",
    marginRight: 15,
    textAlign: "center",
  },
  eventnotification: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  eventnotificationicon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
});
