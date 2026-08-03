import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, SafeAreaView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { useAuth } from '@store/AuthContext';
import { C, FONT } from './theme';

interface Props {
  showBack?: boolean;
}

const sandowBlack = C.gray80;
const sandowDark = C.gray70;
const sandowGray = C.gray30;
const sandowOrange = C.orange;
const sandowWhite = C.white;

export default function SignInScreenSandow(props: any) {
  const showBack = props.route?.params?.showBack ?? true;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [obscurePassword, setObscurePassword] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const styles = useStyle();

  useEffect(() => {
    initRemembered();
  }, []);

  const initRemembered = async () => {
    // if (getBoolAsync(IS_REMEMBER)) {
    //   setEmail(getStringAsync(EMAIL));
    //   setPassword(getStringAsync(PASSWORD));
    // }
  };

  const save = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }
    setIsLoading(true);
    try {
      await login({ email: email.trim(), password: password.trim() });
      props.navigation.replace('Home', { screen: 'HomePage' });
    } catch (e: any) {
      // toast(e.toString());
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = async () => {
    setIsLoading(true);
    try {
      // await signInWithGoogle();
      // setValue(IS_SOCIAL, true);
      // getUSerDetail, then navigate
      props.navigation.navigate('Home', { screen: 'HomePage' });
    } catch (e: any) {
      // toast(e.toString());
    } finally {
      setIsLoading(false);
    }
  };

  const appleLogin = async () => {
    setIsLoading(true);
    try {
      // await appleLogIn();
      // setValue(IS_SOCIAL, true);
    } catch (e: any) {
      // toast(e.toString());
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.body}>
        <ScrollView contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">
          {showBack && (
            <TouchableOpacity onPress={() => props.navigation.goBack()} style={s.backBtn}>
              <Ionicons name="chevron-back" size={20} color={sandowGray} />
            </TouchableOpacity>
          )}

          <Text style={[s.welcomeTitle, styles.fontBold]}>
            {'Welcome to\nBe Stronger!'}
          </Text>
          <Text style={[s.welcomeSubtitle, styles.fontRegular]}>
            Sign in to continue your fitness journey
          </Text>

          {/* Email */}
          <Text style={[s.label, styles.fontMedium]}>Email</Text>
          <View style={s.inputContainer}>
            <Ionicons name="mail-outline" size={20} color={sandowGray} style={s.inputIcon} />
            <TextInput
              style={[s.input, styles.fontRegular]}
              placeholder="Enter your email"
              placeholderTextColor={sandowGray}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password */}
          <Text style={[s.label, styles.fontMedium]}>Password</Text>
          <View style={s.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={sandowGray} style={s.inputIcon} />
            <TextInput
              style={[s.input, styles.fontRegular]}
              placeholder="Enter your password"
              placeholderTextColor={sandowGray}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={obscurePassword}
            />
            <TouchableOpacity onPress={() => setObscurePassword((p) => !p)} style={s.eyeBtn}>
              <Ionicons
                name={obscurePassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={sandowGray}
              />
            </TouchableOpacity>
          </View>

          {/* Remember Me / Forgot Password */}
          <View style={s.rememberRow}>
            <TouchableOpacity
              style={s.rememberCheck}
              onPress={() => setRememberMe((p) => !p)}
            >
              <View style={[s.checkbox, rememberMe && s.checkboxActive]}>
                {rememberMe && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
              </View>
              <Text style={[s.rememberText, styles.fontRegular]}>Remember me</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => props.navigation.navigate('MigratedForgotPwd')}>
              <Text style={[s.forgotText, styles.fontMedium]}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {/* Sign In Button */}
          <TouchableOpacity style={s.signInBtn} onPress={save}>
            <Text style={[s.signInBtnText, styles.fontSemiBold]}>Sign In</Text>
          </TouchableOpacity>

          {/* Or Divider */}
          <View style={s.orDivider}>
            <View style={s.dividerLine} />
            <Text style={[s.orText, styles.fontRegular]}>or</Text>
            <View style={s.dividerLine} />
          </View>

          {/* Social Buttons */}
          <View style={s.socialRow}>
            <TouchableOpacity style={s.socialBtn} onPress={() => props.navigation.navigate('MigratedOTP')}>
              <Ionicons name="phone-portrait-outline" size={28} color={sandowWhite} />
            </TouchableOpacity>
            <TouchableOpacity style={s.socialBtn} onPress={googleLogin}>
              <Ionicons name="logo-google" size={28} color={sandowWhite} />
            </TouchableOpacity>
            <TouchableOpacity style={s.socialBtn} onPress={appleLogin}>
              <Ionicons name="logo-apple" size={28} color={sandowWhite} />
            </TouchableOpacity>
          </View>

          {/* Sign Up */}
          <View style={s.signUpRow}>
            <Text style={[s.signUpText, styles.fontRegular]}>New user?</Text>
            <TouchableOpacity onPress={() => props.navigation.navigate('MigratedSignUpSandow')}>
              <Text style={[s.signUpLink, styles.fontSemiBold]}> Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {isLoading && (
          <View style={s.loadingOverlay}>
            <ActivityIndicator size="large" color={sandowOrange} />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: sandowBlack },
  body: { flex: 1 },
  scrollContent: { padding: 24, paddingTop: 8, paddingBottom: 24 },
  backBtn: { padding: 10, marginBottom: 24 },
  welcomeTitle: { fontSize: 32, fontWeight: '700', color: sandowWhite, lineHeight: 40 },
  welcomeSubtitle: { fontSize: 15, color: sandowGray, marginTop: 12 },
  label: { fontSize: 14, fontWeight: '500', color: sandowWhite, marginTop: 32, marginBottom: 8 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: sandowDark,
    borderRadius: 12,
  },
  inputIcon: { marginLeft: 16 },
  input: { flex: 1, color: sandowWhite, fontSize: 15, paddingHorizontal: 12, paddingVertical: 14 },
  eyeBtn: { padding: 12 },
  rememberRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 },
  rememberCheck: { flexDirection: 'row', alignItems: 'center' },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: sandowOrange,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: { backgroundColor: sandowOrange },
  rememberText: { fontSize: 13, color: sandowGray, marginLeft: 8 },
  forgotText: { fontSize: 13, color: sandowOrange, fontWeight: '500' },
  signInBtn: {
    backgroundColor: sandowOrange,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 32,
    height: 52,
    justifyContent: 'center',
  },
  signInBtnText: { fontSize: 16, color: '#FFFFFF', fontWeight: '600' },
  orDivider: { flexDirection: 'row', alignItems: 'center', marginTop: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: sandowDark },
  orText: { fontSize: 13, color: sandowGray, marginHorizontal: 16 },
  socialRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24, gap: 16 },
  socialBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: sandowDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  signUpText: { fontSize: 14, color: sandowGray },
  signUpLink: { fontSize: 14, color: sandowOrange, fontWeight: '600' },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

function useStyle() {
  return useResponsiveStyleSheet({
    fontBold: { fontFamily: FONT.bold },
    fontMedium: { fontFamily: FONT.medium },
    fontRegular: { fontFamily: FONT.regular },
    fontSemiBold: { fontFamily: FONT.semiBold },
  });
}
