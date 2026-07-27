import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { useAuth } from '@store/AuthContext';
import { C, FONT } from './theme';

const sandowBlack = C.gray80;
const sandowDark = C.gray70;
const sandowGray = C.gray30;
const sandowOrange = C.orange;
const sandowWhite = C.white;

export default function SignUpScreenSandow(props: any) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [obscurePassword, setObscurePassword] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const styles = useStyle();

  const registerUser = async () => {
    if (!firstName.trim()) {
      Alert.alert('Error', 'Please enter your first name');
      return;
    }
    if (!lastName.trim()) {
      Alert.alert('Error', 'Please enter your last name');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    if (!password.trim() || password.trim().length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }
    setIsLoading(true);
    try {
      await register({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        password: password.trim(),
        username: email.trim(),
        user_type: 'LoginUser',
      });
      Alert.alert('Success', 'Account created successfully! Please sign in.');
      props.navigation.navigate('Home', { screen: 'HomePage' });
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
          <TouchableOpacity onPress={() => props.navigation.goBack()} style={s.backBtn}>
            <Ionicons name="chevron-back" size={20} color={sandowGray} />
          </TouchableOpacity>

          <Text style={[s.title, styles.fontBold]}>Create Account</Text>
          <Text style={s.subtitle}>Start your fitness transformation</Text>

          {/* First Name */}
          <Text style={[s.label, styles.fontMedium]}>First Name</Text>
          <View style={s.inputContainer}>
            <Ionicons name="person-outline" size={20} color={sandowGray} style={s.inputIcon} />
            <TextInput
              style={[s.input, styles.fontRegular]}
              placeholder="John"
              placeholderTextColor={sandowGray}
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>

          {/* Last Name */}
          <Text style={[s.label, styles.fontMedium]}>Last Name</Text>
          <View style={s.inputContainer}>
            <Ionicons name="person-outline" size={20} color={sandowGray} style={s.inputIcon} />
            <TextInput
              style={[s.input, styles.fontRegular]}
              placeholder="Doe"
              placeholderTextColor={sandowGray}
              value={lastName}
              onChangeText={setLastName}
            />
          </View>

          {/* Email */}
          <Text style={[s.label, styles.fontMedium]}>Email</Text>
          <View style={s.inputContainer}>
            <Ionicons name="mail-outline" size={20} color={sandowGray} style={s.inputIcon} />
            <TextInput
              style={[s.input, styles.fontRegular]}
              placeholder="john@example.com"
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
              placeholder="Min. 8 characters"
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

          {/* Create Account Button */}
          <TouchableOpacity style={s.createBtn} onPress={registerUser}>
            <Text style={[s.createBtnText, styles.fontSemiBold]}>Create Account</Text>
          </TouchableOpacity>

          {/* Sign In */}
          <View style={s.signInRow}>
            <Text style={[s.signInText, styles.fontRegular]}>Already have an account?</Text>
            <TouchableOpacity onPress={() => props.navigation.goBack()}>
              <Text style={[s.signInLink, styles.fontSemiBold]}> Sign In</Text>
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
  backBtn: { padding: 10, marginBottom: 16 },
  title: { fontSize: 30, fontWeight: '700', color: sandowWhite },
  subtitle: { fontSize: 15, color: sandowGray, marginTop: 8, marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '500', color: sandowWhite, marginTop: 16, marginBottom: 8 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: sandowDark,
    borderRadius: 12,
  },
  inputIcon: { marginLeft: 16 },
  input: { flex: 1, color: sandowWhite, fontSize: 15, paddingHorizontal: 12, paddingVertical: 14 },
  eyeBtn: { padding: 12 },
  createBtn: {
    backgroundColor: sandowOrange,
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  createBtnText: { fontSize: 16, color: sandowWhite, fontWeight: '600' },
  signInRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  signInText: { fontSize: 14, color: sandowGray },
  signInLink: { fontSize: 14, color: sandowOrange, fontWeight: '600' },
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
