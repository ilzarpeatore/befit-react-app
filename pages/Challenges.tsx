import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Animated,
  ImageBackground,
  Platform,
  RefreshControl,
} from "react-native";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import {
  Svg,
  Circle,
  Defs,
  LinearGradient as SlinearGradient,
  Stop,
} from "react-native-svg";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChallengesItemsInterface, ChallengesPropsInterface, MissionsItemsInterface } from "./_types/Challenges.i";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { workoutsApi } from "@api/workouts";
import { challenges as staticChallenges, missions as staticMissions } from "static/Challenges";
/**
 * Challenges
 * figma page names : Name,Name - Active,Birthday,Birthday - Active
 */
export default function Challenges({ navigation }: ChallengesPropsInterface) {
  const styles = useStyle();
  const actions_Animx = useRef(new Animated.Value(0)).current;
  const [activeaction, setActiveaction] = useState<string>("Do");
  const [challengesData, setChallengesData] = useState<ChallengesItemsInterface[]>(staticChallenges);
  const [missionsData, setMissionsData] = useState<MissionsItemsInterface[]>(staticMissions);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    workoutsApi.getList(1).then((res) => {
      const mapped: ChallengesItemsInterface[] = (res.data?.data ?? []).slice(0, 8).map((w, i) => ({
        key: i,
        id: w.id,
        icon: require("@assets/challenges/cardio.png"),
        title: w.title,
        time: "15",
      }));
      if (mapped.length > 0) setChallengesData(mapped);
    }).catch(() => {});
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await workoutsApi.getList(1);
      const mapped: ChallengesItemsInterface[] = (res.data?.data ?? []).slice(0, 8).map((w, i) => ({
        key: i,
        id: w.id,
        icon: require("@assets/challenges/cardio.png"),
        title: w.title,
        time: "15",
      }));
      if (mapped.length > 0) setChallengesData(mapped);
    } catch {}
    setRefreshing(false);
  };

  const _render_challenge_items = (item: ChallengesItemsInterface) => {
    /**
     * _render_challenge_items
     * render challenge items
     */
    return (
      <View style={styles.challengecard} key={item.key}>
        <Image
          source={require("@assets/eventbullet.png")}
          style={styles.challengebullet}
        />
        {/*show connecting line if not last challenge*/}
        {item.key < challengesData.length - 1 ? (
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
            style={styles.challengebulletline}
          ></LinearGradient>
        ) : null}
        {/*challenge box start*/}
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("WorkoutDetail", { id: item.id } as any);
          }}
          style={styles.challengebox}
        >
          <LinearGradient
            start={{ x: 0.04, y: -0.1 }}
            end={{ x: 0.09, y: 1.72 }}
            colors={[
              "rgba(86,82,229,1)",
              "rgba(138,140,178,0)",
              "rgba(138,140,178,0)",
              "rgba(125,169,244,0.5)",
            ]}
            locations={[0, 0.348069, 0.596479, 1]}
            style={styles.challengeboxborder}
          >
            <View style={styles.challengeboxinside}>
              {/*challenge icon start*/}
              <View style={styles.challengeiconbox}>
                <Image source={item.icon} style={styles.challengeicon} />
              </View>
              {/*challenge icon end*/}
              <Text style={styles.challengelabel}>{item.title}</Text>
              <View style={styles.challengetimer}>
                <Image
                  source={require("@assets/challenges/stopwatch.png")}
                  style={styles.challengetimericon}
                />
                <Text style={styles.challengetime}>{item.time} min</Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
        {/*challenge box end*/}
      </View>
    );
  }
  const _render_mission_items = (item: MissionsItemsInterface) => {
    /**
     * _render_mission_items
     * render mission items
     */
    return (
      <View
        key={item.key}
        style={[
          styles.mission,
          item.key == missionsData.length - 1 ? { marginRight: 0 } : {},
        ]}
      >
        {/* mission image */}
        <Image source={item.image} style={styles.missionimg} />
        {/* mission image overlay */}
        <LinearGradient
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 0.5, y: 1 }}
          colors={["rgba(60, 63, 105, 0)", "rgba(60, 63, 105, 1)"]}
          style={styles.missionimgoverlay}
        />
        {/* mission data start */}
        <View style={styles.missiondata}>
          <View style={styles.missiondatainfo}>
            {/* mission data title */}
            <Text style={styles.missiontitle}>{item.title}</Text>
            {/* mission data category */}
            <Text style={styles.missioncategory}>{item.category}</Text>
          </View>
          {/* start mission data progress */}
          {item.percentage < 100 ? (
            <ImageBackground
              source={require("@assets/challenges/progressbg.png")}
              style={styles.missiondataprogress}
            >
              <Svg
                width={styles.percentage.width}
                height={styles.percentage.height}
                viewBox="0 0 33 33"
                fill="none"
                style={styles.missiondataprogresssvg}
              >
                <Circle
                  cx="16"
                  cy="16"
                  r="15"
                  fill="transparent"
                  stroke="url(#paint0_linear)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="98"
                  strokeDashoffset={
                    item.percentage <= 100 && item.percentage > 0
                      ? 100 - item.percentage
                      : 0
                  }
                />
                <Defs>
                  <SlinearGradient
                    id="paint0_linear"
                    x1="17"
                    y1="2.00012"
                    x2="27"
                    y2="27.5001"
                    gradientUnits="userSpaceOnUse"
                  >
                    <Stop stopColor="#5652E5" />
                    <Stop offset="1" stopColor="#F85365" />
                  </SlinearGradient>
                </Defs>
              </Svg>
            </ImageBackground>
          ) : (
            // show when progress is 100%
            <View style={styles.missiondataprogressdone}>
              <Image
                source={require("@assets/challenges/progressdone.png")}
                style={styles.missiondataprogressdoneicon}
              />
            </View>
          )}
          {/* mission data progress end */}
        </View>
        {/* mission data end */}
      </View>
    );
  }
  const _render_challenge_flatlist_header = () => {
    /**
     * _render_challenge_flatlist_header
     * render challenge flatlist header
     */
    return (
      <View>
        <View>
          {/* daily mission title */}
          <View style={styles.dailymissiontitle}>
            <Image
              source={require("@assets/challenges/medal.png")}
              style={styles.dailymissiontitleicon}
            />
            <Text style={styles.dailymissiontitlet}>Daily Missions</Text>
          </View>
          {/* daily mission start */}
          <FlatList
            style={styles.missions}
            data={missionsData}
            contentContainerStyle={styles.missionscontainer}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.key.toString()}
            renderItem={({ item }) => _render_mission_items(item)}
          />
          {/* daily mission end */}
        </View>
        {/* challenge title */}
        <Text style={styles.challengetitle}>More Challenges</Text>
      </View>
    );
  }
  const _render_toolbar_action = (firsttext: string, secondtext: string) => {
    /**
     * _render_toolbar_action
     * render toolbar action
     * @param firsttext : toolbar action
     */
    return (
      <View style={styles.actions}>
        {/* action animate bg*/}
        <Animated.View
          style={[
            styles.actionsbg,
            { transform: [{ translateX: actions_Animx }] },
          ]}
        />
        {/* action btn */}
        <TouchableOpacity
          onPress={() => {
            animate_toolbar_action(firsttext);
          }}
          style={styles.action}
        >
          <Text
            style={[
              styles.actiontext,
              activeaction == firsttext ? styles.actionactive : {},
            ]}
          >
            {firsttext}
          </Text>
        </TouchableOpacity>
        {/* action btn */}
        <TouchableOpacity
          onPress={() => {
            animate_toolbar_action(secondtext);
          }}
          style={styles.action}
        >
          <Text
            style={[
              styles.actiontext,
              activeaction == secondtext ? styles.actionactive : {},
            ]}
          >
            {secondtext}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
  const animate_toolbar_action = (name: string) => {
    /* animate toolbar action */
    setActiveaction(name);
    if (name == "Do")
      Animated.timing(actions_Animx, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    else
      Animated.timing(actions_Animx, {
        toValue: styles.actions.width / 2 - 4.5,
        duration: 500,
        useNativeDriver: true,
      }).start();
  };
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
                  <Text style={styles.masklabeltext}>Challenges</Text>
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
          {_render_toolbar_action("Do", "Done")}
          {/*toolbar actions end*/}
        </View>
        {/*toolbar end*/}
        <View style={styles.containerscroll}>
          {/*challenge start*/}
          <View style={styles.challenges}>
            <FlatList
              data={challengesData}
              showsVerticalScrollIndicator={false}
              keyExtractor={(item) => item.key.toString()}
              renderItem={({ item }) => _render_challenge_items(item)}
              ListHeaderComponent={() =>
                _render_challenge_flatlist_header()
              }
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FBFBFB" />
              }
            />
          </View>
          {/*challenge end*/}
        </View>
        {/*navigation start (remove comment when you don't want to use react native navigation bottom tab)*/}
        {/*<Navigation activepageindex={2} />*/}
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
    percentage:{
      width:'30@ratio',
      height:'30@ratio'
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
      marginLeft: '-30@ratio',
      marginTop: '-37@ratio',
    },
    actions: {
      width: '131@ratio',
      height: '35@ratio',
      borderRadius: '5@ratio',
      backgroundColor: "#3C3F69",
      flexDirection: "row",
    },
    actionsbg: {
      position: "absolute",
      width: "50%",
      height: '31@ratio',
      borderRadius: '4@ratio',
      backgroundColor: "#141227",
      top: '2@ratio',
      left: '2@ratio',
    },
    action: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    actiontext: {
      fontFamily: "Gilroy-SemiBold",
      fontSize: '14@ratio',
      color: "#8A8CB2",
      textAlign: "center",
    },
    actionactive: {
      color: "#ffffff",
    },
    dailymissiontitle: {
      flexDirection: "row",
      alignItems: "center",
      paddingLeft: '8@ratio',
    },
    dailymissiontitleicon: {
      width: '32@ratio',
      height: '32@ratio',
      resizeMode: "contain",
    },
    dailymissiontitlet: {
      fontFamily: "Gilroy-Bold",
      fontSize: '16@ratio',
      color: "#ffffff",
    },
    missions: {
      flexDirection: "row",
      marginTop: '14@ratio',
    },
    missionscontainer: {
      paddingLeft: '8@ratio',
      paddingHorizontal: '16@ratio',
    },
    mission: {
      width: '163@ratio',
      height: '144@ratio',
      borderRadius: '16@ratio',
      marginRight: '18@ratio',
    },
    missionimg: {
      width: '163@ratio',
      height: '144@ratio',
      borderRadius: '16@ratio',
    },
    missionimgoverlay: {
      position: "absolute",
      width: '163@ratio',
      height: '144@ratio',
      borderRadius: '16@ratio',
      top: 0,
      right: 0,
    },
    missiondata: {
      flexDirection: "row",
      position: "absolute",
      bottom: 0,
      right: 0,
      width: "100%",
      paddingHorizontal: '10@ratio',
      paddingBottom: '16@ratio',
      alignItems: "center",
      justifyContent: "center",
    },
    missiondataprogress: {
      width: '30@ratio',
      height: '30@ratio',
      resizeMode: "contain",
    },
    missiondataprogresssvg: {
      transform: [{ rotate: "-90deg" }],
    },
    missiondatainfo: {
      flex: 1,
    },
    missiontitle: {
      fontFamily: "Gilroy-Bold",
      fontSize: '16@ratio',
      color: "#ffffff",
      marginBottom: '3@ratio',
    },
    missioncategory: {
      fontFamily: "Gilroy-Medium",
      fontSize: '14@ratio',
      color: "#ffffff",
    },
    missiondataprogressdone: {
      width: '36@ratio',
      height: '36@ratio',
      borderRadius: Platform.OS == "ios" ? '18@ratio' : '36@ratio', //ios fix
      borderWidth: '3@ratio',
      borderColor: "#5652E5",
      alignItems: "center",
      justifyContent: "center",
    },
    missiondataprogressdoneicon: {
      width: '13@ratio',
      height: '6@ratio',
      resizeMode: "contain",
    },
    challenges: {
      paddingRight: '16@ratio',
      paddingLeft: '8@ratio',
      flex: 1,
    },
    challengetitle: {
      fontFamily: "Gilroy-Bold",
      fontSize: '16@ratio',
      color: "#ffffff",
      marginBottom: '20@ratio',
      paddingLeft: '8@ratio',
      marginTop: '32@ratio',
    },
    challengecard: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    challengebullet: {
      width: '32@ratio',
      height: '32@ratio',
      marginTop: '-15@ratio',
    },
    challengebulletline: {
      position: "absolute",
      width: '1@ratio',
      height: '81@ratio',
      left: '15@ratio',
      top: '32@ratio',
      zIndex: -1,
    },
    challengebox: {
      flex: 1,
      height: '65@ratio',
      borderRadius: '16@ratio',
      marginLeft: '5@ratio',
      marginBottom: '17@ratio',
    },
    challengeboxborder: {
      flex: 1,
      borderRadius: '16@ratio',
      justifyContent: "center",
      flexDirection: "row",
      alignItems: "center",
      padding: '1@ratio',
    },
    challengeboxinside: {
      width: "100%",
      height: "100%",
      borderRadius: '16@ratio',
      backgroundColor: "#3C3F69",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: '12@ratio',
    },
    challengeiconbox: {
      width: '45@ratio',
      height: '45@ratio',
      borderRadius: '13@ratio',
      backgroundColor: "rgba(20,18,39,0.2)",
      justifyContent: "center",
      alignItems: "center",
    },
    challengeicon: {
      width: '24@ratio',
      height: '24@ratio',
      resizeMode: "contain",
    },
    challengelabel: {
      fontSize: '14@ratio',
      color: "white",
      fontFamily: "Gilroy-Bold",
      flex: 1,
      paddingLeft: '9@ratio',
    },
    challengetimer: {
      flexDirection: "row",
      alignItems: "center",
    },
    challengetimericon: {
      width: '24@ratio',
      height: '24@ratio',
      resizeMode: "contain",
      marginRight: '5@ratio',
    },
    challengetime: {
      fontSize: '14@ratio',
      color: "#8A8CB2",
      fontFamily: "Gilroy-Bold",
      marginRight: '15@ratio',
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
    marginLeft: -30,
    marginTop: -37,
  },
  actions: {
    width: 131,
    height: 35,
    borderRadius: 5,
    backgroundColor: "#3C3F69",
    flexDirection: "row",
  },
  actionsbg: {
    position: "absolute",
    width: "50%",
    height: 31,
    borderRadius: 4,
    backgroundColor: "#141227",
    top: 2,
    left: 2,
  },
  action: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  actiontext: {
    fontFamily: "Gilroy-SemiBold",
    fontSize: 14,
    color: "#8A8CB2",
    textAlign: "center",
  },
  actionactive: {
    color: "#ffffff",
  },
  dailymissiontitle: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 8,
  },
  dailymissiontitleicon: {
    width: 32,
    height: 32,
    resizeMode: "contain",
  },
  dailymissiontitlet: {
    fontFamily: "Gilroy-Bold",
    fontSize: 16,
    color: "#ffffff",
  },
  missions: {
    flexDirection: "row",
    marginTop: 14,
  },
  missionscontainer: {
    paddingLeft: 8,
    paddingHorizontal: 16,
  },
  mission: {
    width: 163,
    height: 144,
    borderRadius: 16,
    marginRight: 18,
  },
  missionimg: {
    width: 163,
    height: 144,
    borderRadius: 16,
  },
  missionimgoverlay: {
    position: "absolute",
    width: 163,
    height: 144,
    borderRadius: 16,
    top: 0,
    right: 0,
  },
  missiondata: {
    flexDirection: "row",
    position: "absolute",
    bottom: 0,
    right: 0,
    width: "100%",
    paddingHorizontal: 10,
    paddingBottom: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  missiondataprogress: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },
  missiondataprogresssvg: {
    transform: [{ rotate: "-90deg" }],
  },
  missiondatainfo: {
    flex: 1,
  },
  missiontitle: {
    fontFamily: "Gilroy-Bold",
    fontSize: 16,
    color: "#ffffff",
    marginBottom: 3,
  },
  missioncategory: {
    fontFamily: "Gilroy-Medium",
    fontSize: 14,
    color: "#ffffff",
  },
  missiondataprogressdone: {
    width: 36,
    height: 36,
    borderRadius: Platform.OS == "ios" ? 18 : 36, //ios fix
    borderWidth: 3,
    borderColor: "#5652E5",
    alignItems: "center",
    justifyContent: "center",
  },
  missiondataprogressdoneicon: {
    width: 13,
    height: 6,
    resizeMode: "contain",
  },
  challenges: {
    paddingRight: 16,
    paddingLeft: 8,
    flex: 1,
  },
  challengetitle: {
    fontFamily: "Gilroy-Bold",
    fontSize: 16,
    color: "#ffffff",
    marginBottom: 20,
    paddingLeft: 8,
    marginTop: 32,
  },
  challengecard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  challengebullet: {
    width: 32,
    height: 32,
    marginTop: -15,
  },
  challengebulletline: {
    position: "absolute",
    width: 1,
    height: 81,
    left: 15,
    top: 32,
    zIndex: -1,
  },
  challengebox: {
    flex: 1,
    height: 65,
    borderRadius: 16,
    marginLeft: 5,
    marginBottom: 17,
  },
  challengeboxborder: {
    flex: 1,
    borderRadius: 16,
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
    padding: 1,
  },
  challengeboxinside: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
    backgroundColor: "#3C3F69",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  challengeiconbox: {
    width: 45,
    height: 45,
    borderRadius: 13,
    backgroundColor: "rgba(20,18,39,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  challengeicon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
  challengelabel: {
    fontSize: 14,
    color: "white",
    fontFamily: "Gilroy-Bold",
    flex: 1,
    paddingLeft: 9,
  },
  challengetimer: {
    flexDirection: "row",
    alignItems: "center",
  },
  challengetimericon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
    marginRight: 5,
  },
  challengetime: {
    fontSize: 14,
    color: "#8A8CB2",
    fontFamily: "Gilroy-Bold",
    marginRight: 15,
  },
});
