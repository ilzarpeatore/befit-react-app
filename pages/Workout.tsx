import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ImageBackground,
  Text,
  View,
  Image,
  TouchableOpacity,
  Platform,
  ScrollView,
  ImageSourcePropType,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import MaskedView from "@react-native-masked-view/masked-view";
import WorkoutProgress from "@components/WorkoutProgress";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { Colors } from "@constants/colors";

interface Props {
  navigation: any;
  route?: {
    params?: {
      exerciseName?: string;
      duration?: string;
      nextExercise?: string;
      Sets?: number;
      reps?: number;
    };
  };
}

function parseDurationToSeconds(duration?: string): number {
  if (!duration) return 30;
  const parts = duration.split(":").map(Number);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 1) return parts[0];
  return 30;
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function Workout({ navigation, route }: Props) {
  const styles = useStyle();
  const params = route?.params;

  const exerciseName = params?.exerciseName || "Plank";
  const durationStr = params?.duration || "00:30";
  const nextExercise = params?.nextExercise || "Cross Crunches";
  const Sets = params?.Sets || 3;
  const reps = params?.reps || 15;

  const totalSeconds = parseDurationToSeconds(durationStr);
  const [remaining, setRemaining] = useState(totalSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            intervalRef.current = null;
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  useEffect(() => {
    const elapsed = totalSeconds - remaining;
    setProgress(totalSeconds > 0 ? Math.round((elapsed / totalSeconds) * 100) : 0);
  }, [remaining, totalSeconds]);

  const toggleTimer = useCallback(() => {
    if (remaining <= 0) {
      setRemaining(totalSeconds);
      setProgress(0);
      setIsRunning(true);
    } else {
      setIsRunning((prev) => !prev);
    }
  }, [remaining, totalSeconds]);

  const handleComplete = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    navigation.navigate("Congratulation", {
      workoutName: exerciseName,
      duration: formatTime(totalSeconds - remaining),
      calories: undefined,
    });
  }, [
    navigation,
    exerciseName,
    durationStr,
    Sets,
    reps,
    totalSeconds,
    remaining,
  ]);

  const _render_next_workout = (
    title: string,
    image: ImageSourcePropType,
    onNextbuttonPress: () => void
  ) => {
    return (
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
        style={styles.nextworkoutborder}
      >
        <View style={styles.nextworkoutinside}>
          <Image source={image} style={styles.nextworkoutimg} />
          <View style={styles.nextworkoutdata}>
            <Text style={styles.nextworkoutlabel}>Next:</Text>
            <Text style={styles.nextworkouttitle}>{title}</Text>
          </View>
          <TouchableOpacity
            style={styles.nextbutton}
            onPress={onNextbuttonPress}
          >
            <Image
              source={require("@assets/workout/nextbutton.png")}
              style={styles.nextbuttonimg}
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  };

  return (
    <ImageBackground
      source={require("@assets/bg2.png")}
      style={styles.bg}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.container2}>
          <View style={styles.topbar}>
            <TouchableOpacity
              style={styles.backbutton}
              onPress={() => navigation.goBack()}
            >
              <Image
                source={require("@assets/workout/backbottom.png")}
                style={styles.backbuttonimg}
              />
            </TouchableOpacity>
            <ImageBackground
              source={require("@assets/workout/timerbg.png")}
              style={styles.timerbg}
            >
              <Image
                source={require("@assets/workout/stopwatch.png")}
                style={styles.timericon}
              />
              <Text style={styles.timer}>
                {formatTime(remaining)}
              </Text>
            </ImageBackground>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.workout}>
              <Image
                source={require("@assets/workout/Workoutimg.png")}
                style={styles.workoutimg}
              />
            </View>

            <View style={styles.progress}>
              <Text style={styles.progresstext}>{exerciseName}</Text>
              <View style={styles.progressbox}>
                <WorkoutProgress
                  width={styles.workoutProgress.width}
                  height={styles.workoutProgress.height}
                  percent={progress}
                  animateCircle={true}
                />
                <TouchableOpacity
                  style={styles.progressbtn}
                  onPress={toggleTimer}
                >
                  <ImageBackground
                    source={require("@assets/workout/btnbg.png")}
                    style={styles.progressbtnbg}
                  >
                    <Image
                      source={
                        !isRunning
                          ? require("@assets/workout/start.png")
                          : require("@assets/workout/pause.png")
                      }
                      style={
                        !isRunning
                          ? styles.progressbtniconstart
                          : styles.progressbtniconpause
                      }
                    />
                  </ImageBackground>
                </TouchableOpacity>
                <MaskedView
                  style={styles.progresslabel}
                  maskElement={
                    <View style={styles.progresslabelmaskview}>
                      <Text style={styles.progresslabelmasktext}>
                        {formatTime(remaining)}
                      </Text>
                    </View>
                  }
                >
                  <LinearGradient
                    start={{ x: 0.52, y: -0.15 }}
                    end={{ x: 0.66, y: 1.54 }}
                    colors={["#ffffff", "#8A8CB3"]}
                    style={styles.progresslabelmaskbg}
                  />
                </MaskedView>
              </View>
            </View>

            {Sets > 0 ? (
              <View style={styles.setsInfo}>
                <Text style={styles.setsText}>
                  {Sets} Sets  ·  {reps} Reps
                </Text>
              </View>
            ) : null}

            {_render_next_workout(
              nextExercise,
              require("@assets/workout/Workoutimg2.png"),
              () => {}
            )}

            <TouchableOpacity activeOpacity={0.85} onPress={handleComplete}>
              <LinearGradient
                start={{ x: 0.24, y: -0.09 }}
                end={{ x: 0.5, y: 1 }}
                colors={[Colors.ACCENT_START, Colors.ACCENT_END]}
                style={styles.completeBtn}
              >
                <Text style={styles.completeBtnText}>Complete</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </View>
        <StatusBar style="light" />
      </SafeAreaView>
    </ImageBackground>
  );
}

function useStyle() {
  const styles = useResponsiveStyleSheet({
    container: {
      flex: 1,
    },
    workoutProgress: {
      width: "245@ratio",
      height: "250@ratio",
    },
    container2: {
      flex: 1,
      paddingTop: "39@ratio",
      paddingHorizontal: "16@ratio",
    },
    bg: {
      width: "100%",
      height: "100%",
      backgroundColor: "#1A1735",
    },
    topbar: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: "20@ratio",
    },
    backbuttonimg: {
      width: "44@ratio",
      height: "44@ratio",
      resizeMode: "contain",
    },
    timerbg: {
      width: "92@ratio",
      height: "44@ratio",
      resizeMode: "contain",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
    },
    timericon: {
      width: "24@ratio",
      height: "24@ratio",
      resizeMode: "contain",
    },
    timer: {
      fontFamily: "Gilroy-SemiBold",
      fontSize: "16@ratio",
      color: "#ffffff",
      marginLeft: "7@ratio",
    },
    workout: {
      marginTop: "15@ratio",
    },
    workoutimg: {
      width: "100%",
      height: "230@ratio",
      resizeMode: "cover",
      borderRadius: "16@ratio",
    },
    progress: {
      alignItems: "center",
      justifyContent: "center",
      marginTop: "23@ratio",
    },
    progresstext: {
      fontFamily: "Gilroy-Bold",
      fontSize: "24@ratio",
      color: "#ffffff",
      marginBottom: "20@ratio",
    },
    progressbtn: {
      width: "80@ratio",
      height: "80@ratio",
      borderRadius: Platform.OS == "ios" ? "40@ratio" : "80@ratio",
      position: "absolute",
      bottom: 0,
      left: "83@ratio",
    },
    progressbtnbg: {
      width: "80@ratio",
      height: "80@ratio",
      borderRadius: Platform.OS == "ios" ? "40@ratio" : "80@ratio",
      alignItems: "center",
      justifyContent: "center",
    },
    progressbtniconstart: {
      width: "17@ratio",
      height: "19@ratio",
      resizeMode: "contain",
    },
    progressbtniconpause: {
      width: "17@ratio",
      height: "18@ratio",
      resizeMode: "contain",
    },
    progresslabelmaskbg: {
      minWidth: "200@ratio",
      height: "60@ratio",
    },
    progresslabelmaskview: {
      backgroundColor: "transparent",
      height: "60@ratio",
      alignItems: "center",
    },
    progresslabelmasktext: {
      fontSize: "48@ratio",
      color: "white",
      fontFamily: "Gilroy-Black",
    },
    progresslabel: {
      position: "absolute",
      top: "87@ratio",
      left: "25@ratio",
    },
    setsInfo: {
      alignItems: "center",
      marginTop: "16@ratio",
    },
    setsText: {
      fontFamily: "Gilroy-SemiBold",
      fontSize: "16@ratio",
      color: Colors.TEXT_SECONDARY,
    },
    nextworkoutborder: {
      borderRadius: "16@ratio",
      justifyContent: "center",
      flexDirection: "row",
      alignItems: "center",
      padding: "1@ratio",
      width: "272@ratio",
      height: "65@ratio",
      marginTop: "30@ratio",
      marginBottom: "15@ratio",
      alignSelf: "center",
    },
    nextworkoutinside: {
      width: "100%",
      height: "100%",
      borderRadius: "16@ratio",
      backgroundColor: "#3C3F69",
      paddingHorizontal: "4@ratio",
      paddingVertical: "4@ratio",
      flexDirection: "row",
    },
    nextworkoutimg: {
      width: "57@ratio",
      height: "55@ratio",
      resizeMode: "cover",
      borderRadius: "12@ratio",
      marginRight: "10@ratio",
    },
    nextworkoutdata: {
      flex: 1,
      paddingTop: "6@ratio",
    },
    nextworkoutlabel: {
      fontFamily: "Gilroy-SemiBold",
      fontSize: "14@ratio",
      color: "#8A8CB2",
    },
    nextworkouttitle: {
      fontFamily: "Gilroy-SemiBold",
      fontSize: "18@ratio",
      color: "#ffffff",
    },
    nextbutton: {
      alignSelf: "center",
    },
    nextbuttonimg: {
      width: "44@ratio",
      height: "44@ratio",
      resizeMode: "contain",
    },
    completeBtn: {
      borderRadius: "16@ratio",
      paddingVertical: "16@ratio",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: "32@ratio",
      marginTop: "8@ratio",
      marginHorizontal: "16@ratio",
    },
    completeBtnText: {
      fontFamily: "Gilroy-Bold",
      fontSize: "18@ratio",
      color: Colors.TEXT_PRIMARY,
    },
  });
  return styles;
}

const styles_old = {
  container: { flex: 1 },
  workoutProgress: { width: 245, height: 250 },
  container2: { flex: 1, paddingTop: 39, paddingHorizontal: 16 },
  bg: { width: "100%", height: "100%", backgroundColor: "#1A1735" },
  topbar: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  backbuttonimg: { width: 44, height: 44, resizeMode: "contain" },
  timerbg: { width: 92, height: 44, resizeMode: "contain", justifyContent: "center", alignItems: "center", flexDirection: "row" },
  timericon: { width: 24, height: 24, resizeMode: "contain" },
  timer: { fontFamily: "Gilroy-SemiBold", fontSize: 16, color: "#ffffff", marginLeft: 7 },
  workout: { marginTop: 15 },
  workoutimg: { width: "100%", height: 230, resizeMode: "cover", borderRadius: 16 },
  progress: { alignItems: "center", justifyContent: "center", marginTop: 23 },
  progresstext: { fontFamily: "Gilroy-Bold", fontSize: 24, color: "#ffffff", marginBottom: 20 },
  progressbtn: { width: 80, height: 80, borderRadius: Platform.OS == "ios" ? 40 : 80, position: "absolute", bottom: 0, left: 83 },
  progressbtnbg: { width: 80, height: 80, borderRadius: Platform.OS == "ios" ? 40 : 80, alignItems: "center", justifyContent: "center" },
  progressbtniconstart: { width: 17, height: 19, resizeMode: "contain" },
  progressbtniconpause: { width: 17, height: 18, resizeMode: "contain" },
  progresslabelmaskbg: { minWidth: 200, height: 60 },
  progresslabelmaskview: { backgroundColor: "transparent", height: 60, alignItems: "center" },
  progresslabelmasktext: { fontSize: 48, color: "white", fontFamily: "Gilroy-Black" },
  progresslabel: { position: "absolute", top: 87, left: 25 },
  nextworkoutborder: { borderRadius: 16, justifyContent: "center", flexDirection: "row", alignItems: "center", padding: 1, width: 272, height: 65, marginTop: 46, marginBottom: 15, alignSelf: "center" },
  nextworkoutinside: { width: "100%", height: "100%", borderRadius: 16, backgroundColor: "#3C3F69", paddingHorizontal: 4, paddingVertical: 4, flexDirection: "row" },
  nextworkoutimg: { width: 57, height: 55, resizeMode: "cover", borderRadius: 12, marginRight: 10 },
  nextworkoutdata: { flex: 1, paddingTop: 6 },
  nextworkoutlabel: { fontFamily: "Gilroy-SemiBold", fontSize: 14, color: "#8A8CB2" },
  nextworkouttitle: { fontFamily: "Gilroy-SemiBold", fontSize: 18, color: "#ffffff" },
  nextbutton: { alignSelf: "center" },
  nextbuttonimg: { width: 44, height: 44, resizeMode: "contain" },
};
