import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, FONT } from './theme';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';

export default function VerifyOTPScreen(props: any) {
  const {
    verificationId = '',
    phoneNumber = '',
    isCodeSent = false,
  } = props.route?.params || {};

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
      // Firebase Phone Auth sign-in
      // const credential = PhoneAuthProvider.credential(verificationId, code);
      // await FirebaseAuth.instance.signInWithCredential(credential);
      // Then call socialOtpLogInApi
      const req = {
        email: '',
        username: phoneNumber.replace('+', ''),
        first_name: '',
        last_name: '',
        login_type: 'otp',
        user_type: 'user',
        accessToken: phoneNumber.replace('+', ''),
        phone_number: phoneNumber.replace('+', ''),
        player_id: '',
      };
      // const value = await socialOtpLogInApi(req);
      setIsLoading(false);
      // Navigate based on result
      // if (!value.isUserExist) { navigation.navigate('SignUp', { phoneNumber }); }
      // else { navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] }); }
    } catch (e: any) {
      setIsLoading(false);
      if (e?.toString().includes('invalid_username')) {
        props.navigation.goBack();
        props.navigation.navigate('MigratedSignUp', { phoneNumber: phoneNumber.replace('+', '') });
      } else {
        Alert.alert(e?.toString() || 'Verification failed');
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
