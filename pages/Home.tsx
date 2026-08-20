import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  ScrollView,

  Text,
  View,
  Pressable,
  Animated,
  ImageBackground,
  Platform,
  Dimensions,
  BackHandler,
  LayoutChangeEvent,
  RefreshControl,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import ToggleSwitch from "toggle-switch-react-native";
import Navigation from "@components/Navigation";
import { ActivityboxPropsInterface, HomePropsInterface, MenuItemInterface, SliderItemInterface, SliderTabItemInterface } from "./_types/Home.i";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { sidemenuData, sliderTabItemsData } from "static/Home";
import { useAuth } from "@store/AuthContext";
import { dashboardApi, DashboardData } from "@api/dashboard";
/* create ImageBackground AnimatedComponent for side menu animation */
const AnimatedImageBackground = Animated.createAnimatedComponent(
  ImageBackground
);
const window = Dimensions.get("window");
/**
 * Activitybox
 */
const Activitybox = ({
  cover,
  bg,
  icon,
  title,
  coverstyle,
  iconwidth,
  datatype,
  datacurrent,
  datatotal,
  datalabel,
  datacurrentdec,
  dataunit,
  onPress,
  styles
}: ActivityboxPropsInterface) => {
  return (
    <Pressable
      style={({ pressed }) => [styles.activityboxborder, pressed && { opacity: 0.2 }]}
      onPress={onPress}
    >
      <LinearGradient
        start={{ x: 0.11, y: -0.21 }}
        end={{ x: 0.71, y: 0.38 }}
        colors={["rgba(255,255,255,0.4)", "rgba(255,255,255,0)"]}
        style={styles.activityboxborder}
      >
        <LinearGradient
          start={{ x: 0.24, y: -0.09 }}
          end={{ x: 0.78, y: 0.93 }}
          colors={["#5A5D87", "#3C3F69"]}
          style={styles.activitybox}
        >
          <Image source={cover} style={[styles.activityboxcover, coverstyle]} />
          <Image source={bg} contentFit="cover" style={styles.activityboxbg} />
          <LinearGradient
            start={{ x: 0.24, y: -0.09 }}
            end={{ x: 0.78, y: 0.93 }}
            colors={["rgba(90,93,135,0)", "#3C3F69"]}
            style={styles.activityboxoverlay}
          ></LinearGradient>
          <View style={styles.activityiconbox}>
            <Image
              source={icon}
              contentFit="contain"
              style={[styles.activityicon, { width: iconwidth }]}
            />
          </View>
          <View style={styles.activitydata}>
            {datatype == 1 ? (
              <View style={styles.activitydata}>
                <Text style={styles.activitydatalabel}>{datacurrent}</Text>
                <Text style={styles.activitydatalabel}>/</Text>
                <View style={styles.activitydatalabels}>
                  <Text style={styles.activitydatalabels1}>{datatotal}</Text>
                  <Text style={styles.activitydatalabels2}>{datalabel}</Text>
                </View>
              </View>
            ) : (
              <View style={styles.activitydata}>
                <Text style={styles.activitydatalabel}>{datacurrent}</Text>
                <Text style={styles.activitydatalabel2}>.{datacurrentdec}</Text>
                <View style={styles.activitydatalabels}>
                  <Text style={styles.activitydatalabels1}></Text>
                  <Text style={styles.activitydatalabels3}>{dataunit}</Text>
                </View>
              </View>
            )}
          </View>
          <LinearGradient
            start={{ x: 0.24, y: -0.09 }}
            end={{ x: 0.31, y: 1.04 }}
            colors={["#D0D2E8", "#ffffff"]}
            style={styles.activityboxtitle}
          >
            <Text style={styles.activityboxtitlel}>{title}</Text>
          </LinearGradient>
        </LinearGradient>
      </LinearGradient>
    </Pressable>
  );
};
/**
 * Home
 * figma page names : Home,Side Menu
 */
export default function Home({ navigation }: HomePropsInterface) {
  const styles = useStyle();
  const { state, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [slider_tabs_active, setSliderTabsActive] = useState<number>(0);
  const [side_menu_open, setSideMenuOpen] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [slider_tab_underline_AnimX] = useState(() => new Animated.Value(0)); // slider tab underline animation
  const [side_menu_Anim] = useState(() => new Animated.Value(0)); // side menu animation
  const _imageslider = useRef<FlatList<any>>(null)
  const [slider_tab_items, setSliderTabItems] = useState(sliderTabItemsData);
  const [sidemenu, setSidemenu] = useState(sidemenuData);
  const [slider_items, setSliderItems] = useState<SliderItemInterface[]>([]);

  useEffect(() => {
    dashboardApi.getDashboard().then((res) => {
      setDashboardData(res.data?.data ?? null);
    }).catch(() => {});
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await dashboardApi.getDashboard();
      setDashboardData(res.data?.data ?? null);
    } catch {}
    setRefreshing(false);
  };

  const extendedSidemenu = [
    ...sidemenu,
    { id: 6, title: "Community", icon: require("@assets/sidemenu/myfav.png"), switch: false, switchstate: false },
    { id: 7, title: "Logout", icon: require("@assets/sidemenu/setting.png"), switch: false, switchstate: false },
  ];
  useEffect(() => {
    const handleBackButtonClick = () => {
      /* close side menu if it's open after back press*/
      if (side_menu_open) {
        setSideMenuOpen(false);
        Animated.timing(side_menu_Anim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start();
        return true;
      }
    }
    const subscribe = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackButtonClick
    );
    return subscribe.remove();
  }, [side_menu_open, side_menu_Anim])

  const slider_tab_item_press = useCallback((item: SliderTabItemInterface) => {
    if (slider_items.length === 0) return;
    _imageslider.current?.scrollToIndex({ index: item.sliderkey }); // scroll slider to ne item index*/
  }, [slider_items.length]);
  const slider_viewable_items_changed = ({ viewableItems }: { viewableItems: any[] }) => {
    if (!viewableItems || viewableItems.length === 0) return;
    let item = viewableItems[0].item;
    let spacing = item.key * styles.tab.marginRight, // find spacing of the items before active menu item
      width = 0;
    slider_tab_items.slice(0, item.key).map((item: SliderTabItemInterface, index: number) => {
      width += item.width; // find total width of the items before active menu item
    });
    // basicly find x location of the active menu base of the width of the tab items before + their spacing(margin) and animate indicator to location
    Animated.timing(slider_tab_underline_AnimX, {
      toValue: width + spacing, // width of the tab items before + their spacing(margin)
      duration: 500,
      useNativeDriver: true,
    }).start();
    setSliderTabsActive(item.key);// set active slider tab
  };
  const set_slider_tabs_width = useCallback((event: LayoutChangeEvent, item: SliderTabItemInterface) => {
    //find slider tab item width and save it for later animation
    let { width } = event.nativeEvent.layout;
    setSliderTabItems((prev) => {
      const copy = [...prev];
      if (item.key >= 0 && item.key < copy.length) {
        copy[item.key] = { ...copy[item.key], width };
      }
      return copy;
    });
  }, []);
  const toggle_sidemenu = () => {
    /**
     * toggle_sidemenu
     * toggle open side menu
     */
    if (side_menu_open) {
      setSideMenuOpen(false);
      Animated.timing(side_menu_Anim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else {
      setSideMenuOpen(true);
      Animated.timing(side_menu_Anim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }
  const toggle_sidemenu_switchstate = useCallback((item: MenuItemInterface) => {
    /**
     * toggle_sidemenu_switchstate
     * toggle sidemenu switchstate on_toggle
     */
    let sidemenutmp = [...sidemenu];
    sidemenutmp[item.id - 1].switchstate = !sidemenutmp[item.id - 1].switchstate;
    setSidemenu(sidemenutmp);
  }, [sidemenu]);
  const _render_slider_items = useCallback((item: SliderItemInterface) => {
    /**
     * _render_side_menu_item
     */
    return (
      <Pressable
        style={({ pressed }) => pressed && { opacity: 0.9 }}
        onPress={() => navigation.navigate("WorkoutList")}
      >
      <LinearGradient
        start={{ x: 0.35, y: -0.09 }}
        end={{ x: 0.65, y: 1.05 }}
        colors={["#FFA296", "#FD715F"]}
        style={styles.slidercard}
      >
        {/* slider image */}
        <Image source={item.image} contentFit="cover" style={styles.slidercardimage} />
        {/* slider overlay mask */}
        <Image source={item.mask} contentFit="cover" style={styles.slidercardmask} />
        {/* slider card cover ( those patterns on the image ) */}
        <Image
          source={require("@assets/cardcover.png")}
          contentFit="cover"
          style={[
            styles.slidercardcover,
            item.coverleft ? styles.slidercardcoverleft : {}, // card cover position (left or right)  flip the image
          ]}
        />
        {/* slider text */}
        <View style={styles.slidercardlabel}>
          <Text style={styles.slidercardlabel1}>{item.lableline1}</Text>
          <Text style={styles.slidercardlabel2}>{item.lableline2}</Text>
        </View>
      </LinearGradient>
      </Pressable>
    );
  }, [navigation]);
  const _render_side_menu_item = useCallback((item: MenuItemInterface) => {
    /**
     * _render_side_menu_item
     * @param item menu item
     */
    return (
      <Pressable
        style={({ pressed }) => [styles.sidemenulistitem, pressed && { opacity: 0.2 }]}
        key={item.id}
        onPress={() => {
          if (item.id == 1) navigation.navigate("Profile");
          else if (item.id == 2) navigation.navigate("FavouriteWorkouts");
          else if (item.id == 3) navigation.navigate("Settings");
          else if (item.id == 6) navigation.navigate("CommunityFeed");
          else if (item.id == 7) {
            Alert.alert("Logout", "Are you sure you want to logout?", [
              { text: "Cancel", style: "cancel" },
              { text: "Logout", style: "destructive", onPress: () => logout() },
            ]);
          }
        }}
      >
        {/* menu icon */}
        <Image source={item.icon} contentFit="contain" style={styles.sidemenulisticon} />
        {/* menu text */}
        <Text style={styles.sidemenulisttext}>{item.title}</Text>
        {/* menu switch */}
        {item.switch ? (
          <ToggleSwitch
            isOn={item.switchstate}
            onColor="#505EDC"
            offColor="#8A8CB2"
            size="medium"
            onToggle={() => {
              toggle_sidemenu_switchstate(item);
            }}
            thumbOnStyle={styles.sidemenuthumbon}
            thumbOffStyle={styles.sidemenuthumboff}
            trackOnStyle={styles.sidemenutrackon}
            trackOffStyle={styles.sidemenutrackoff}
          />
        ) : null}
      </Pressable>
    );
  }, [navigation, logout, toggle_sidemenu_switchstate]);
  const _render_side_menu = () => {
    /**
     * side menu
     */
    return (
      <View style={styles.sidemenu}>
        <View style={styles.sidemenuhead}>
          {/* user avatar */}
          <Image
            source={require("@assets/sidemenu/profileimg.png")}
            style={styles.sidemenuavatar}
          />
          {/* hello icon and text */}
          <View style={styles.sidemenuhello}>
            <MaskedView
              style={styles.sidemenuhelloview}
              maskElement={
                <View style={styles.sidemenuhellomaskview}>
                  <Text style={styles.sidemenuhellomasktext}>Hello</Text>
                </View>
              }
            >
              <LinearGradient
                start={{ x: 0.5, y: -0.3 }}
                end={{ x: 0.5, y: 1.27 }}
                colors={["#ffffff", "#8A8CB3"]}
                style={styles.sidemenuhellomaskbg}
              ></LinearGradient>
            </MaskedView>
            <Image
              source={require("@assets/sidemenu/hi.png")}
              style={styles.sidemenuhelloicon}
            />
          </View>
          {/* user name */}
          <MaskedView
            style={styles.sidemenuusernameview}
            maskElement={
              <View style={styles.sidemenuusernamemaskview}>
                <Text style={styles.sidemenuusernamemasktext}>{state.user?.display_name || "User"}</Text>
              </View>
            }
          >
            <LinearGradient
              start={{ x: 0.5, y: -0.3 }}
              end={{ x: 0.5, y: 1.27 }}
              colors={["#ffffff", "#8A8CB3"]}
              style={styles.sidemenuusernamemaskbg}
            ></LinearGradient>
          </MaskedView>
          {/**
           * menu
           * for render item refer to "_render_side_menu_item" function
           */}
          <FlatList
            style={[
              styles.sidemenulist,
              { height: window.height * 0.75 - 300 },
            ]}
            data={extendedSidemenu}
            showsVerticalScrollIndicator={false}
            renderItem={renderSideMenuItem}
            keyExtractor={(item) => item.id.toString()}
          />
        </View>
      </View>
    );
  }
  const _render_slider_tab_item = useCallback((item: SliderTabItemInterface) => {
    /**
     * _render_slider_tab_item
     */
    return (
      <Pressable
        onLayout={(event) => {
          set_slider_tabs_width(event, item); // set item width for animation
        }}
        onPress={() => {
          slider_tab_item_press(item);
        }}
        style={({ pressed }) => [styles.tab, pressed && { opacity: 0.2 }]}
      >
        <Text
          style={[
            styles.tabtxt,
            slider_tabs_active == item.key
              ? styles.tabtxtactive
              : {}, //if it is the active tab change it color to white
          ]}
        >
          {item.value}
        </Text>
      </Pressable>
    );
  }, [slider_tabs_active, set_slider_tabs_width, slider_tab_item_press]);

  const renderSideMenuItem = useCallback(
    ({ item }: { item: MenuItemInterface }) => _render_side_menu_item(item),
    [_render_side_menu_item]
  );
  const renderSliderTabItem = useCallback(
    ({ item }: { item: SliderTabItemInterface }) => _render_slider_tab_item(item),
    [_render_slider_tab_item]
  );
  const renderSliderItem = useCallback(
    ({ item }: { item: SliderItemInterface }) => _render_slider_items(item),
    [_render_slider_items]
  );

  return (
    <ImageBackground source={require("@assets/bg.png")} style={styles.bg}>
      {/* home page background shadow */}
      <Animated.View
        style={[
          styles.sidebarbgshadow,
          {
            transform: [
              {
                scale: side_menu_Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0.85], //scale down home page background shadow
                }),
              },
              {
                translateY: side_menu_Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, window.height * 0.75 - 10], //move down home page background shadow to 7.5 - 10px of the window height
                }),
              },
            ],
          },
        ]}
      />
      {_render_side_menu()}
      <Pressable
        disabled={!side_menu_open}
        onPress={() => {
          toggle_sidemenu();
        }}
        style={{
          transform: [
            {
              scale: side_menu_Anim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0.9], // scale down home page
              }),
            },
            {
              translateY: side_menu_Anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, window.height * 0.75], //move down home page to 7.5 of the window height
              }),
            },
          ],
        }}
      >
        <AnimatedImageBackground
          source={require("@assets/bg.png")}
          style={[
            styles.bg,
            {
              borderRadius: side_menu_Anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 23], // animate border radius
              }),
              overflow: "hidden",
            },
          ]}
        >
          <SafeAreaView style={styles.container} edges={['right', 'left', 'top']}>
            <View style={styles.container2}>
              {/*toolbar start*/}
              <View style={styles.topbar}>
                <Pressable
                  onPress={() => {
                    toggle_sidemenu();
                  }}
                  style={({ pressed }) => [styles.menu, pressed && { opacity: 0.2 }]}
                >
                  <Image
                    source={require("@assets/menu.png")}
                    contentFit="contain"
                    style={styles.menuicon}
                  />
                </Pressable>
                <View style={styles.logo}>
                  <Image
                    source={require("@assets/logo.png")}
                    style={styles.logoicon}
                  />
                </View>
                <Pressable
                  onPress={() => {
                    navigation.navigate("Profile"); //navigate to profile page
                  }}
                  style={({ pressed }) => pressed && { opacity: 0.2 }}
                >
                  <Image
                    source={require("@assets/profile.png")}
                    style={styles.profileicon}
                  />
                </Pressable>
              </View>
              {/*toolbar end*/}
              {/*scrollview start*/}
              <ScrollView
                style={styles.containerscroll}
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FBFBFB" />
                }
              >
                <View style={styles.containerscrollbox}>
                  {/*title start*/}
                  <View style={styles.title}>
                    <Text style={styles.label}>Let's Have</Text>
                    <MaskedView
                      maskElement={
                        <View style={styles.masklabel}>
                          <Text style={styles.masklabeltext}>
                            Some Activity!
                          </Text>
                        </View>
                      }
                    >
                      <Image
                        source={require("@assets/hometitlemask.png")}
                        style={styles.masklabelimg}
                      />
                    </MaskedView>
                  </View>
                  {/*title end*/}
                  {/*activities start*/}
                  <View style={styles.activities}>
                    {/*activities walking start*/}
                    <Activitybox
                      cover={require("@assets/icons/walk_cover.png")}
                      bg={require("@assets/walking_bg.png")}
                      icon={require("@assets/icons/walk.png")}
                      title="Walking"
                      iconwidth={64}
                      datatype={1}
                      datacurrent={dashboardData?.steps?.total || 0}
                      datatotal={dashboardData?.steps?.goal || 8000}
                      datalabel="STEPS"
                      onPress={() => {
                        navigation.navigate("ExerciseList");
                      }}
                      styles={styles}
                    />
                    {/*activities walking end*/}
                    {/*activities running start*/}
                    <Activitybox
                      cover={require("@assets/icons/running_cover.png")}
                      bg={require("@assets/running_bg.png")}
                      icon={require("@assets/icons/running.png")}
                      title="Running"
                      coverstyle={{ bottom: 24, left: 12, opacity: 0.05 }}
                      iconwidth={48}
                      datatype={2}
                      datacurrent={dashboardData?.workout?.totalCalories || 0}
                      datacurrentdec={0}
                      dataunit="KCAL"
                      onPress={() => {
                        navigation.navigate("WorkoutList");
                      }}
                      styles={styles}
                    />
                    {/*activities running end*/}
                    {/*activities cycling start*/}
                    <Activitybox
                      cover={require("@assets/icons/bike-bicycle_cover.png")}
                      bg={require("@assets/cycling_bg.png")}
                      icon={require("@assets/icons/bike-bicycle.png")}
                      title="Cycling"
                      coverstyle={{ opacity: 0.05 }}
                      iconwidth={64}
                      datatype={2}
                      datacurrent={dashboardData?.workout?.totalDuration || 0}
                      datacurrentdec={0}
                      dataunit="MIN"
                      onPress={() => {
                        navigation.navigate("Clubnav", {
                          screen: "Cycling",
                        });
                      }}
                      styles={styles}
                    />
                    {/*activities cycling end*/}
                  </View>
                  {/*activities end*/}
                  {/*quick links start*/}
                  <View style={styles.quickLinksRow}>
                    <Pressable
                      style={({ pressed }) => [styles.quickLinkCard, pressed && { opacity: 0.85 }]}
                      onPress={() =>
                        navigation.navigate("Migrated", { screen: "MigratedMyProgramCalendar" })
                      }
                    >
                      <LinearGradient
                        start={{ x: 0.24, y: -0.09 }}
                        end={{ x: 0.78, y: 0.93 }}
                        colors={["#5A5D87", "#3C3F69"]}
                        style={styles.quickLinkGradient}
                      >
                        <Text style={styles.quickLinkTitle}>Mi Programa</Text>
                        <Text style={styles.quickLinkSubtitle}>Ver calendario asignado</Text>
                      </LinearGradient>
                    </Pressable>
                    <Pressable
                      style={({ pressed }) => [styles.quickLinkCard, pressed && { opacity: 0.85 }]}
                      onPress={() =>
                        navigation.navigate("Migrated", { screen: "MigratedViewAllBlog" })
                      }
                    >
                      <LinearGradient
                        start={{ x: 0.35, y: -0.09 }}
                        end={{ x: 0.65, y: 1.05 }}
                        colors={["#FFA296", "#FD715F"]}
                        style={styles.quickLinkGradient}
                      >
                        <Text style={styles.quickLinkTitle}>Blog</Text>
                        <Text style={styles.quickLinkSubtitle}>Consejos y artículos</Text>
                      </LinearGradient>
                    </Pressable>
                  </View>
                  {/*quick links end*/}
                  {/*slider start*/}
                  <View>
                    {/*slider tabs start*/}
                    <FlatList
                      style={styles.tabs}
                      data={slider_tab_items}
                      horizontal={true}
                      keyExtractor={(item) => item.key.toString()}
                      renderItem={renderSliderTabItem}
                    />
                    {/*slider tabs end*/}
                    {/*slider tabsunderline animation start*/}
                    <View>
                      <Animated.View
                        style={[
                          styles.tabunderline,
                          {
                            transform: [
                              {
                                translateX: slider_tab_underline_AnimX,
                              },
                            ],
                          },
                        ]}
                      ></Animated.View>
                    </View>
                    {/*slider tabsunderline animation end*/}
                    {/*slider images start*/}
                    <FlatList
                      ref={_imageslider}
                      style={styles.sliderbox}
                      data={slider_items}
                      snapToAlignment={"center"}
                      snapToInterval={
                        styles.slidercard.width +
                        styles.slidercard.marginLeft +
                        styles.slidercard.marginRight
                      } // Adjust to your content width
                      decelerationRate={"fast"}
                      pagingEnabled
                      horizontal={true}
                      keyExtractor={(item) => item.key.toString()}
                      renderItem={renderSliderItem}
                      onViewableItemsChanged={
                        slider_viewable_items_changed
                      }
                      viewabilityConfig={{
                        itemVisiblePercentThreshold: 50,
                      }}
                    />
                    {/*slider images end*/}
                  </View>
                </View>
              </ScrollView>
              {/*scrollview end*/}
            </View>
            {/*navigation start (remove comment when you don't want to use react native navigation bottom tab)*/}
            <Navigation activepageindex={0} />
            {/* fix navigation safe area background fix */}
            <View style={styles.navigationbgfix} />
            {/*navigation end*/}

            <Pressable
              onPress={() => navigation.navigate("ScreenExplorer")}
              style={({ pressed }) => [
                { position: 'absolute', bottom: 80, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#7773FA', alignItems: 'center', justifyContent: 'center', boxShadow: '0px 4px 8px rgba(119, 115, 250, 0.3)', zIndex: 999 },
                pressed && { opacity: 0.2 },
              ]}
            >
              <Text style={{ fontSize: 28, color: '#fff', marginTop: -2 }}>+</Text>
            </Pressable>

          </SafeAreaView>
          <StatusBar style="dark" />
        </AnimatedImageBackground>
      </Pressable>
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
      paddingTop: '44@ratio',
    },
    containerscroll: {
      flex: 1,
      marginTop: '10@ratio',
    },
    containerscrollbox: {
      paddingHorizontal: '16@ratio',
    },
    navigationbgfix: {
      backgroundColor: "#1A1735",
      position: "absolute",
      width: "100%",
      height: '100@ratio',
      bottom: 0,
      zIndex: -1,
    },
    bg: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
      backgroundColor: "#1A1735",
    },
    topbar: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: '16@ratio',
    },
    menu: {
      height: '38@ratio',
      justifyContent: "center",
    },
    menuicon: {
      width: '24@ratio',
      height: '11@ratio',
    },
    logo: {
      flex: 1,
      alignItems: "center",
    },
    logoicon: {
      width: '68@ratio',
      height: '21@ratio',
    },
    profileicon: {
      width: '38@ratio',
      height: '38@ratio',
    },
    title: {
      marginTop: '40@ratio',
      height: '85@ratio',
      marginBottom: '32@ratio',
    },
    label: {
      fontFamily: "Gilroy-Light",
      fontSize: '30@ratio',
      color: "#fff",
    },
    masklabel: {
      backgroundColor: "transparent",
      height: '49@ratio',
      alignItems: "flex-start",
    },
    masklabeltext: {
      fontSize: '40@ratio',
      color: "white",
      fontFamily: "Gilroy-ExtraBold",
    },
    masklabelimg: {
      width: "100%",
      height: '257@ratio',
      marginTop: '-70@ratio',
      marginLeft: '-20@ratio',
    },
    activities: {
      flexDirection: "row",
      height: '168@ratio',
    },
    quickLinksRow: {
      flexDirection: "row",
      marginTop: '12@ratio',
      gap: '8@ratio',
    },
    quickLinkCard: {
      flex: 1,
      borderRadius: '16@ratio',
      overflow: "hidden",
    },
    quickLinkGradient: {
      paddingVertical: '16@ratio',
      paddingHorizontal: '14@ratio',
    },
    quickLinkTitle: {
      fontFamily: "Gilroy-ExtraBold",
      fontSize: '15@ratio',
      color: "#fff",
    },
    quickLinkSubtitle: {
      fontFamily: "Gilroy-Light",
      fontSize: '11@ratio',
      color: "#D0D2E8",
      marginTop: '4@ratio',
    },
    activityboxborder: {
      height: '168@ratio',
      borderRadius: '16@ratio',
      padding: '1@ratio',
      flex: 1,
      marginHorizontal: '4@ratio',
    },
    activitybox: {
      height: "100%",
      borderRadius: '16@ratio',
      overflow: "hidden",
    },
    activityboxcover: {
      position: "absolute",
      bottom: '-5@ratio',
      left: '-15@ratio',
      opacity: 0.1,
    },
    activityboxbg: {
      position: "absolute",
      top: 0,
      left: 0,
      opacity: 0.15,
    },
    activityboxoverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
    },
    activityiconbox: {
      width: '64@ratio',
      height: '64@ratio',
      justifyContent: "center",
      alignItems: "center",
      alignSelf: "center",
      marginTop: '9@ratio',
    },
    activityicon: {
      maxWidth: '64@ratio',
    },
    activitydata: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      height: '30@ratio',
      marginBottom: '8@ratio',
    },
    activitydatalabel: {
      fontSize: '24@ratio',
      fontFamily: "Gilroy-Bold",
      color: "#fbfbfb",
    },
    activitydatalabel2: {
      fontSize: '16@ratio',
      fontFamily: "Gilroy-Bold",
      color: "#fbfbfb",
      alignSelf: "flex-end",
      marginBottom: '2@ratio',
    },
    activitydatalabels: {
      marginLeft: '3@ratio',
      alignItems: "center",
    },
    activitydatalabels1: {
      fontFamily: "Gilroy-Bold",
      fontSize: '12@ratio',
      color: "#fbfbfb",
    },
    activitydatalabels2: {
      fontFamily: "Gilroy-Bold",
      fontSize: '10@ratio',
      color: "rgba(251,251,251,0.5)",
      marginTop: '-3@ratio',
    },
    activitydatalabels3: {
      fontFamily: "Gilroy-Bold",
      fontSize: '10@ratio',
      color: "rgba(251,251,251,0.5)",
      marginTop: '-5@ratio',
      marginLeft: '3@ratio',
    },
    activityboxtitle: {
      width: window.width <= 320 ? '80@ratio' : '90@ratio', // responsive
      height: '45@ratio',
      alignSelf: "center",
      borderRadius: '12@ratio',
      justifyContent: "center",
      alignItems: "center",
    },
    activityboxtitlel: {
      fontFamily: "Gilroy-Bold",
      color: "#3C3F69",
      fontSize: '14@ratio',
    },
    tabs: {
      flexDirection: "row",
      marginTop: '20@ratio',
    },
    tab: {
      marginRight: '20@ratio',
      paddingVertical: '10@ratio',
    },
    tabtxt: {
      fontFamily: "Gilroy-SemiBold",
      fontSize: '14@ratio',
      color: "#8A8CB2",
    },
    tabtxtactive: {
      color: "#FBFBFB",
    },
    tabunderline: {
      width: '10@ratio',
      height: '2@ratio',
      backgroundColor: "#FBFBFB",
      position: "absolute",
      left: 0,
      bottom: '3@ratio',
    },
    slidercard: {
      width: '313@ratio',
      height: '233@ratio',
      borderRadius: '16@ratio',
      marginRight: '4@ratio',
      marginLeft: '16@ratio',
      overflow: "hidden",
    },
    sliderbox: {
      marginTop: '20@ratio',
      paddingBottom: '10@ratio',
      marginHorizontal: '-16@ratio',
    },
    slidercardcover: {
      position: "absolute",
      right: 0,
      top: 0,
      width: "100%",
      height: "100%",
      zIndex: 3,
    },
    slidercardcoverleft: {
      transform: [{ rotateY: "180deg" }],
    },
    slidercardmask: {
      position: "absolute",
      right: 0,
      top: 0,
      width: "100%",
      height: "100%",
      zIndex: 2,
    },
    slidercardoverlay: {
      position: "absolute",
      right: 0,
      top: 0,
      width: "100%",
      height: "100%",
      zIndex: 1,
      opacity: 0.5,
    },
    slidercardimage: {
      width: "100%",
      height: "100%",
    },
    slidercardlabel: {
      position: "absolute",
      left: '32@ratio',
      bottom: '35@ratio',
      zIndex: 4,
    },
    slidercardlabel1: {
      fontSize: '24@ratio',
      color: "white",
      fontFamily: "Gilroy-Regular",
    },
    slidercardlabel2: {
      fontSize: '30@ratio',
      color: "white",
      fontFamily: "Gilroy-Black",
    },
    sidebarbgshadow: {
      position: "absolute",
      width: "100%",
      height: "100%",
      borderRadius: '32@ratio',
      backgroundColor: "rgba(60,63,105,0.3)",
    },
    sidemenu: {
      position: "absolute",
      zIndex: 0,
      width: "100%",
    },
    sidemenuhead: {
      paddingTop: '64@ratio',
      flexDirection: "column",
      alignItems: "center",
    },
    sidemenuavatar: {
      width: '100@ratio',
      height: '100@ratio',
      borderRadius: Platform.OS == "ios" ? '50@ratio' : '100@ratio', // ios fix
      marginBottom: '23@ratio',
    },
    sidemenuhello: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    sidemenuhelloview: {
      width: '55@ratio',
    },
    sidemenuhelloicon: {
      width: '16@ratio',
      height: '16@ratio',
    },
    sidemenuhellomaskbg: {
      width: "100%",
      height: '20@ratio',
    },
    sidemenuhellomaskview: {
      backgroundColor: "transparent",
      height: '20@ratio',
      alignItems: "center",
    },
    sidemenuhellomasktext: {
      fontSize: '20@ratio',
      color: "white",
      fontFamily: "Gilroy-Medium",
    },
    sidemenuusernameview: {
      width: "100%",
      marginTop: '10@ratio',
    },
    sidemenuusernamemaskbg: {
      width: "100%",
      height: '24@ratio',
    },
    sidemenuusernamemaskview: {
      backgroundColor: "transparent",
      height: '24@ratio',
      alignItems: "center",
    },
    sidemenuusernamemasktext: {
      fontSize: '24@ratio',
      color: "white",
      fontFamily: "Gilroy-Bold",
    },
    sidemenulist: {
      width: "100%",
      paddingHorizontal: '34@ratio',
      marginTop: '22@ratio',
    },
    sidemenulistitem: {
      flexDirection: "row",
      marginVertical: '14@ratio',
      alignItems: "center",
    },
    sidemenulisticon: {
      width: '24@ratio',
      height: '24@ratio',
      marginRight: '22@ratio',
    },
    sidemenulisttext: {
      flex: 1,
      fontSize: '16@ratio',
      color: "white",
      fontFamily: "Gilroy-Bold",
    },
    sidemenuthumbon: {
      width: '26@ratio',
      height: '26@ratio',
      borderRadius: Platform.OS == "ios" ? '13@ratio' : '26@ratio', // ios fix
    },
    sidemenuthumboff: {
      width: '26@ratio',
      height: '26@ratio',
      borderRadius: Platform.OS == "ios" ? '13@ratio' : '26@ratio', // ios fix
    },
    sidemenutrackon: {
      width: '52@ratio',
      height: '30@ratio',
      padding: '2@ratio',
    },
    sidemenutrackoff: {
      width: '52@ratio',
      height: '30@ratio',
      padding: '2@ratio',
    },
  });
  return styles
}

