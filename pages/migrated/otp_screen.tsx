import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';

export default function OTPScreen(props: any) {
  const [mobileNumber, setMobileNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const sendOTP = async () => {
    if (!mobileNumber.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }
    setIsLoading(true);
    try {
      const phoneNumber = `${countryCode}${mobileNumber.trim()}`;
      // NOTE: there is no backend endpoint to actually send/dispatch an OTP SMS code.
      // routes/api.php only exposes `POST social-otp-login` (UserController::socialOTPLogin),
      // which looks up (or creates) a user by phone number - it does not generate or send a
      // verification code. The original flow relied on Firebase Phone Auth (client-side) to
      // deliver the SMS, and this project has no `firebase` dependency installed. Until
      // Firebase Phone Auth (or a dedicated send-otp backend endpoint) is added, this screen
      // cannot really send an OTP; it just forwards the phone number to the verify screen.
      props.navigation?.navigate('MigratedVerifyOtp', { phoneNumber });
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={s.container}>
      <View style={s.appBar}>
        <TouchableOpacity onPress={() => props.navigation?.goBack()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color={C.brand5} />
        </TouchableOpacity>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <Text style={s.title}>Continue with Phone</Text>
        <Text style={s.subtitle}>We will send you a verification code via SMS to verify your phone number.</Text>
        <Text style={s.label}>Phone Number</Text>
        <View style={s.phoneRow}>
          <View style={s.countryCodeBox}>
            <TextInput
              style={s.countryCodeInput}
              value={countryCode}
              onChangeText={setCountryCode}
              keyboardType="phone-pad"
              maxLength={5}
            />
          </View>
          <View style={s.divider} />
          <TextInput
            style={s.phoneInput}
            value={mobileNumber}
            onChangeText={setMobileNumber}
            placeholder="Enter phone number"
            placeholderTextColor={C.gray50}
            keyboardType="phone-pad"
          />
          <View style={s.phoneSuffix}>
            <Ionicons name="call-outline" size={18} color={C.gray40} />
          </View>
        </View>
        <TouchableOpacity style={s.continueBtn} onPress={sendOTP} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator size="small" color={C.white} />
          ) : (
            <Text style={s.continueBtnText}>Continue</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
      {isLoading && (
        <View style={s.loadingOverlay}>
          <ActivityIndicator size="large" color={C.brand5} />
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  appBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 48, paddingBottom: 12, backgroundColor: C.surface },
  backBtn: { padding: 4 },
  content: { padding: 16, paddingTop: 24 },
  title: { fontSize: 22, fontFamily: FONT.bold, color: C.white, marginBottom: 6 },
  subtitle: { fontSize: 14, color: C.gray30, marginBottom: 24 },
  label: { fontSize: 14, color: C.gray30, marginBottom: 6 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surfaceLight, borderRadius: 12, borderWidth: 1, borderColor: C.border, paddingHorizontal: 12, marginBottom: 30 },
  countryCodeBox: { paddingRight: 12 },
  countryCodeInput: { fontSize: 16, fontFamily: FONT.medium, color: C.white, minWidth: 40 },
  divider: { width: 1, height: 24, backgroundColor: C.gray60 },
  phoneInput: { flex: 1, fontSize: 16, fontFamily: FONT.regular, color: C.white, paddingVertical: 14, marginLeft: 12 },
  phoneSuffix: { marginLeft: 8 },
  continueBtn: { backgroundColor: C.brand5, borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  continueBtnText: { fontSize: 16, fontFamily: FONT.semiBold, color: C.white },
  loadingOverlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
});
