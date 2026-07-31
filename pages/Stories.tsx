import React, { useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Animated,
  Easing,
  Platform,
  Dimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import Carousel from "react-native-snap-carousel";
import { StoriesPropsInterface, storiesSliderPropsInterface } from "./_types/Stories.i";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { storyslider } from "static/Stories";
const window = Dimensions.get("window");
/**
 * Stories
 * figma page names : Stories
 */
export default function Stories({ navigation }: StoriesPropsInterface) {
  const styles = useStyle();
  const _stories_carousel = useRef<any>(null);
  const storysliderpagedotAnim = useRef(new Animated.Value(0)).current; // story slider pagination dot animation
  const [story_slider_active_slide, setStoryActiveSlide] = useState<number>(0);
  const _render_stories_slider_item = ({ item }: any) => {
    /**
     * _render_stories_slider_item
     */
    return (
      <View>
        {/* story slider image */}
        <Image style={styles.slideimage} source={item.image} />
        {/* story slider data */}
        <View style={styles.slidedata}>
          {/* story slider user */}
          <View style={styles.slideuser}>
            {/* story slider user avatar*/}
            <Image source={item.avatar} style={styles.slideuseravatar} />
            <View>
              {/* story slider username*/}
              <Text style={styles.slideuserdatausername}>{item.username}</Text>
              {/* story slider time*/}
              <Text style={styles.slideuserdatatime}>{item.time}</Text>
            </View>
          </View>
          {/* story slider location*/}
          <View style={styles.slidelocation}>
            <Image
              source={require("@assets/stories/location.png")}
              style={styles.slidelocationicon}
            />
            <Text style={styles.slidelocationtext}>{item.location}</Text>
          </View>
        </View>
        {/* story slider like*/}
        <View style={styles.slidelike}>
          {/* story slider like btn*/}
          <TouchableOpacity style={styles.slidelikebtn}>
            <Image
              source={require("@assets/stories/likebtn.png")}
              style={styles.slidelikebtnicon}
            />
          </TouchableOpacity>
          {/* story slider likes*/}
          <Text style={styles.slideliketext}>{item.likes} Likes</Text>
        </View>
        {/* story slider pagination*/}
        <View style={styles.slidepagination}>
          {storyslider.map((item: any, index: number) => {
            return (
              <View key={index} style={styles.slidepaginationdot}>
                {index == story_slider_active_slide ? (
                  <Animated.View
                    style={[
                      styles.slidepaginationdotactive,
                      {
                        left: storysliderpagedotAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ["-100%", "0%"], // animate active slider pagination dot to fill left to right
                        }),
                      },
                    ]}
                  />
                ) : null}
              </View>
            );
          })}
        </View>
      </View>
    );
  };
  const _render_stories_slider = () => {
    /**
     * _render_stories_slider
     * render stories Carousel
     */
    return (
      <Animated.View
        style={[
          styles.storiesslider,
          {
            height: window.height, // height must be less than
          },
        ]}
      >
        <Carousel
          ref={_stories_carousel}
          layout={"stack"}
          data={storyslider}
          renderItem={_render_stories_slider_item}
          sliderWidth={window.width}
          itemWidth={window.width}
          onContentSizeChange={() => {
            story_slider_onSnapToItem(
              story_slider_active_slide
            );
          }}
          onSnapToItem={(index: number) => story_slider_onSnapToItem(index)}
          autoplay={true}
          lockScrollWhileSnapping={true}
          autoplayInterval={3000}
        />
      </Animated.View>
    );
  }
  const story_slider_onSnapToItem = (index: number) => {
    /* reset pagination dot animation value */
    storysliderpagedotAnim.setValue(0);
    /* set active slider to new slide index */
    setStoryActiveSlide(index);
    /* start pagination dot animation */
    Animated.timing(storysliderpagedotAnim, {
      toValue: 1,
      duration: 3000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start(() => {
      // if reach end
      if (index == storyslider.length - 1) {
        console.log("end");
        navigation.navigate("Home", {
          screen: "Club",
        }); // navigate to club page
      }
    });
  }
  return (
    <View style={styles.bg}>
      {/*stories slider start*/}
      {_render_stories_slider()}
      <StatusBar style="dark" />
      {/*stories slider end*/}
    </View>
  );

}
/**
 * style
 * * note : stylesheet is converted to responsiveStyleSheet because we need to use responsive ratio . if you don't want to use resposive ratio you can use the normal stylesheet version
 */
function useStyle() {
  const styles = useResponsiveStyleSheet({
    bg: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
      paddingTop: '44@ratio',
      backgroundColor: "#EBEBF0",
    },
    storiesslider: {
      position: "absolute",
      width: "100%",
      height: "100%",
      top: 0,
      left: 0,
      zIndex: 999,
      backgroundColor: "#EBEBF0",
    },
    slideimage: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },
    slidedata: {
      position: "absolute",
      top: '63@ratio',
      flexDirection: "row",
      paddingHorizontal: '16@ratio',
    },
    slideuser: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
    },
    slideuseravatar: {
      width: '48@ratio',
      height: '48@ratio',
      resizeMode: "contain",
      borderRadius: Platform.OS == "ios" ? '24@ratio' : '48@ratio', //iso fix
      marginRight: '10@ratio',
    },
    slideuserdatausername: {
      fontSize: window.width <= 320 ? '14@ratio' : '16@ratio', // reponsive fix
      color: "#000000",
      fontFamily: "Gilroy-Bold",
    },
    slideuserdatatime: {
      fontSize: window.width <= 320 ? '12@ratio' : '14@ratio', // reponsive fix
      color: "#6B6B70",
      fontFamily: "Gilroy-Medium",
    },
    slidelocation: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      marginTop: '6@ratio',
    },
    slidelocationicon: {
      width: '20@ratio',
      height: '20@ratio',
      resizeMode: "contain",
      marginRight: '5@ratio',
    },
    slidelocationtext: {
      fontSize: window.width <= 320 ? '14@ratio' : '16@ratio', // reponsive fix
      color: "#000000",
      fontFamily: "Gilroy-Bold",
    },
    slidelike: {
      position: "absolute",
      bottom: '36@ratio',
      alignSelf: "center",
      alignItems: "center",
    },
    slidelikebtn: {
      marginBottom: '10@ratio',
    },
    slidelikebtnicon: {
      width: '70@ratio',
      height: '70@ratio',
      resizeMode: "contain",
    },
    slideliketext: {
      fontSize: '16@ratio',
      color: "#000000",
      fontFamily: "Gilroy-Bold",
    },
    slidepagination: {
      position: "absolute",
      top: '40@ratio',
      left: 0,
      width: "100%",
      paddingHorizontal: '10@ratio',
      flexDirection: "row",
    },
    slidepaginationdot: {
      flex: 1,
      height: '4@ratio',
      borderRadius: '10@ratio',
      backgroundColor: "#E5E5EA",
      marginHorizontal: '6@ratio',
      position: "relative",
      overflow: "hidden",
    },
    slidepaginationdotactive: {
      position: "absolute",
      left: "-100%",
      top: 0,
      width: "100%",
      height: '4@ratio',
      borderRadius: '10@ratio',
      backgroundColor: "#000000",
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
  bg: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    paddingTop: 44,
    backgroundColor: "#1A1735",
  },
  storiesslider: {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
    zIndex: 999,
    backgroundColor: "#1A1735",
  },
  slideimage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  slidedata: {
    position: "absolute",
    top: 63,
    flexDirection: "row",
    paddingHorizontal: 16,
  },
  slideuser: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  slideuseravatar: {
    width: 48,
    height: 48,
    resizeMode: "contain",
    borderRadius: Platform.OS == "ios" ? 24 : 48, //iso fix
    marginRight: 10,
  },
  slideuserdatausername: {
    fontSize: window.width <= 320 ? 14 : 16, // reponsive fix
    color: "#ffffff",
    fontFamily: "Gilroy-Bold",
  },
  slideuserdatatime: {
    fontSize: window.width <= 320 ? 12 : 14, // reponsive fix
    color: "#ffffff",
    fontFamily: "Gilroy-Medium",
  },
  slidelocation: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginTop: 6,
  },
  slidelocationicon: {
    width: 20,
    height: 20,
    resizeMode: "contain",
    marginRight: 5,
  },
  slidelocationtext: {
    fontSize: window.width <= 320 ? 14 : 16, // reponsive fix
    color: "#ffffff",
    fontFamily: "Gilroy-Bold",
  },
  slidelike: {
    position: "absolute",
    bottom: 36,
    alignSelf: "center",
    alignItems: "center",
  },
  slidelikebtn: {
    marginBottom: 10,
  },
  slidelikebtnicon: {
    width: 70,
    height: 70,
    resizeMode: "contain",
  },
  slideliketext: {
    fontSize: 16,
    color: "#ffffff",
    fontFamily: "Gilroy-Bold",
  },
  slidepagination: {
    position: "absolute",
    top: 40,
    left: 0,
    width: "100%",
    paddingHorizontal: 10,
    flexDirection: "row",
  },
  slidepaginationdot: {
    flex: 1,
    height: 4,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.5)",
    marginHorizontal: 6,
    position: "relative",
    overflow: "hidden",
  },
  slidepaginationdotactive: {
    position: "absolute",
    left: "-100%",
    top: 0,
    width: "100%",
    height: 4,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,1)",
  },
});
