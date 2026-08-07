import React, { useEffect, useRef, useState } from "react";
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  Animated,
  ScrollView,
  Dimensions,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import Linechart from "@components/Linechart";
import { BarchartMem } from "@components/Barchart";
import { CircularProgressMem } from "@components/CircularProgress";
import WaterProgress from "@components/WaterProgress";
import { ChartboxPropsInterface, ChartrowboxPropsInterface } from "./_types/Today.i";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { chartdata as staticChartdata } from "static/Today";
import { dashboardApi, DashboardData } from "@api/dashboard";
const window = Dimensions.get("window");
/**
 * Chartbox
 */
const Chartbox = ({ title, number, unit, chartStyle, children, styles }: ChartboxPropsInterface) => {
  return (
    <LinearGradient
      start={{ x: 0.04, y: -0.1 }}
      end={{ x: 0.09, y: 1.72 }}
      colors={[
        "#E5E5EA",
        "rgba(0,0,0,0)",
        "rgba(0,0,0,0)",
        "#E5E5EA",
      ]}
      locations={[0, 0.348069, 0.596479, 1]}
      style={styles.chartboxborder}
    >
      <View style={styles.chartboxinside}>
        {/*chart title start*/}
        <View style={styles.chartboxtitle}>
          <Text style={styles.chartboxtitleh}>{title}</Text>
          <View style={styles.chartboxtitledata}>
            <Text style={styles.chartboxtitledatanumber}>{number}</Text>
            <Text style={styles.chartboxtitledataunit}>{unit}</Text>
          </View>
        </View>
        {/*chart title end*/}
        {/*chart graph start*/}
        <View style={chartStyle}>{children}</View>
        {/*chart graph end*/}
      </View>
    </LinearGradient>
  );
};
/**
 * Chartrowbox
 */
const Chartrowbox = ({
  title,
  number,
  totalnumber,
  unit,
  children,
  buttonText,
  onPress,
  borderStyle,
  styles
}: ChartrowboxPropsInterface) => {
  return (
    <LinearGradient
      start={{ x: 0.04, y: -0.1 }}
      end={{ x: 0.09, y: 1.72 }}
      colors={[
        "#E5E5EA",
        "rgba(0,0,0,0)",
        "rgba(0,0,0,0)",
        "#E5E5EA",
      ]}
      locations={[0, 0.348069, 0.596479, 1]}
      style={[styles.chartrowboxborder, borderStyle]}
    >
      <View style={styles.chartrowboxinside}>
        {/*chart title start*/}
        <View style={[styles.chartboxtitle, styles.chartrowboxtitle]}>
          {/*chart title*/}
          <Text style={styles.chartboxtitleh}>{title}</Text>
          <View style={styles.chartboxtitledata}>
            {/*chart number*/}
            <Text style={styles.chartboxtitledatanumber}>{number}</Text>
            <Text style={styles.chartboxtitledatadash}>/</Text>
            <View style={styles.chartboxtitledatatotal}>
              {/*chart totalnumber*/}
              <Text style={styles.chartboxtitledatatotalnumber}>
                {totalnumber}
              </Text>
              {/*chart unit*/}
              <Text style={styles.chartboxtitledatatotalunit}>{unit}</Text>
            </View>
          </View>
        </View>
        {/*chart title end*/}
        {/*chart graph start*/}
        <View style={styles.chartboxgraph3}>{children}</View>
        {/*chart graph end*/}
        {/*chart action start*/}
        <TouchableOpacity style={styles.btn} onPress={onPress}>
          {/*chart action btn*/}
          <LinearGradient
            start={{ x: 0.88, y: 1.21 }}
            end={{ x: 0.56, y: 0.5 }}
            colors={["rgba(0,0,0,0.2)", "rgba(0,0,0,0.05)"]}
            style={styles.btnborder}
          >
            <LinearGradient
              start={{ x: 0.24, y: -0.09 }}
              end={{ x: 0.5, y: 1 }}
              colors={["#1C1C1E", "#000000"]}
              style={styles.btnbg}
            >
              <Text style={styles.btntext}>{buttonText}</Text>
            </LinearGradient>
          </LinearGradient>
        </TouchableOpacity>
        {/*chart action end*/}
      </View>
    </LinearGradient>
  );
};
/**
 * Today
 * figma page names : Today
 */
export default function Today({ navigation }: any) {
  const styles = useStyle();
  const [activeaction, setActiveaction] = useState<string>("Today");
  const [weightpercent, setWeightpercent] = useState<number>(65);
  const [waterpercent, setWaterpercent] = useState<number>(75);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const actions_Animx = useRef(new Animated.Value(0)).current;

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

  const chartdata = dashboardData?.weekly_activity
    ? dashboardData.weekly_activity.map((d) => ({ label: d.day, value: d.value }))
    : staticChartdata;
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
    if (name == "Today")
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
    <View style={styles.bg}>
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        {/*toolbar start*/}
        <View style={styles.topbar}>
          {/*toolbar title start*/}
          <View style={styles.title}>
            <MaskedView
              maskElement={
                <View style={styles.masklabelview}>
                  <Text style={styles.masklabeltext}>Daily</Text>
                </View>
              }
            >
              <Image
                source={require("./../assets/pagetitlemask.png")}
                style={styles.masklabelimg}
              />
            </MaskedView>
          </View>
          {/*toolbar title end*/}
          {/*toolbar actions start*/}
          {_render_toolbar_action("Today", "All Days")}
          {/*toolbar actions end*/}
        </View>
        {/*toolbar end*/}
        <ScrollView
          style={styles.containerscroll}
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6B6B70" />
          }
        >
          {/*chart start*/}
          <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate("WorkoutList")}>
          <Chartbox
            title="Weekly Effrot"
            number={45}
            unit="min"
            chartStyle={styles.chartboxgraph}
            styles={styles}
          >
            <Linechart
              chartWidth={styles.Linechart.width}
              chartHeight={styles.Linechart.height}
              chartdata={chartdata}
              showAvg={true}
              showLabels={true}
              AnimateLine={true}
              showGrid={true}
              chartdatamaxvalue={100}
            />
          </Chartbox>
          </TouchableOpacity>
          {/*chart end*/}
          {/*chart start*/}
          <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate("DietDashboard")}>
          <Chartbox
            title="Weekly Calories"
            number={590}
            unit="Kcal"
            chartStyle={styles.chartboxgraph2}
            styles={styles}
          >
            <BarchartMem
              chartWidth={styles.Barchart.width}
              chartHeight={styles.Barchart.height}
              chartBarstrokeWidth={styles.Barchart.borderWidth}
              chartdata={chartdata}
              showAvg={true}
              showLabels={true}
              AnimateBar={true}
            />
          </Chartbox>
          </TouchableOpacity>
          {/*chart end*/}
          {/*nutrition link start*/}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.nutritionLinkCard}
            onPress={() => navigation.navigate("Migrated", { screen: "MigratedRecipeMain" })}
          >
            <LinearGradient
              start={{ x: 0.04, y: -0.1 }}
              end={{ x: 1, y: 1 }}
              colors={["#E5E5EA", "#EBEBF0"]}
              style={styles.nutritionLinkGradient}
            >
              <Text style={styles.nutritionLinkTitle}>Recetas y Nutrición</Text>
              <Text style={styles.nutritionLinkSubtitle}>Explora recetas y tu plan de comidas</Text>
            </LinearGradient>
          </TouchableOpacity>
          {/*nutrition link end*/}
          {/*muscle map link start*/}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.nutritionLinkCard}
            onPress={() => navigation.navigate('Migrated', { screen: 'MigratedViewBodyPart' })}
          >
            <LinearGradient
              start={{ x: 0.04, y: -0.1 }}
              end={{ x: 1, y: 1 }}
              colors={["#E5E5EA", "#EBEBF0"]}
              style={styles.nutritionLinkGradient}
            >
              <Text style={styles.nutritionLinkTitle}>Buscar por músculo</Text>
              <Text style={styles.nutritionLinkSubtitle}>Toca una zona del mapa para ver sus ejercicios</Text>
            </LinearGradient>
          </TouchableOpacity>
          {/*muscle map link end*/}
          {/*chart row start*/}
          <View style={styles.chartboxrow}>
            {/*chart start*/}
            <Chartrowbox
              title="Weight"
              number={590}
              totalnumber={7.6}
              unit="LEFT"
              buttonText="Change"
              onPress={() => {
                setWeightpercent(Math.floor(Math.random() * 100) + 1)
              }}
              borderStyle={{ marginRight: 16 }}
              styles={styles}
            >
              <CircularProgressMem
                width={styles.CircularProgress.width}
                height={styles.CircularProgress.height}
                percent={weightpercent}
                icon={require("./../assets/challenges/weighticon.png")}
              />
            </Chartrowbox>
            {/*chart end*/}
            {/*chart start*/}
            <Chartrowbox
              title="Water"
              number={3}
              totalnumber={5}
              unit="LEFT"
              buttonText="Drink"
              onPress={() => {
                setWaterpercent(Math.floor(Math.random() * 100) + 1) //randomize between 1-100
              }}
              styles={styles}
            >
              <WaterProgress
                width={styles.WaterProgress.width}
                height={styles.WaterProgress.height}
                percent={waterpercent}
              />
            </Chartrowbox>
            {/*chart end*/}
          </View>
        </ScrollView>
        {/*navigation start (remove comment when you don't want to use react native navigation bottom tab)*/}
        {/*<Navigation activepageindex={3} />*/}
        {/*navigation end*/}
        <StatusBar style="dark" />
      </SafeAreaView>
    </View>
  );
}
/**
 * style
 * * note : stylesheet is converted to responsiveStyleSheet because we need to use responsive ratio . if you don't want to use resposive ratio you can use the normal stylesheet version
 */
function useStyle() {
  const styles = useResponsiveStyleSheet({
    Linechart: {
      width: '302@ratio',
      height: '171@ratio'
    },
    Barchart: {
      width: '302@ratio',
      height: '109@ratio',
      borderWidth: '10@ratio'
    },
    CircularProgress: {
      width: '58@ratio',
      height: '58@ratio'
    },
    WaterProgress: {
      width: '58@ratio',
      height: '58@ratio'
    },
    container: {
      flex: 1,
    },
    bg: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
      paddingTop: '44@ratio',
      backgroundColor: "#EBEBF0",
    },
    topbar: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: '16@ratio',
      marginBottom: '15@ratio',
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
      marginLeft: '-20@ratio',
      marginTop: '-37@ratio',
    },
    actions: {
      width: '171@ratio',
      height: '35@ratio',
      borderRadius: '5@ratio',
      backgroundColor: "#E5E5EA",
      flexDirection: "row",
    },
    actionsbg: {
      position: "absolute",
      width: "50%",
      height: '31@ratio',
      borderRadius: '4@ratio',
      backgroundColor: "#FFFFFF",
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
      color: "#6B6B70",
      textAlign: "center",
    },
    actionactive: {
      color: "#000000",
    },
    containerscroll: {
      flex: 1,
      paddingHorizontal: '16@ratio',
    },
    chartboxborder: {
      borderRadius: '16@ratio',
      justifyContent: "center",
      flexDirection: "row",
      alignItems: "center",
      padding: '1@ratio',
      height: '174@ratio',
      marginBottom: '15@ratio',
    },
    chartboxinside: {
      width: "100%",
      height: "100%",
      borderRadius: '16@ratio',
      backgroundColor: "#FFFFFF",
      paddingHorizontal: '8@ratio',
      paddingVertical: '15@ratio',
    },
    chartboxtitle: {
      flexDirection: "row",
      alignItems: "center",
    },
    chartboxtitleh: {
      fontFamily: "Gilroy-Bold",
      fontSize: window.width <= 320 ? '14@ratio' : '16@ratio', //responsive fix
      color: "#000000",
      flex: 1,
    },
    chartboxtitledata: {
      flexDirection: "row",
    },
    chartboxtitledatanumber: {
      fontFamily: "Gilroy-Bold",
      fontSize: window.width <= 320 ? '18@ratio' : '20@ratio', //responsive fix
      color: "#000000",
    },
    chartboxtitledataunit: {
      fontFamily: "Gilroy-Bold",
      fontSize: '12@ratio',
      color: "#6B6B70",
      opacity: 0.5,
      marginLeft: '5@ratio',
      alignSelf: "flex-end",
      marginBottom: '2@ratio',
    },
    chartboxgraph: {
      position: "absolute",
      top: 0,
      left: "50%",
      marginLeft: '-151@ratio',
    },
    chartboxgraph2: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    nutritionLinkCard: {
      borderRadius: '16@ratio',
      overflow: "hidden",
      marginBottom: '16@ratio',
    },
    nutritionLinkGradient: {
      paddingVertical: '16@ratio',
      paddingHorizontal: '16@ratio',
    },
    nutritionLinkTitle: {
      fontFamily: "Gilroy-ExtraBold",
      fontSize: '15@ratio',
      color: "#000000",
    },
    nutritionLinkSubtitle: {
      fontFamily: "Gilroy-Light",
      fontSize: '11@ratio',
      color: "#6B6B70",
      marginTop: '4@ratio',
    },
    chartboxrow: {
      flexDirection: "row",
    },
    chartrowboxborder: {
      flex: 1,
      //@ts-ignore
      borderRadius: '16@ratio',
      justifyContent: "center",
      flexDirection: "row",
      alignItems: "center",
      padding: '1@ratio',
      height: '174@ratio',
      overflow: "hidden",
    },
    chartrowboxinside: {
      width: "100%",
      height: "100%",
      borderRadius: '16@ratio',
      backgroundColor: "#FFFFFF",
      resizeMode: "contain",
    },
    chartrowboxtitle: {
      padding: '8@ratio',
      alignItems: "center",
      justifyContent: "center",
    },
    chartboxtitledatadash: {
      fontFamily: "Gilroy-Bold",
      fontSize: '24@ratio',
      color: "#000000",
    },
    chartboxtitledatatotal: {
      marginLeft: '3@ratio',
    },
    chartboxtitledatatotalnumber: {
      fontFamily: "Gilroy-Bold",
      fontSize: '12@ratio',
      color: "#000000",
    },
    chartboxtitledatatotalunit: {
      fontFamily: "Gilroy-Bold",
      fontSize: '10@ratio',
      color: "#6B6B70",
      opacity: 0.5,
    },
    chartboxgraph3: {
      width: '56@ratio',
      height: '56@ratio',
      alignSelf: "center",
      marginTop: '5@ratio',
    },
    btn: {
      width: '90@ratio',
      height: '45@ratio',
      borderRadius: '12@ratio',
      alignSelf: "center",
      marginTop: '10@ratio',
    },
    btnborder: {
      padding: '1@ratio',
      width: '90@ratio',
      height: '45@ratio',
      borderRadius: '12@ratio',
    },
    btnbg: {
      width: '90@ratio',
      height: '45@ratio',
      borderRadius: '12@ratio',
      justifyContent: "center",
      alignItems: "center",
    },
    btntext: {
      fontFamily: "Gilroy-Bold",
      fontSize: '14@ratio',
      color: "#ffffff",
    },
  });
  return styles;
}

