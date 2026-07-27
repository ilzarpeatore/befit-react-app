import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Platform,
  Animated,
  ScrollView,
  FlatList,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import MaskedView from "@react-native-masked-view/masked-view";
import {
  Svg,
  Rect,
  Defs,
  Stop,
  LinearGradient as SlinearGradient,
} from "react-native-svg";
import Linechart2 from "@components/Linechart2";
import Piechart from "@components/Piechart";
import { ProfilePropsInterface, StatisticblockPropsInterface, storiesDataInterface } from "./_types/Profile.i";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { stories as staticStories } from "static/Profile";
import { useAuth } from "@store/AuthContext";
import { postsApi } from "@api/posts";
/**
 * Statisticblock
 */
const Statisticblock = ({ children, styles }: StatisticblockPropsInterface) => {
  return (
    <View style={styles.statisticblock}>
      <LinearGradient
        start={{ x: 0.4, y: -0.1 }}
        end={{ x: 0.74, y: 1.42 }}
        colors={[
          "rgba(138,140,178,1)",
          "rgba(138,140,178,0)",
          "rgba(138,140,178,0)",
          "rgba(125,169,244,1)",
        ]}
        locations={[0, 0.348069, 0.596479, 1]}
        style={styles.statisticblockoutline}
      >
        <LinearGradient
          start={{ x: 0.41, y: -1.16 }}
          end={{ x: 1.57, y: 0.32 }}
          colors={["#8A8CB3", "#3C3F69"]}
          style={styles.statisticblockbg}
        />
      </LinearGradient>
      {children}
    </View>
  );
};
/**
 * Profile
 * figma page names : My Profile,Profile - Others,Profile - Others - Stories
 */
export default function Profile({ navigation }: ProfilePropsInterface) {
  const styles = useStyle();
  const { state } = useAuth();
  const [postsData, setPostsData] = useState<storiesDataInterface[]>(staticStories);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const piechartdata = [30, 80, 60];
  const linechartdata = [50, 35, 65, 50, 85];
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    postsApi.getList(1).then((res) => {
      const items = res.data?.data;
      if (items && items.length > 0) {
        const mapped: storiesDataInterface[] = items.slice(0, 5).map((p, i) => ({
          id: p.id,
          image: p.posting_media_array?.[0]?.media_url || require("@assets/profile/story.png"),
          likes: String(p.posting_like_count || 0),
          playable: false,
        }));
        setPostsData(mapped);
      }
    }).catch(() => {});
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await postsApi.getList(1);
      const items = res.data?.data;
      if (items && items.length > 0) {
        const mapped: storiesDataInterface[] = items.slice(0, 5).map((p, i) => ({
          id: p.id,
          image: p.posting_media_array?.[0]?.media_url || require("@assets/profile/story.png"),
          likes: String(p.posting_like_count || 0),
          playable: false,
        }));
        setPostsData(mapped);
      }
    } catch {}
    setRefreshing(false);
  };

  const _render_stories_items = (item: storiesDataInterface) => {
    /**
     * _render_stories_items
     * @param item story item
     * template :
     * - id : story id | type : integer
     * - image : story image | type : image
     * - likes: story likes | type : integer/string
     * - playable: story is video | type : bool | this will only show a play icon on top left of the story image nothing more
     */
    return (
      <View key={item.id} style={styles.story}>
        <Image source={item.image} style={styles.storyimg} />
        <View style={styles.storylikes}>
          <Image
            source={require("@assets/profile/heart.png")}
            style={styles.storylikesicon}
          />
          <Text style={styles.storylikesnum}>{item.likes}</Text>
        </View>
        {item.playable ? (
          <Image
            source={require("@assets/profile/video.png")}
            style={styles.storyplayableicon}
          />
        ) : null}
      </View>
    );
  }
  const _render_avatar_bg = () => {
    /**
     * _render_avatar_bg
     * render avatar svg background
     */
    return (
      <Svg
        width={styles.avatar.width}
        height={styles.avatar.width}
        viewBox="0 0 116 116"
        fill="none"
      >
        <Rect
          x="1"
          y="1"
          width="114"
          height="114"
          rx="57"
          stroke="url(#paint0_linear)"
          strokeWidth="2"
        />
        <Defs>
          <SlinearGradient
            id="paint0_linear"
            x1="28.9818"
            y1="0.999999"
            x2="70.4364"
            y2="118.109"
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0.0310714" stopColor="#5652E5" />
            <Stop offset="0.284608" stopColor="#B5BFFF" stopOpacity="0.47" />
            <Stop offset="0.533119" stopColor="#9557AD" />
            <Stop offset="1" stopColor="#F85365" />
          </SlinearGradient>
        </Defs>
      </Svg>
    );
  }
  const _onContentSizeChange = () => {
    /**
     * _onContentSizeChange
     * set profile scroll view default y position to 311 to hide the stories when first-time layout is loaded
     * */
    scrollViewRef.current?.scrollTo({ x: 0, y: 320, animated: false });
  }
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container2}>
        {/* story box end*/}
        <ScrollView
          ref={(scrollView) => { if (scrollView) scrollViewRef.current = scrollView; }}
          style={styles.container2}
          onContentSizeChange={() => {
            _onContentSizeChange();
          }}
          snapToOffsets={[0, 320]}
          snapToAlignment="center"
          decelerationRate={0}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FBFBFB" />
          }
        >
          {/* stories */}
          <FlatList
            style={styles.stories}
            contentContainerStyle={styles.storiescontentcontainer}
            data={postsData}
            renderItem={({ item }) => _render_stories_items(item)}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id.toString()}
          />
          {/* profile start */}
          <Animated.View
            style={[
              styles.container3,
              {
                borderTopRightRadius: 20,
                borderTopLeftRadius: 20,
              },
            ]}
          >
            {/* profile back button */}
            <TouchableOpacity
              style={styles.backbutton}
              onPress={() => navigation.goBack()}
            >
              <Image
                source={require("@assets/profile/arrowleft.png")}
                style={styles.backbuttonicon}
              />
            </TouchableOpacity>
            {/* profile settings button */}
            <TouchableOpacity
              style={styles.settingsbutton}
              onPress={() => navigation.navigate("Settings")}
            >
              <Image
                source={require("@assets/sidemenu/setting.png")}
                style={styles.settingsbuttonicon}
              />
            </TouchableOpacity>
            {/* profile header start */}
            <View style={styles.Profileheader}>
              {/* profile header cover */}
              <Image
                source={require("@assets/profile/cover.png")}
                style={styles.Profileheaderbg}
              />
              {/* profile header cover overlay*/}
              <LinearGradient
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                colors={["rgba(20,18,39,0)", "rgba(20,18,39,1)"]}
                style={styles.Profileheaderbgmask}
              />
              {/* profile header user avatar*/}
              <View style={styles.Profileheaderavatar}>
                {/* profile header user avatar svg bg*/}
                {_render_avatar_bg()}
                {/* profile header user avatar image*/}
                <Image
                  source={require("@assets/profile/avatar.png")}
                  style={styles.Profileheaderavatarimg}
                />
                {/* profile header user avatar change button*/}
                <TouchableOpacity style={styles.Profileheaderavatarchange} onPress={() => navigation.navigate("ProfileEdit")}>
                  <Image
                    source={require("@assets/profile/camera.png")}
                    style={styles.Profileheaderavatarchangeimg}
                  />
                </TouchableOpacity>
              </View>
              {/* profile header user fullname*/}
              <MaskedView
                style={styles.Profileusername}
                maskElement={
                  <View style={styles.masklabelview}>
                    <Text style={styles.masklabeltext}>{state.user?.display_name || "User"}</Text>
                  </View>
                }
              >
                <Image
                  source={require("@assets/profile/namemask.png")}
                  style={styles.masklabelimg}
                />
              </MaskedView>
              {/* profile header user data start*/}
              <View style={styles.Profiledata}>
                {/* profile header user data col*/}
                <View style={[styles.Profiledatacol, { borderLeftWidth: 0 }]}>
                  <Text style={styles.Profiledatatitle}>Followers</Text>
                  <View style={styles.Profiledatarow}>
                    <Text style={styles.Profiledatalabel}>2.7</Text>
                    <Text style={styles.Profiledataunit}>K</Text>
                  </View>
                </View>
                {/* profile header user data col*/}
                <View style={styles.Profiledatacol}>
                  <Text style={styles.Profiledatatitle}>Activitty</Text>
                  <View style={styles.Profiledatarow}>
                    <Text style={styles.Profiledatalabel}>45</Text>
                    <Text style={styles.Profiledataunit}>KM</Text>
                  </View>
                </View>
              </View>
              {/* profile header user data end*/}
              {/* profile header actions start*/}
              <View style={styles.Profileactions}>
                {/* profile header actions col*/}
                <View style={styles.Profileactioncol}>
                  {/* profile header actions follow button (blue)*/}
                  <TouchableOpacity
                    onPress={() => {
                      console.log("follow");
                    }}
                  >
                    <LinearGradient
                      start={{ x: 0.11, y: -0.21 }}
                      end={{ x: 0.16, y: 0.62 }}
                      colors={[
                        "rgba(255,255,255,0.13)",
                        "rgba(255,255,255,0.13)",
                      ]}
                      style={styles.Profileactionbtnoutline}
                    >
                      <LinearGradient
                        start={{ x: 0.24, y: -0.09 }}
                        end={{ x: 0.28, y: 1.05 }}
                        colors={["#7773FA", "#5652E5"]}
                        style={styles.Profileactionbtnbg}
                      >
                        {/* profile header actions button text*/}
                        <Text style={styles.Profileactionbtntext}>
                          Follow
                        </Text>
                      </LinearGradient>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
                {/* profile header actions col*/}
                <View style={styles.Profileactioncol}>
                  {/* profile header actions message button (gray)*/}
                  <TouchableOpacity>
                    <LinearGradient
                      start={{ x: 0.11, y: -0.21 }}
                      end={{ x: 0.16, y: 0.62 }}
                      colors={[
                        "rgba(255,255,255,0.13)",
                        "rgba(255,255,255,0.13)",
                      ]}
                      style={styles.Profileactionbtnoutline}
                    >
                      <LinearGradient
                        start={{ x: -0.28, y: -3.53 }}
                        end={{ x: -0.29, y: 0.98 }}
                        colors={["#FBFBFB", "#8A8CB3"]}
                        style={styles.Profileactionbtnbg}
                      >
                        {/* profile header actions button text*/}
                        <Text style={styles.Profileactionbtntext}>
                          Message
                        </Text>
                      </LinearGradient>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
              {/* profile header actions end*/}
            </View>
            {/* profile header end */}
            {/* profile statistics start */}
            <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate("ProfileStats")}>
            <View style={styles.statistics}>
              {/* profile statistics left col */}
              <View style={styles.statisticscol1}>
                {/* profile statistics block */}
                <Statisticblock styles={styles}>
                  {/* profile statistics Piechart */}
                  <Piechart
                    chartWidth={164}
                    chartHeight={164}
                    chartdata={piechartdata}
                    Animate={true}
                  />
                </Statisticblock>
                {/* profile statistics block */}
                <Statisticblock styles={styles}>
                  {/* profile statistics block title*/}
                  <View style={styles.statisticblocktitle}>
                    <Text style={styles.statisticblocktitletxt}>Running</Text>
                    <View style={styles.statisticblocktitlerw}>
                      <Text style={styles.statisticblocktitletxt2}>45</Text>
                      <Text style={styles.statisticblocktitleunit}>km</Text>
                    </View>
                  </View>
                  {/* profile statistics Linechart2 */}
                  <Linechart2
                    chartWidth={165}
                    chartHeight={164}
                    chartdata={linechartdata}
                    chartdatamaxvalue={100}
                    AnimateLine={true}
                    showGrid={true}
                  />
                </Statisticblock>
                {/* profile statistics block */}
                <Statisticblock styles={styles}>
                  <Image
                    source={require("@assets/profile/medal.png")}
                    style={styles.statisticblock3img}
                  />
                  <View style={styles.statisticblock3titlerw}>
                    <Image
                      source={require("@assets/profile/x.png")}
                      style={styles.statisticblock3x}
                    />
                    <Text style={styles.statisticblock3title}>3</Text>
                  </View>
                  <Text style={styles.statisticblock3label}>
                    Achievements
                  </Text>
                </Statisticblock>
              </View>
              {/* profile statistics left col end*/}
              {/* profile statistics right col */}
              <View style={styles.statisticscol2}>
                {/* profile statistics block */}
                <Statisticblock styles={styles}>
                  <Text style={styles.statisticblock2title}>Walking</Text>
                  <View style={styles.statisticblock2rw}>
                    <Text style={styles.statisticblock2label}>45</Text>
                    <Text style={styles.statisticblock2unit}>KM</Text>
                  </View>
                </Statisticblock>
                {/* profile statistics block */}
                <Statisticblock styles={styles}>
                  <Image
                    source={require("@assets/profile/trophy.png")}
                    style={styles.statisticblock3img2}
                  />
                  <View style={styles.statisticblock3titlerw}>
                    <Image
                      source={require("@assets/profile/x.png")}
                      style={styles.statisticblock3x}
                    />
                    <Text style={styles.statisticblock3title}>3</Text>
                  </View>
                  <Text style={styles.statisticblock3label}>
                    Achievements
                  </Text>
                </Statisticblock>
                {/* profile statistics block */}
                <Statisticblock styles={styles}>
                  <Text style={styles.statisticblock2title}>Running</Text>
                  <View style={styles.statisticblock2rw}>
                    <Text style={styles.statisticblock2label}>17</Text>
                    <Text style={styles.statisticblock2unit}>KM</Text>
                  </View>
                </Statisticblock>
              </View>
              {/* profile statistics right col end*/}
            </View>
            </TouchableOpacity>
            {/* profile statistics start */}
          </Animated.View>
          {/* profile end */}
        </ScrollView>
        <StatusBar style="light" />
      </View>
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
      backgroundColor: "#141227",
    },
    avatar: {
      width: '116@ratio'
    },
    container2: {
      flex: 1,
    },
    container3: {
      backgroundColor: "#141227",
      overflow: "hidden",
    },
    backbutton: {
      position: "absolute",
      top: '39@ratio',
      left: '16@ratio',
      width: '42@ratio',
      height: '42@ratio',
      borderRadius: Platform.OS == "ios" ? '21@ratio' : '42@ratio', //ios fix
      backgroundColor: "rgba(60,63,105,0.49)",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
    },
    backbuttonicon: {
      width: '7@ratio',
      height: '14@ratio',
      resizeMode: "contain",
    },
    settingsbutton: {
      position: "absolute",
      top: '39@ratio',
      right: '16@ratio',
      width: '42@ratio',
      height: '42@ratio',
      borderRadius: Platform.OS == "ios" ? '21@ratio' : '42@ratio',
      backgroundColor: "rgba(60,63,105,0.49)",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
    },
    settingsbuttonicon: {
      width: '20@ratio',
      height: '20@ratio',
      resizeMode: "contain",
    },
    Profileheader: {
      paddingTop: '83@ratio',
      alignItems: "center",
      zIndex: 3,
    },
    Profileheaderbg: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: '312@ratio',
      resizeMode: "cover",
      opacity: 0.2,
      zIndex: 1,
    },
    Profileheaderbgmask: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: '312@ratio',
      resizeMode: "cover",
      zIndex: 1,
    },
    Profileheaderavatar: {
      width: '114@ratio',
      height: '134@ratio',
      zIndex: 2,
    },
    Profileheaderavatarimg: {
      position: "absolute",
      width: '100@ratio',
      height: '100@ratio',
      borderRadius: Platform.OS == "ios" ? '50@ratio' : '100@ratio', //ios fix
      top: '7@ratio',
      left: '7@ratio',
    },
    Profileheaderavatarchange: {
      position: "absolute",
      bottom: 0,
      left: "50%",
      marginLeft: '-16@ratio',
      width: '32@ratio',
      height: '32@ratio',
      borderRadius: Platform.OS == "ios" ? '16@ratio' : '32@ratio', //ios fix
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#8A8CB2",
    },
    Profileheaderavatarchangeimg: {
      width: '20@ratio',
      height: '20@ratio',
      resizeMode: "contain",
    },
    Profileusername: {
      height: '39@ratio',
      width: "100%",
      zIndex: 2,
      marginTop: '22@ratio',
    },
    masklabelview: {
      backgroundColor: "transparent",
      height: '39@ratio',
      alignItems: "center",
    },
    masklabeltext: {
      fontSize: '32@ratio',
      color: "white",
      fontFamily: "Gilroy-Bold",
    },
    masklabelimg: {
      resizeMode: "cover",
      width: "100%",
      height: '215@ratio',
      marginTop: '-90@ratio',
    },
    Profiledata: {
      marginTop: '30@ratio',
      flexDirection: "row",
      zIndex: 2,
    },
    Profiledatacol: {
      flex: 1,
      alignItems: "center",
      borderLeftWidth: '1@ratio',
      borderLeftColor: "rgba(138,140,178,0.15)",
    },
    Profiledatatitle: {
      fontSize: '14@ratio',
      color: "#8A8CB2",
      fontFamily: "Gilroy-Medium",
    },
    Profiledatarow: {
      flexDirection: "row",
    },
    Profiledatalabel: {
      fontSize: '30@ratio',
      color: "white",
      fontFamily: "Gilroy-ExtraBold",
    },
    Profiledataunit: {
      fontSize: '12@ratio',
      color: "#8A8CB2",
      fontFamily: "Gilroy-ExtraBold",
      alignSelf: "flex-end",
      marginBottom: '5@ratio',
      marginLeft: '2@ratio',
    },
    Profileactions: {
      flexDirection: "row",
      marginVertical: '30@ratio',
    },
    Profileactioncol: {
      flex: 1,
      alignItems: "center",
    },
    Profileactionbtnoutline: {
      width: '140@ratio',
      height: '50@ratio',
      padding: '1@ratio',
      borderRadius: '12@ratio',
    },
    Profileactionbtnbg: {
      width: "100%",
      height: "100%",
      borderRadius: '12@ratio',
      alignItems: "center",
      justifyContent: "center",
    },
    Profileactionbtntext: {
      fontSize: '18@ratio',
      color: "white",
      fontFamily: "Gilroy-Bold",
    },
    statistics: {
      flexDirection: "row",
      paddingHorizontal: '16@ratio',
    },
    statisticscol1: {
      flex: 1,
      flexDirection: "column",
      paddingRight: '7@ratio',
    },
    statisticscol2: {
      flex: 1,
      flexDirection: "column",
      paddingLeft: '7@ratio',
    },
    statisticblock: {
      marginBottom: '13@ratio',
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    statisticblock2title: {
      fontSize: '14@ratio',
      color: "#8A8CB2",
      fontFamily: "Gilroy-Medium",
      marginTop: '20@ratio',
    },
    statisticblock2rw: {
      flexDirection: "row",
      marginBottom: '20@ratio',
    },
    statisticblock2label: {
      fontSize: '30@ratio',
      color: "white",
      fontFamily: "Gilroy-ExtraBold",
    },
    statisticblock2unit: {
      fontSize: '12@ratio',
      color: "#8A8CB2",
      fontFamily: "Gilroy-ExtraBold",
      alignSelf: "flex-end",
      marginBottom: '5@ratio',
      marginLeft: '2@ratio',
    },
    statisticblockoutline: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      opacity: 0.4,
      borderRadius: '16@ratio',
      padding: '1@ratio',
    },
    statisticblockbg: {
      width: "100%",
      height: "100%",
      borderRadius: '16@ratio',
      backgroundColor: "#141227",
    },
    statisticblocktitle: {
      flexDirection: "row",
      paddingHorizontal: '16@ratio',
      marginTop: '11@ratio',
      alignItems: "center",
    },
    statisticblocktitletxt: {
      fontSize: '16@ratio',
      color: "white",
      fontFamily: "Gilroy-Bold",
      flex: 1,
    },
    statisticblocktitlerw: {
      flexDirection: "row",
    },
    statisticblocktitletxt2: {
      fontSize: '18@ratio',
      color: "white",
      fontFamily: "Gilroy-ExtraBold",
    },
    statisticblocktitleunit: {
      fontSize: '14@ratio',
      color: "#8A8CB3",
      fontFamily: "Gilroy-ExtraBold",
      alignSelf: "flex-end",
      marginLeft: '2@ratio',
    },
    statisticblock3titlerw: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: '100@ratio',
    },
    statisticblock3title: {
      fontSize: '32@ratio',
      color: "#ffffff",
      fontFamily: "Gilroy-Bold",
    },
    statisticblock3x: {
      width: '12@ratio',
      height: '12@ratio',
      marginRight: '6@ratio',
    },
    statisticblock3label: {
      fontSize: '16@ratio',
      color: "#8A8CB2",
      fontFamily: "Gilroy-SemiBold",
      marginBottom: '19@ratio',
    },
    statisticblock3img: {
      position: "absolute",
      width: '280@ratio',
      height: '280@ratio',
      resizeMode: "contain",
    },
    statisticblock3img2: {
      position: "absolute",
      width: '240@ratio',
      height: '200@ratio',
      resizeMode: "cover",
      top: '-35@ratio',
    },
    storybox: {
      position: "absolute",
      top: 0,
      left: 0,
      zIndex: 0,
    },
    storyboxholder: {
      height: '311@ratio',
    },
    stories: {
      flexDirection: "row",
      paddingTop: '52@ratio',
      paddingBottom: '31@ratio',
    },
    storiescontentcontainer: {
      paddingHorizontal: '16@ratio',
    },
    story: {
      marginRight: '10@ratio',
    },
    storyimg: {
      width: '127@ratio',
      height: '227@ratio',
      borderRadius: '8@ratio',
    },
    storylikes: {
      flexDirection: "row",
      opacity: 0.7,
      alignItems: "center",
      position: "absolute",
      bottom: '14@ratio',
      alignSelf: "center",
    },
    storylikesicon: {
      width: '28@ratio',
      height: '28@ratio',
    },
    storylikesnum: {
      fontSize: '14@ratio',
      color: "#FBFBFB",
      fontFamily: "Gilroy-Bold",
      marginLeft: '8@ratio',
    },
    storyplayableicon: {
      position: "absolute",
      top: '16@ratio',
      left: '12@ratio',
      width: '10@ratio',
      height: '10@ratio',
      resizeMode: "contain",
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
    backgroundColor: "#141227",
  },
  container2: {
    flex: 1,
  },
  container3: {
    backgroundColor: "#141227",
    overflow: "hidden",
  },
  backbutton: {
    position: "absolute",
    top: 39,
    left: 16,
    width: 42,
    height: 42,
    borderRadius: Platform.OS == "ios" ? 21 : 42, //ios fix
    backgroundColor: "rgba(60,63,105,0.49)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  backbuttonicon: {
    width: 7,
    height: 14,
    resizeMode: "contain",
  },
  settingsbutton: {
    position: "absolute",
    top: 39,
    right: 16,
    width: 42,
    height: 42,
    borderRadius: Platform.OS == "ios" ? 21 : 42,
    backgroundColor: "rgba(60,63,105,0.49)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  settingsbuttonicon: {
    width: 20,
    height: 20,
    resizeMode: "contain",
  },
  Profileheader: {
    paddingTop: 83,
    alignItems: "center",
    zIndex: 3,
  },
  Profileheaderbg: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: 312,
    resizeMode: "cover",
    opacity: 0.2,
    zIndex: 1,
  },
  Profileheaderbgmask: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: 312,
    resizeMode: "cover",
    zIndex: 1,
  },
  Profileheaderavatar: {
    width: 114,
    height: 134,
    zIndex: 2,
  },
  Profileheaderavatarimg: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: Platform.OS == "ios" ? 50 : 100, //ios fix
    top: 7,
    left: 7,
  },
  Profileheaderavatarchange: {
    position: "absolute",
    bottom: 0,
    left: "50%",
    marginLeft: -16,
    width: 32,
    height: 32,
    borderRadius: Platform.OS == "ios" ? 16 : 32, //ios fix
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8A8CB2",
  },
  Profileheaderavatarchangeimg: {
    width: 20,
    height: 20,
    resizeMode: "contain",
  },
  Profileusername: {
    height: 39,
    width: "100%",
    zIndex: 2,
    marginTop: 22,
  },
  masklabelview: {
    backgroundColor: "transparent",
    height: 39,
    alignItems: "center",
  },
  masklabeltext: {
    fontSize: 32,
    color: "white",
    fontFamily: "Gilroy-Bold",
  },
  masklabelimg: {
    resizeMode: "cover",
    width: "100%",
    height: 215,
    marginTop: -90,
  },
  Profiledata: {
    marginTop: 30,
    flexDirection: "row",
    zIndex: 2,
  },
  Profiledatacol: {
    flex: 1,
    alignItems: "center",
    borderLeftWidth: 1,
    borderLeftColor: "rgba(138,140,178,0.15)",
  },
  Profiledatatitle: {
    fontSize: 14,
    color: "#8A8CB2",
    fontFamily: "Gilroy-Medium",
  },
  Profiledatarow: {
    flexDirection: "row",
  },
  Profiledatalabel: {
    fontSize: 30,
    color: "white",
    fontFamily: "Gilroy-ExtraBold",
  },
  Profiledataunit: {
    fontSize: 12,
    color: "#8A8CB2",
    fontFamily: "Gilroy-ExtraBold",
    alignSelf: "flex-end",
    marginBottom: 5,
    marginLeft: 2,
  },
  Profileactions: {
    flexDirection: "row",
    marginVertical: 30,
  },
  Profileactioncol: {
    flex: 1,
    alignItems: "center",
  },
  Profileactionbtnoutline: {
    width: 140,
    height: 50,
    padding: 1,
    borderRadius: 12,
  },
  Profileactionbtnbg: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  Profileactionbtntext: {
    fontSize: 18,
    color: "white",
    fontFamily: "Gilroy-Bold",
  },
  statistics: {
    flexDirection: "row",
    paddingHorizontal: 16,
  },
  statisticscol1: {
    flex: 1,
    flexDirection: "column",
    paddingRight: 7,
  },
  statisticscol2: {
    flex: 1,
    flexDirection: "column",
    paddingLeft: 7,
  },
  statisticblock: {
    marginBottom: 13,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  statisticblock2title: {
    fontSize: 14,
    color: "#8A8CB2",
    fontFamily: "Gilroy-Medium",
    marginTop: 20,
  },
  statisticblock2rw: {
    flexDirection: "row",
    marginBottom: 20,
  },
  statisticblock2label: {
    fontSize: 30,
    color: "white",
    fontFamily: "Gilroy-ExtraBold",
  },
  statisticblock2unit: {
    fontSize: 12,
    color: "#8A8CB2",
    fontFamily: "Gilroy-ExtraBold",
    alignSelf: "flex-end",
    marginBottom: 5,
    marginLeft: 2,
  },
  statisticblockoutline: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    opacity: 0.4,
    borderRadius: 16,
    padding: 1,
  },
  statisticblockbg: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
    backgroundColor: "#141227",
  },
  statisticblocktitle: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: 11,
    alignItems: "center",
  },
  statisticblocktitletxt: {
    fontSize: 16,
    color: "white",
    fontFamily: "Gilroy-Bold",
    flex: 1,
  },
  statisticblocktitlerw: {
    flexDirection: "row",
  },
  statisticblocktitletxt2: {
    fontSize: 18,
    color: "white",
    fontFamily: "Gilroy-ExtraBold",
  },
  statisticblocktitleunit: {
    fontSize: 14,
    color: "#8A8CB3",
    fontFamily: "Gilroy-ExtraBold",
    alignSelf: "flex-end",
    marginLeft: 2,
  },
  statisticblock3titlerw: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 100,
  },
  statisticblock3title: {
    fontSize: 32,
    color: "#ffffff",
    fontFamily: "Gilroy-Bold",
  },
  statisticblock3x: {
    width: 12,
    height: 12,
    marginRight: 6,
  },
  statisticblock3label: {
    fontSize: 16,
    color: "#8A8CB2",
    fontFamily: "Gilroy-SemiBold",
    marginBottom: 19,
  },
  statisticblock3img: {
    position: "absolute",
    width: 280,
    height: 280,
    resizeMode: "contain",
  },
  statisticblock3img2: {
    position: "absolute",
    width: 240,
    height: 200,
    resizeMode: "cover",
    top: -35,
  },
  storybox: {
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 0,
  },
  storyboxholder: {
    height: 311,
  },
  stories: {
    flexDirection: "row",
    paddingTop: 52,
    paddingBottom: 31,
  },
  storiescontentcontainer: {
    paddingHorizontal: 16,
  },
  story: {
    marginRight: 10,
  },
  storyimg: {
    width: 127,
    height: 227,
    borderRadius: 8,
  },
  storylikes: {
    flexDirection: "row",
    opacity: 0.7,
    alignItems: "center",
    position: "absolute",
    bottom: 14,
    alignSelf: "center",
  },
  storylikesicon: {
    width: 28,
    height: 28,
  },
  storylikesnum: {
    fontSize: 14,
    color: "#FBFBFB",
    fontFamily: "Gilroy-Bold",
    marginLeft: 8,
  },
  storyplayableicon: {
    position: "absolute",
    top: 16,
    left: 12,
    width: 10,
    height: 10,
    resizeMode: "contain",
  },
});
