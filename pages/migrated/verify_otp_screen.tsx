import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { C, FONT } from './theme';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { authApi } from '@api/auth';
import { useAuth } from '@store/AuthContext';

export default function VerifyOTPScreen(props: any) {
  const {
    verificationId = '',
    phoneNumber = '',
    isCodeSent = false,
  } = props.route?.params || {};
  const { restoreToken } = useAuth();

  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);

  const handleDigitChange = (text: string, index: number) => {
    if (text.length > 1) text = text.slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = text;
    setOtpDigits(newDigits);
    setOtpCode(newDigits.join(''));
    if (text && index < 5) {
      // Auto-focus next input would require refs
    }
  };

  const submit = async () => {
    const code = otpDigits.join('');
    if (code.length < 6) {
      Alert.alert('Please enter the complete 6-digit code');
      return;
    }
    setIsLoading(true);
    try {
      // NOTE: the backend's `social-otp-login` endpoint (UserController::socialOTPLogin)
      // does not actually validate `code` against anything server-side — it only looks up
      // (or creates) a user by phone number. Real SMS code delivery/verification would
      // require a client-side provider (e.g. Firebase Phone Auth), which is not installed
      // in this project (no `firebase` dependency, see otp_screen.tsx). This call still
      // reflects the only real endpoint available for this flow.
      const cleanPhone = phoneNumber.replace('+', '');
      const req = {
        email: '',
        username: cleanPhone,
        first_name: '',
        last_name: '',
        login_type: 'mobile',
        user_type: 'user',
        accessToken: cleanPhone,
        phone_number: cleanPhone,
        player_id: '',
      };
      const response = await authApi.socialOtpLogin(req);
      const value = response.data;
      setIsLoading(false);

      if (value.is_user_exist === false) {
        // No account exists yet for this phone number - continue to sign up.
        props.navigation.navigate('MigratedSignUpSandow', { phoneNumber: cleanPhone });
        return;
      }

      if (value.data) {
        const userData: any = value.data;
        await AsyncStorage.setItem('TOKEN', userData.api_token);
        await AsyncStorage.setItem('USER', JSON.stringify(userData));
        await restoreToken();
        props.navigation.replace('Home', { screen: 'HomePage' });
      }
    } catch (e: any) {
      setIsLoading(false);
      const message = e?.response?.data?.message || e?.toString();
      if (message?.includes('invalid_username')) {
        props.navigation.goBack();
        props.navigation.navigate('MigratedSignUpSandow', { phoneNumber: phoneNumber.replace('+', '') });
      } else {
        Alert.alert(message || 'Verification failed');
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <View style={styles.appBar}>
          <TouchableOpacity onPress={() => props.navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={C.white} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.subtitle}>Code sent to {phoneNumber}</Text>

          <View style={styles.otpRow}>
            {otpDigits.map((digit, index) => (
              <TextInput
                key={index}
                style={styles.otpInput}
                value={digit}
                onChangeText={(text) => handleDigitChange(text, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>

          <TouchableOpacity style={styles.verifyButton} onPress={submit}>
            <Text style={styles.verifyButtonText}>Verify & Proceed</Text>
          </TouchableOpacity>
        </ScrollView>

        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={C.brand5} />
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
  },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 32 },
  title: { fontSize: 22, fontFamily: FONT.bold, color: C.white, marginBottom: 8 },
  subtitle: { fontSize: 14, color: C.gray30, fontFamily: FONT.regular, marginBottom: 30 },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 30,
  },
  otpInput: {
    width: 48,
    height: 50,
    borderWidth: 1,
    borderColor: C.gray50,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 20,
    fontFamily: FONT.regular,
    color: C.white,
    backgroundColor: C.surface,
  },
  verifyButton: {
    backgroundColor: C.brand5,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  verifyButtonText: { fontSize: 16, fontFamily: FONT.bold, color: C.white },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
