import React, { useCallback, useRef, useState } from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Platform,
  ScrollView,
  TextInputChangeEventData,
  NativeSyntheticEvent,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import MaskedView from "@react-native-masked-view/masked-view";
import { Input } from "@components/input";
import { ButtonMem } from "@components/Button";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { TextInput } from "react-native-gesture-handler";
import { NamePropsInterface } from "./_types/Name.i";
import { useAuth } from "@store/AuthContext";
import { profileApi } from "@api/profile";
/**
 * Name
 * figma page names : Name,Name - Active,Birthday,Birthday - Active
 */
export default function Name({ navigation }: NamePropsInterface) {
  const [step, setStep] = useState<number>(0)
  const [username, setUsername] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const styles = useStyle();
  const yearinputref = useRef<TextInput>(null);
  const monthinputref = useRef<TextInput>(null);
  const dayinputref = useRef<TextInput>(null);
  /**
   * on input change
   * used in birthday inputs to jump to the next input when input value reaches max length
   * @param {Event} e event
   * @param {Ref} ref ref
   * @param {number} maxLength input max lengh
   */
  const onChange = (e: NativeSyntheticEvent<TextInputChangeEventData>, ref: React.RefObject<TextInput | null>, maxLength: number) => {
    if (e.nativeEvent.text.length == maxLength) {
      ref.current?.focus();
    }
  }
  /**
   * render birthday form input
   * @returns view
   */
  const _render_birthday_input = () => {
    return (
      <View style={styles.inputlabelrow}>
        <Input ref={yearinputref} name="year" label="year" maxLength={4} keyboardType="number-pad" style={styles.inputlabelrowitem} inputstyle={styles.inputlabelrowiteminputcenter} inputLabelBgStyle={styles.inputlabelrowitemlabelbg} onChange={(e) => { onChange(e, monthinputref, 4) }} />
        <Input ref={monthinputref} name="month" label="month" maxLength={2} keyboardType="number-pad" style={styles.inputlabelrowitem} inputstyle={styles.inputlabelrowiteminputcenter} inputLabelBgStyle={styles.inputlabelrowitemlabelbg} onChange={(e) => { onChange(e, dayinputref, 2) }} />
        <Input ref={dayinputref} name="day" label="day" maxLength={2} keyboardType="number-pad" style={styles.inputlabelrowitem} inputstyle={styles.inputlabelrowiteminputcenter} inputLabelBgStyle={styles.inputlabelrowitemlabelbg} />
      </View>
    );
  }
  /**
   * render username form input
   * @returns view
   */
  const _render_username_input = () => {
    return (
      <View>
        <Input name="username" label="Your Name" value={username} onChangeText={setUsername} />
      </View>
    );
  }
  /**
   * render form step masks
   * @returns view
   */
  const _render_step_masks = () => {
    switch (step) {
      case 0:
        return <View style={styles.masklabelview}>
          <Text style={styles.masklabeltext}>Welcome</Text>
        </View>;

      default:
        return <View style={styles.masklabelview}>
          <Text style={styles.masklabeltextl}>Your</Text>
          <Text style={styles.masklabeltext}>Birthday</Text>
        </View>
    }
  }
  /**
   * render form step inputs
   * @returns inputs
   */
  const _render_steps_inputs = () => {
    switch (step) {
      case 0:
        return _render_username_input()
      default:
        return _render_birthday_input()
    }
  }
  /**
   * render form header
   * @returns View
   */
  const _render_title = () => {
    switch (step) {
      case 0:
        return (<View style={styles.title}>
          <Text style={styles.titler}>
            Thanks for choosing us...
          </Text>
          <Text style={styles.titleb}>
            Let’s Register you in Befit!
          </Text>
        </View>)

      default:
        return (<View style={styles.title}>
          <Text style={styles.titler}></Text>
          <Text style={styles.titleb}>
            When is your birthday?
          </Text>
        </View>)
    }
  }
  /**
   * next button press
   */
  const nextButtonPress = useCallback(async () => {
    switch (step) {
      case 1:
        navigation.navigate("Unboarding", { screen: "Weight" });
        break;

      default:
        if (!username.trim()) {
          Alert.alert("Error", "Please enter your name");
          return;
        }
        setLoading(true);
        try {
          await profileApi.updateProfile({ display_name: username.trim() });
          setStep((step) => step + 1);
        } catch (err: any) {
          Alert.alert("Error", err.response?.data?.message || "Failed to save name");
        } finally {
          setLoading(false);
        }
        break;
    }
  }, [step, username]);
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
        <View style={styles.container2}>
          {/*page title start*/}
          <MaskedView
            style={styles.masklabel}
            maskElement={_render_step_masks()}
          >
            <Image
              source={require("@assets/pagetitlemask2.png")}
              style={styles.masklabelimg}
            />
          </MaskedView>
          {/*page title end*/}
          <ScrollView contentContainerStyle={styles.containerscroll}>
            {/*title start*/}
            {_render_title()}
            {/*title end*/}
            {/*textinputs start*/}
            <View style={styles.textinputbox}>
              {_render_steps_inputs()}
            </View>
            {/*textinputs end*/}
            {/*actions start*/}
            <View style={styles.actions}>
              {/*action next start*/}
              <ButtonMem onPress={nextButtonPress} text={loading ? " " : "Next"} style={styles.btnsave}>
                {loading ? <ActivityIndicator color="#ffffff" size="small" /> : undefined}
              </ButtonMem>
              {/*action next end*/}
              {/*action skip start*/}
              {step != 0 ? (
                <TouchableOpacity
                  style={styles.skipbtn}>
                  <Text style={styles.skipbtntext}>Skip</Text>
                </TouchableOpacity>
              ) : null}
              {/*action skip end*/}
            </View>
            {/*actions end*/}
          </ScrollView>
        </View>
        <StatusBar style="light" />
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
      paddingTop: '107@ratio',
      flexDirection: "column",
    },
    containerscroll: {
      flex: 1,
      minHeight: '450@ratio',
    },
    bg: {
      width: "100%",
      height: "100%",
      backgroundColor: "#1A1735",
    },
    masklabel: {
      height: '49@ratio',
      marginBottom: '125@ratio',
    },
    masklabelview: {
      backgroundColor: "transparent",
      height: '49@ratio',
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
    },
    masklabeltext: {
      fontSize: '40@ratio',
      color: "white",
      fontFamily: "Gilroy-ExtraBold",
    },
    masklabeltextl: {
      fontSize: '40@ratio',
      color: "white",
      fontFamily: "Gilroy-Light",
      marginRight: '11@ratio',
    },
    masklabelimg: {
      resizeMode: "cover",
      width: "100%",
      height: '200@ratio',
      marginTop: '-55@ratio',
    },
    actions: {
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: '30@ratio',
    },
    skipbtn: {
      marginTop: '30@ratio',
      justifyContent: "center",
      alignItems: "center",
    },
    skipbtntext: {
      fontFamily: "Gilroy-Bold",
      fontSize: '16@ratio',
      color: "#8A8CB2",
    },
    btnsave: {
      width: '300@ratio',
    },
    btnsavetext: {
      fontFamily: "Gilroy-Bold",
      fontSize: '18@ratio',
      color: "#ffffff",
    },
    title: {
      paddingHorizontal: '38@ratio',
    },
    titler: {
      fontFamily: "Gilroy-Regular",
      fontSize: '16@ratio',
      color: "#ffffff",
      lineHeight: '32@ratio'
    },
    titleb: {
      fontFamily: "Gilroy-Bold",
      fontSize: '20@ratio',
      color: "#ffffff",
      lineHeight: '32@ratio'
    },
    textinputbox: {
      flex: 1,
      marginTop: '34@ratio',
      paddingHorizontal: '38@ratio',
    },
    inputborder: {
      height: '61@ratio',
      borderRadius: '16@ratio',
      padding: '1@ratio',
    },
    textinput: {
      width: "100%",
      height: "100%",
      backgroundColor: "#141227",
      borderRadius: '16@ratio',
      fontFamily: "Gilroy-Bold",
      fontSize: '16@ratio',
      paddingHorizontal: '15@ratio',
      lineHeight: '20@ratio',
      color: "#ffffff",
    },
    inputlabelbg: {
      width: Platform.OS == "ios" ? '110@ratio' : '88@ratio', //ios fix
      height: '28@ratio',
      borderRadius: '16@ratio',
      padding: '1@ratio',
      position: "absolute",
      top: '-14@ratio',
      left: '19@ratio',
    },
    inputlabel: {
      width: "100%",
      height: "100%",
      backgroundColor: "#141227",
      borderRadius: '16@ratio',
      fontFamily: "Gilroy-Bold",
      fontSize: '14@ratio',
      color: "#8A8CB2",
      lineHeight: '26@ratio',
      textAlign: "center",
    },
    inputlabelrow: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    inputlabelrowitem: {
      flex: 1,
      marginHorizontal: '4@ratio'
    },
    inputlabelrowiteminputcenter: {
      textAlign: 'center',
      paddingLeft: '12@ratio'
    },
    inputlabelrowitemlabelbg: {
      left: '12@ratio'
    },
    inputlabelrowbg: {
      width: '60@ratio',
      left: '10@ratio',
    },
    textinputrow: {
      textAlign: "center",
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
    paddingTop: 108,
    flexDirection: "column",
  },
  containerscroll: {
    flex: 1,
    minHeight: 450,
  },
  bg: {
    width: "100%",
    height: "100%",
    backgroundColor: "#1A1735",
  },
  masklabel: {
    height: 49,
    marginBottom: 10,
  },
  masklabelview: {
    backgroundColor: "transparent",
    height: 49,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  masklabeltext: {
    fontSize: 40,
    color: "white",
    fontFamily: "Gilroy-ExtraBold",
  },
  masklabeltextl: {
    fontSize: 40,
    color: "white",
    fontFamily: "Gilroy-Light",
    marginRight: 11,
  },
  masklabelimg: {
    resizeMode: "cover",
    width: "100%",
    height: 200,
    marginTop: -55,
  },
  btn: {
    width: 64,
    height: 64,
    borderRadius: 18,
    marginHorizontal: 11,
  },
  btnborder: {
    padding: 1,
    width: 64,
    height: 64,
    borderRadius: 18,
  },
  btnbg: {
    width: 64,
    height: 64,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  btnimg: {
    width: 40,
    height: 40,
  },
  actions: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  skipbtn: {
    marginTop: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  skipbtntext: {
    fontFamily: "Gilroy-Bold",
    fontSize: 16,
    color: "#8A8CB2",
  },
  btnsave: {
    width: 300,
  },
  btnsavetext: {
    fontFamily: "Gilroy-Bold",
    fontSize: 18,
    color: "#ffffff",
  },
  title: {
    marginTop: 54,
    paddingHorizontal: 38,
  },
  titler: {
    fontFamily: "Gilroy-Regular",
    fontSize: 18,
    color: "#ffffff",
  },
  titleb: {
    fontFamily: "Gilroy-Bold",
    fontSize: 24,
    color: "#ffffff",
    marginTop: 10,
  },
  textinputbox: {
    flex: 1,
    marginTop: 42,
    paddingHorizontal: 38,
  },
  inputborder: {
    height: 61,
    borderRadius: 16,
    padding: 1,
  },
  textinput: {
    width: "100%",
    height: "100%",
    backgroundColor: "#141227",
    borderRadius: 16,
    fontFamily: "Gilroy-Bold",
    fontSize: 18,
    paddingHorizontal: 12,
    color: "#ffffff",
  },
  inputlabelbg: {
    width: Platform.OS == "ios" ? 110 : 88, //ios fix
    height: 28,
    borderRadius: 16,
    padding: 1,
    position: "absolute",
    top: -14,
    left: 19,
  },
  inputlabel: {
    width: "100%",
    height: "100%",
    backgroundColor: "#141227",
    borderRadius: 16,
    fontFamily: "Gilroy-Bold",
    fontSize: 14,
    color: "#8A8CB2",
    lineHeight: 26,
    textAlign: "center",
  },
  inputlabelrow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  inputlabelrowitem: {
    flexBasis: "30.5%",
    marginHorizontal: "1.25%",
  },
  inputlabelrowbg: {
    width: 60,
    left: 10,
  },
  textinputrow: {
    textAlign: "center",
  },
});
