import React, { useRef, useState } from "react";
import {
  View,
  Image,
  Pressable,
  Animated,
  StyleSheet,
  LayoutChangeEvent,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { NavigationInterface, NavigationParamList } from "./_types/Navigation.i";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { StackNavigationProp } from "@react-navigation/stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
/**
 * Navigation
 */
export default function Navigation({ activepageindex }: NavigationInterface) {
  const styles = useStyle();
  const safearea = useSafeAreaInsets();
  /* navigation */
  const navigation = useNavigation<StackNavigationProp<NavigationParamList>>();
  /* show navigation btn ellipse */
  const [navigation_ellipse_show, set_navigation_ellipse_show] = useState(
    false
  );
  /* save navigation nav x location */
  const [navlocations, set_navlocations] = useState([0, 0, 0, 0]);
  const navigationbtnactiveX = useRef(new Animated.Value(0)).current;
  const set_nav_positions = (event: LayoutChangeEvent, index: number) => {
    /* save navigation tab x positions */
    let { x } = event.nativeEvent.layout;
    let locations = navlocations;
    locations[index] = x;
    set_navlocations(locations);
    /* if is the active page move navigation btn ellipse to it location and show it */
    if (index == activepageindex) {
      navigationbtnactiveX.setValue(x + (styles.navigationbtn.width / 2 - 4.5));
      set_navigation_ellipse_show(true);
    }
  };
  const navigation_press = (index: number) => {
    /* if navigationbtnactiveX return 0 set it location to the active page index xlocation */
    //@ts-ignore exists
    if (navigationbtnactiveX.__getValue() == 0)
      navigationbtnactiveX.setValue(
        navlocations[activepageindex] + (styles.navigationbtn.width / 2 - 4.5)
      );
    /* animate navigation btn ellipse */
    Animated.timing(navigationbtnactiveX, {
      toValue: navlocations[index] + (styles.navigationbtn.width / 2 - 4.5),
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      /* reset location to home because we are only using this type of navigation for home page */
      navigationbtnactiveX.setValue(
        navlocations[0] + (styles.navigationbtn.width / 2 - 4.5)
      );
      /* navigate to bottom tab screen */
      switch (index) {
        case 0:
          navigation.navigate("Home");
          break;
        case 1:
          navigation.navigate("Club");
          break;
        case 2:
          navigation.navigate("Challenges");
          break;
        case 3:
          navigation.navigate("Today");
          break;
        default:
          navigation.navigate("Home");
          break;
      }
    });
  };
  return (
    <View style={[styles.navigation, { marginBottom: safearea.bottom }]}>
      {/*navigation bg start*/}
      <LinearGradient
        colors={["rgba(20, 18, 39, 0)", "rgba(20, 18, 39, 0.5)"]}
        style={styles.navigationdropshadow}
      ></LinearGradient>
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        colors={[
          "rgba(26, 23,53, 0)",
          "rgba(90,93,135, 1)",
          "rgba(27, 23, 52, 0)",
        ]}
        locations={[0, 0.515625, 1]}
        style={styles.navigationglow}
      ></LinearGradient>
      <Animated.Image
        source={require("./../assets/icons/navigationellipse.png")}
        style={[
          styles.navigationbtnactive,
          {
            transform: [{ translateX: navigationbtnactiveX }],
          },
          navigation_ellipse_show ? { opacity: 1 } : { opacity: 0 },
        ]}
      />
      {/*navigation bg end*/}
      {/*navigation icons start*/}
      <Pressable
        onLayout={(event) => set_nav_positions(event, 0)}
        onPress={() => {
          navigation_press(0);
        }}
        style={({ pressed }) => [styles.navigationbtn, pressed && { opacity: 0.2 }]}
      >
        <Image
          source={require("./../assets/icons/nav1.png")}
          style={styles.navigationicon}
        />
      </Pressable>
      <Pressable
        onLayout={(event) => set_nav_positions(event, 1)}
        onPress={() => {
          navigation_press(1);
        }}
        style={({ pressed }) => [styles.navigationbtn, pressed && { opacity: 0.2 }]}
      >
        <Image
          source={require("./../assets/icons/nav2.png")}
          style={styles.navigationicon}
        />
      </Pressable>
      <Pressable
        onLayout={(event) => set_nav_positions(event, 2)}
        onPress={() => {
          navigation_press(2);
        }}
        style={({ pressed }) => [styles.navigationbtn, pressed && { opacity: 0.2 }]}
      >
        <Image
          source={require("./../assets/icons/nav3.png")}
          style={styles.navigationicon}
        />
      </Pressable>
      <Pressable
        onLayout={(event) => set_nav_positions(event, 3)}
        onPress={() => {
          navigation_press(3);
        }}
        style={({ pressed }) => [styles.navigationbtn, pressed && { opacity: 0.2 }]}
      >
        <Image
          source={require("./../assets/icons/nav4.png")}
          style={styles.navigationicon}
        />
      </Pressable>
      {/*navigation icons end*/}
    </View>
  );
}
/**
 * style
 * * note : stylesheet is converted to responsiveStyleSheet because we need to use responsive ratio . if you don't want to use resposive ratio you can use the normal stylesheet version
 */
function useStyle() {
  const styles = useResponsiveStyleSheet({
    navigation: {
      width: "100%",
      height: '65@ratio',
      backgroundColor: "#1A1735",
      bottom: 0,
      right: 0,
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
    },
    navigationdropshadow: {
      position: "absolute",
      top: '-40@ratio',
      right: 0,
      width: "100%",
      height: '40@ratio',
    },
    navigationglow: {
      position: "absolute",
      top: 0,
      right: 0,
      width: "100%",
      height: '1@ratio',
    },
    navigationbtn: {
      width: '50@ratio',
      height: '50@ratio',
      justifyContent: "center",
      alignItems: "center",
    },
    navigationicon: {
      width: '28@ratio',
      height: '28@ratio',
      resizeMode: "contain",
    },
    navigationbtnactive: {
      position: "absolute",
      top: 0,
      left: 0,
      width: '9@ratio',
      height: '5@ratio',
      resizeMode: "contain",
    },
  });
  return styles;
};
/**
 * style
 * * you can remove this const
 * * use this style if you don't want to use ratio
 */
const styles_old = StyleSheet.create({
  navigation: {
    width: "100%",
    height: 65,
    backgroundColor: "#1A1735",
    bottom: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  navigationdropshadow: {
    position: "absolute",
    top: -40,
    right: 0,
    width: "100%",
    height: 40,
  },
  navigationglow: {
    position: "absolute",
    top: 0,
    right: 0,
    width: "100%",
    height: 1,
  },
  navigationbtn: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  navigationicon: {
    width: 28,
    height: 28,
    resizeMode: "contain",
  },
  navigationbtnactive: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 9,
    height: 5,
    resizeMode: "contain",
  },
});
