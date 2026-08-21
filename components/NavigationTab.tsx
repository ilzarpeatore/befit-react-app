import React, { useRef, useState } from "react";
import {
  View,
  Pressable,
  Animated,
  StyleSheet,
  LayoutChangeEvent,
  Modal,
} from "react-native";
import { Image } from "expo-image";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { NavigationTabOptionsInterface } from "./_types/NavigationTab.i";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "@components/ui/icon";
import { Text } from "@components/ui/text";
import { C, FONT } from "../pages/migrated/theme";
// Modulo-scope: Animated.createAnimatedComponent(Image) solo depende del
// import estatico de Image, no de props/estado del componente -- crearlo
// aqui evita reconstruirlo (y su wrapper interno) en cada render.
const AnimatedImage = Animated.createAnimatedComponent(Image);

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  route: string;
  params?: Record<string, any>;
}

// Placeholder: mismo criterio que StartupChecklist -- construye la mecánica
// del submenu "+" con accesos ya existentes en la app; el set final de
// acciones se puede ajustar más adelante sin tocar la mecánica.
const QUICK_ACTIONS: QuickAction[] = [
  { id: "habit", label: "Añadir hábito", icon: "flame-outline", route: "MigratedHabitAdd" },
  { id: "calendar", label: "Ver calendario", icon: "calendar-outline", route: "MigratedMyProgramCalendar" },
  { id: "shopping", label: "Lista de la compra", icon: "cart-outline", route: "MigratedAddShoppingList" },
  { id: "coach", label: "Hablar con tu entrenador", icon: "chatbubble-ellipses-outline", route: "MigratedChatting" },
];

/**
 * NavigationTab
 * reactnative navigation tabBar function -- barra flotante con efecto
 * glass (BlurView) y botón central "+" que abre un submenu de accesos
 * rápidos, también con efecto glass.
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
  const [navigationbtnactiveX] = useState(() => new Animated.Value(0));

  /* submenu "+" */
  const [menuOpen, setMenuOpen] = useState(false);
  const menuAnim = useRef(new Animated.Value(0)).current;

  const openMenu = () => {
    setMenuOpen(true);
    Animated.spring(menuAnim, { toValue: 1, useNativeDriver: true, friction: 8, tension: 80 }).start();
  };
  const closeMenu = () => {
    Animated.timing(menuAnim, { toValue: 0, duration: 160, useNativeDriver: true }).start(() => setMenuOpen(false));
  };

  const set_nav_positions = (event: LayoutChangeEvent, index: number) => {
    /* save navigation tab x positions */
    let { x } = event.nativeEvent.layout;
    let locations = navlocations;
    locations[index] = x;
    set_navlocations(locations);
    /* if is the active page move navigation btn ellipse to it location and show it */
    if (index == state.index) {
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
  /* hide if tabBarVisible is false */
  if (focusedOptions.tabBarVisible === false) {
    return null;
  }
  return (
    <>
      <View style={[styles.navigationOuter, { marginBottom: safearea.bottom || 12 }]}>
        <BlurView intensity={55} tint="light" style={styles.navigationBlur}>
          <View style={styles.navigationglow} />
          <AnimatedImage
            source={require("./../assets/icons/navigationellipse.png")}
            contentFit="contain"
            style={[
              styles.navigationbtnactive,
              {
                transform: [{ translateX: navigationbtnactiveX }],
                tintColor: "#1C1C1E",
              },
              navigation_ellipse_show ? { opacity: 1 } : { opacity: 0 },
            ]}
          />
          {/*navigation icons start*/}
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const typedOptions = options as NavigationTabOptionsInterface;
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
              <Pressable
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={typedOptions.tabBarAccessibilityLabel}
                testID={(typedOptions as any).tabBarTestID}
                onLayout={(event) => set_nav_positions(event, index)}
                onPress={() => {
                  navigation_press(index, onPress);
                }}
                onLongPress={onLongPress}
                style={({ pressed }) => [styles.navigationbtn, pressed && { opacity: 0.2 }]}
              >
                <Image
                  source={typedOptions.icon}
                  contentFit="contain"
                  style={[
                    styles.navigationicon,
                    { tintColor: isFocused ? "#000000" : "#AEAEB2" },
                  ]}
                />
              </Pressable>
            );
          })}
          {/*navigation icons end*/}
        </BlurView>

        {/* Botón "+" flotante -- abre el submenu de accesos rápidos */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Accesos rápidos"
          style={({ pressed }) => [styles.plusBtn, pressed && { opacity: 0.85 }]}
          onPress={openMenu}
        >
          <LinearGradient
            colors={["#FF8A50", C.orange, "#E85A2A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <Icon name="add" size={26} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Submenu glass -- accesos rápidos */}
      <Modal visible={menuOpen} transparent animationType="none" onRequestClose={closeMenu}>
        <View style={{ flex: 1 }}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeMenu}>
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          </Pressable>
          <View
            pointerEvents="box-none"
            style={{ flex: 1, justifyContent: "flex-end", alignItems: "center", paddingBottom: safearea.bottom + 92 }}
          >
            <Animated.View
              style={[
                styles.quickMenu,
                {
                  opacity: menuAnim,
                  transform: [
                    { translateY: menuAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) },
                    { scale: menuAnim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) },
                  ],
                },
              ]}
            >
              <BlurView intensity={70} tint="light" style={styles.quickMenuBlur}>
                {QUICK_ACTIONS.map((action, i) => (
                  <Pressable
                    key={action.id}
                    style={[styles.quickMenuItem, i > 0 && styles.quickMenuItemDivider]}
                    onPress={() => {
                      closeMenu();
                      navigation.navigate(action.route, action.params);
                    }}
                  >
                    <View style={styles.quickMenuIconWrap}>
                      <Icon name={action.icon} size={18} color="#1C1C1E" />
                    </View>
                    <Text style={styles.quickMenuLabel}>{action.label}</Text>
                  </Pressable>
                ))}
              </BlurView>
            </Animated.View>
          </View>
        </View>
      </Modal>
    </>
  );
}
/**
 * style
 * * note : stylesheet is converted to responsiveStyleSheet because we need to use responsive ratio . if you don't want to use resposive ratio you can use the normal stylesheet version
 */
function useStyle() {
  const styles = useResponsiveStyleSheet({
    navigationOuter: {
      position: "absolute",
      left: '20@ratio',
      right: '20@ratio',
      bottom: 0,
      height: '64@ratio',
    },
    navigationBlur: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      width: "100%",
      height: '64@ratio',
      borderRadius: '32@ratio',
      overflow: "hidden",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.4)",
    },
    navigationglow: {
      position: "absolute",
      top: 0,
      left: '14@ratio',
      right: '14@ratio',
      height: '1@ratio',
      backgroundColor: "rgba(255,255,255,0.5)",
    },
    navigationbtn: {
      width: '50@ratio',
      height: '50@ratio',
      justifyContent: "center",
      alignItems: "center",
    },
    navigationicon: {
      width: '26@ratio',
      height: '26@ratio',
    },
    navigationbtnactive: {
      position: "absolute",
      top: '8@ratio',
      left: 0,
      width: '9@ratio',
      height: '5@ratio',
    },
    plusBtn: {
      position: "absolute",
      top: '-22@ratio',
      left: "50%",
      marginLeft: '-28@ratio',
      width: '56@ratio',
      height: '56@ratio',
      borderRadius: '28@ratio',
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      shadowColor: "#000",
      shadowOpacity: 0.25,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 6,
    },
    quickMenu: {
      width: "78%",
      borderRadius: '20@ratio',
      overflow: "hidden",
    },
    quickMenuBlur: {
      paddingVertical: '8@ratio',
    },
    quickMenuItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: '12@ratio',
      paddingHorizontal: '16@ratio',
      gap: '12@ratio',
    },
    quickMenuItemDivider: {
      borderTopWidth: 1,
      borderTopColor: "rgba(0,0,0,0.06)",
    },
    quickMenuIconWrap: {
      width: '32@ratio',
      height: '32@ratio',
      borderRadius: '16@ratio',
      backgroundColor: "rgba(0,0,0,0.06)",
      alignItems: "center",
      justifyContent: "center",
    },
    quickMenuLabel: {
      fontSize: '14@ratio',
      fontFamily: FONT.medium,
      color: "#1C1C1E",
    },
  });
  return styles
}
