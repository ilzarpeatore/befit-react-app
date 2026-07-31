import React, { startTransition, useCallback, useRef, useState } from "react";
import {
  ImageBackground,
  StyleSheet,
  Platform,
  ScrollView,
  Dimensions,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from "expo-status-bar";
import Carousel, { Pagination } from "react-native-snap-carousel";
import { carouseldata } from "@constants/unboardingCarousel";
import { NavigationMem } from "@components/unboarding/carousel/navigation";
import { SkipButtonMem } from "@components/unboarding/carousel/skip";
import { ItemMem } from "@components/unboarding/carousel/item";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { ItemDataInterface } from "@components/unboarding/carousel/_types/Item.i";
/**
 * Unboarding
 * figma page names : figma page names : Onboarding 01,Onboarding 02,Onboarding 03,Onboarding 04,Onboarding 05
 * @category Unboarding
 * @subcategory screen
 */
export default function Unboarding({ navigation }: any) {
  const windowWidth = Dimensions.get("window").width;
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const _carousel = useRef<any>(null);
  const styles = useStyle();
  /**
   * on navigation press
   * @param {'prev'|'next'} direction 
   */
  const onNavPress = useCallback((direction:'prev'|'next') => {
    startTransition(() => {
      switch (direction) {
        case "prev":
          _carousel.current?.snapToPrev();
          break;
        case "next":
          _carousel.current?.snapToNext();
          break;
        default:
          break;
      }
    })
  }, []);
  /**
   * on register button press
   */
  const onRegisterPress = useCallback(() => {
    /**
     * navigate to Name screen
     */
    navigation.navigate("Unboarding", { screen: "Name" });
  }, []);
  /**
   * on login button press
   */
  const onLoginPress = useCallback(() => {
    /**
     * navigate to login screen
     * ! there is no login screen
     */
  }, []);
  /**
   * on skip button press
   */
  const onSkipPress = useCallback(() => {
    /**
     * navigate to Name screen
     */
    navigation.navigate("Unboarding", { screen: "Name" });
  }, []);
  /**
   * on carousel snap to item
   */
  const _onSnapToItem = useCallback((index:number) => {
    startTransition(() => {
      setActiveIndex(index)
    });
  }, []);
  /**
   * render carousel item
   */
  const _render_slider_Item = ({ item, index }: { item: ItemDataInterface, index: number }) => {
    return <ItemMem key={index} item={item} />;
  };
  /**
   * render
   */
  return (
    <ImageBackground
      source={require("@assets/bg3.png")}
      style={styles.bg}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.container2}
        >
          <Carousel
            ref={_carousel}
            data={carouseldata as ItemDataInterface[]}
            renderItem={_render_slider_Item}
            sliderWidth={windowWidth}
            itemWidth={windowWidth}
            windowSize={1}
            removeClippedSubviews
            onSnapToItem={_onSnapToItem}
          />
          <NavigationMem activeindex={activeIndex} dataLength={carouseldata.length} onNavPress={onNavPress} onRegisterPress={onRegisterPress} />
          <SkipButtonMem activeindex={activeIndex} dataLength={carouseldata.length} onLoginPress={onLoginPress} onSkipPress={onSkipPress} />
          <Pagination
            dotContainerStyle={styles.sliderdotcontainer}
            dotsLength={carouseldata.length}
            activeDotIndex={activeIndex}
            dotStyle={styles.sliderdotstyle}
            inactiveDotStyle={styles.sliderinactivedotstyle}
            inactiveDotOpacity={1}
            inactiveDotScale={0.5}
          />
        </ScrollView>
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
    container: {
      flex: 1,
    },
    container2: {
      flex: 1,
    },
    bg: {
      width: "100%",
      height: "100%",
      backgroundColor: "#1A1735",
    },
    sliderdotstyle: {
      width: '16@ratio',
      height: '8@ratio',
      borderRadius: '8@ratio',
      backgroundColor: "#505EDC",
      marginHorizontal: '-4@ratio',
    },
    sliderinactivedotstyle: {
      width: '16@ratio',
      height: '16@ratio',
      borderRadius: Platform.OS == "ios" ? '8@ratio' : '16@ratio', //ios fix
      backgroundColor: "#ffffff",
      marginHorizontal: '-16@ratio',
    }
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
    paddingTop: 24,
  },
  scrollviewcontentcontainerstyle: {
    paddingBottom: 20,
  },
  bg: {
    width: "100%",
    height: "100%",
    backgroundColor: "#1A1735",
  },
  sliderdotstyle: {
    width: 16,
    height: 8,
    borderRadius: 8,
    backgroundColor: "#505EDC",
    marginHorizontal: -4,
  },
  sliderinactivedotstyle: {
    width: 16,
    height: 16,
    borderRadius: Platform.OS == "ios" ? 8 : 16, //ios fix
    backgroundColor: "#ffffff",
    marginHorizontal: -16,
  },
});