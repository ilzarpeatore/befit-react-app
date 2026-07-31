import React from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { useNavigation, useRoute } from "@react-navigation/native";

interface WorkoutResult {
  workoutName?: string;
  calories?: string;
  duration?: string;
}

export default function Congratulation() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = (route?.params as any) as WorkoutResult | undefined;
  const styles = useStyle();
  return (
    <ImageBackground
      source={require("@assets/bg2.png")}
      style={styles.bg}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.container2}>
          <ScrollView>
            {/*trophy box start*/}
            <View style={styles.trophybox}>
              <Image
                source={require("@assets/trophyshadow.png")}
                style={styles.trophyshadow}
              />
              <Image
                source={require("@assets/trophy.png")}
                style={styles.trophy}
              />
              <Image
                source={require("@assets/confetti.png")}
                style={styles.trophyconfetti}
              />
              {/*trophy box title 1*/}
              <Text style={styles.trophyboxtl}>YoooHoooo!</Text>
              {/*trophy box title 2*/}
              <Text style={styles.trophyboxt2}>Congratulations</Text>
              {params?.workoutName ? (
                <Text style={styles.trophyboxt2}>{params.workoutName}</Text>
              ) : null}
            </View>
            {/*trophy box end*/}
            {/*actions start*/}
            <View style={styles.actions}>
              {/*actions resault start*/}
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("Result", {
                    distance: params?.duration ? "0" : undefined,
                    duration: params?.duration,
                    calories: params?.calories,
                    date: params?.workoutName || "Workout Result",
                  });
                }}
              >
                <LinearGradient
                  start={{ x: 0.24, y: -0.09 }}
                  end={{ x: 0.26, y: 1.05 }}
                  colors={["#7773FA", "#5652E5"]}
                  style={styles.sharebutton}
                >
                  <Text style={styles.sharebuttontext}>Show me resault</Text>
                </LinearGradient>
              </TouchableOpacity>
              {/*actions resault end*/}
              {/*actions go home start*/}
              <TouchableOpacity
                onPress={() => {
                  console.log("click");
                  navigation.navigate("Home"); // navigate to Home page
                }}
                style={styles.homebutton}
              >
                <Text style={styles.homebuttontext}>Go to Home</Text>
              </TouchableOpacity>
              {/*actions go home end*/}
            </View>
            {/*actions end*/}
          </ScrollView>
        </View>
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
      paddingTop: '38@ratio',
    },
    bg: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
      backgroundColor: "#1A1735",
    },
    trophybox: {
      width: "100%",
      height: '548@ratio',
    },
    trophyshadow: {
      position: "absolute",
      width: "100%",
      height: '464@ratio',
      resizeMode: "contain",
      top: '82@ratio',
    },
    trophy: {
      position: "absolute",
      width: "100%",
      height: '464@ratio',
      resizeMode: "contain",
      top: 0,
    },
    trophyconfetti: {
      position: "absolute",
      width: "100%",
      height: '249@ratio',
      resizeMode: "contain",
      top: '46@ratio',
    },
    trophyboxtl: {
      position: "absolute",
      width: "100%",
      bottom: '105@ratio',
      fontFamily: "Gilroy-Lightitalic",
      fontSize: '26@ratio',
      color: "#ffffff",
      textAlign: "center",
    },
    trophyboxt2: {
      position: "absolute",
      width: "100%",
      bottom: '50@ratio',
      fontFamily: "Gilroy-Bold",
      fontSize: '32@ratio',
      color: "#ffffff",
      textAlign: "center",
    },
    actions: {
      alignItems: "center",
    },
    sharebutton: {
      width: '218@ratio',
      height: '55@ratio',
      alignItems: "center",
      justifyContent: "center",
      borderRadius: '12@ratio',
    },
    sharebuttontext: {
      fontFamily: "Gilroy-Bold",
      fontSize: '18@ratio',
      color: "#ffffff",
    },
    homebutton: {
      height: '40@ratio',
      justifyContent: "center",
      marginTop: '15@ratio',
      marginBottom: '20@ratio',
    },
    homebuttontext: {
      color: "#8A8CB2",
      fontFamily: "Gilroy-Bold",
      fontSize: '16@ratio',
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
  container2: {
    flex: 1,
    paddingTop: 38,
  },
  bg: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    backgroundColor: "#1A1735",
  },
  trophybox: {
    width: "100%",
    height: 548,
  },
  trophyshadow: {
    position: "absolute",
    width: "100%",
    height: 464,
    resizeMode: "contain",
    top: 82,
  },
  trophy: {
    position: "absolute",
    width: "100%",
    height: 464,
    resizeMode: "contain",
    top: 0,
  },
  trophyconfetti: {
    position: "absolute",
    width: "100%",
    height: 249,
    resizeMode: "contain",
    top: 46,
  },
  trophyboxtl: {
    position: "absolute",
    width: "100%",
    bottom: 105,
    fontFamily: "Gilroy-Lightitalic",
    fontSize: 26,
    color: "#ffffff",
    textAlign: "center",
  },
  trophyboxt2: {
    position: "absolute",
    width: "100%",
    bottom: 50,
    fontFamily: "Gilroy-Bold",
    fontSize: 32,
    color: "#ffffff",
    textAlign: "center",
  },
  actions: {
    alignItems: "center",
  },
  sharebutton: {
    width: 218,
    height: 55,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  sharebuttontext: {
    fontFamily: "Gilroy-Bold",
    fontSize: 18,
    color: "#ffffff",
  },
  homebutton: {
    height: 40,
    justifyContent: "center",
    marginTop: 15,
    marginBottom: 20,
  },
  homebuttontext: {
    color: "#8A8CB2",
    fontFamily: "Gilroy-Bold",
    fontSize: 16,
  },
});
