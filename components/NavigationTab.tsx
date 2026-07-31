import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  Animated,
  StyleSheet,
  LayoutChangeEvent,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { NavigationTabOptionsInterface } from "./_types/NavigationTab.i";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
/**
 * NavigationTab
 * reactnative navigation tabBar function
 */
export default function NavigationTab({ state, descriptors, navigation }: BottomTabBarProps) {
  const styles = useStyle();
  const safearea = useSafeAreaInsets();
  /* top bar options */
  const focusedOptions = descriptors[state.routes[state.index].key].options as NavigationTabOptionsInterface;
  /* show navigation btn ellipse */
  const [navigation_ellipse_show, set_navigation_ellipse_show] = useState(
    false
  );
  /* save navigation nav x location */
  const [navlocations, set_navlocations] = useState([0, 0, 0, 0]);
  /* set navigation avtive page */
  const [activepage, set_activepage] = useState(state.index);
  const navigationbtnactiveX = useRef(new Animated.Value(0)).current;

  const set_nav_positions = (event: LayoutChangeEvent, index: number) => {
    /* save navigation tab x positions */
    var { x } = event.nativeEvent.layout;
    let locations = navlocations;
    locations[index] = x;
    set_navlocations(locations);
    /* if is the active page move navigation btn ellipse to it location and show it */
    if (index == activepage) {
      navigationbtnactiveX.setValue(x + ((styles.navigationbtn.width / 2) - 4.5));
      set_navigation_ellipse_show(true);
    }
  };
  const navigation_press = (index: number, onPress: Function) => {
    /* if navigationbtnactiveX return 0 set it location to the active page index xlocation */
    //@ts-ignore exits
    if (navigationbtnactiveX.__getValue() == 0)
      navigationbtnactiveX.setValue(navlocations[state.index] + ((styles.navigationbtn.width / 2) - 4.5));
    /* animate navigation btn ellipse */
    Animated.timing(navigationbtnactiveX, {
      toValue: navlocations[index] + ((styles.navigationbtn.width / 2) - 4.5),
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      /* navigate to bottom tab screen */
      onPress();
    });
  };
  useEffect(() => {
    set_activepage(state.index)
  }, [state.index])
  /* hide if tabBarVisible is false */
  if (focusedOptions.tabBarVisible === false) {
    return null;
  }
  return (
    <View style={[styles.navigation, { marginBottom: safearea.bottom }]}>
      {/*navigation bg start*/}
      <LinearGradient
        colors={["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0.08)"]}
        style={styles.navigationdropshadow}
      ></LinearGradient>
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        colors={[
          "rgba(0, 0, 0, 0)",
          "rgba(229,229,234, 1)",
          "rgba(0, 0, 0, 0)",
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
            tintColor: "#1C1C1E",
          },
          navigation_ellipse_show ? { opacity: 1 } : { opacity: 0 },
        ]}
      />
      {/*navigation bg end*/}
      {/*navigation icons start*/}
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const typedOptions = options as NavigationTabOptionsInterface;
        //if (options.tabBarVisible == false) return;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        return (
          <TouchableOpacity
            key={index}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={typedOptions.tabBarAccessibilityLabel}
            testID={(typedOptions as any).tabBarTestID}
            onLayout={(event) => set_nav_positions(event, index)}
            onPress={() => {
              navigation_press(index, onPress);
            }}
            onLongPress={onLongPress}
            style={styles.navigationbtn}
          >
            <Image
              source={typedOptions.icon}
              style={[
                styles.navigationicon,
                { tintColor: isFocused ? "#000000" : "#AEAEB2" },
              ]}
            />
          </TouchableOpacity>
        );
      })}
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
      backgroundColor: "#FFFFFF",
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
  return styles
}
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
