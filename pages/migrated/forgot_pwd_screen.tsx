import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { authApi } from '@api/auth';
import { C, FONT } from './theme';

interface ForgotPwdScreenProps {
  navigation?: any;
  route?: any;
}

export default function ForgotPwdScreen(props: ForgotPwdScreenProps) {
  const { navigation } = props;
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const styles = useResponsiveStyleSheet({
    container: { flex: 1, backgroundColor: C.bg },
    scrollContent: { padding: '16@ratio', paddingBottom: '40@ratio' },
    title: { fontSize: '22@ratio', fontFamily: FONT.bold, color: C.white, marginBottom: '12@ratio' },
    subtitle: { fontSize: '14@ratio', fontFamily: FONT.regular, color: C.textSecondary, marginBottom: '24@ratio' },
    label: { fontSize: '14@ratio', fontFamily: FONT.medium, color: C.white, marginBottom: '4@ratio' },
    inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surfaceLight, borderRadius: '12@ratio', borderWidth: 1, borderColor: C.border, marginBottom: '16@ratio' },
    input: { flex: 1, height: '48@ratio', paddingHorizontal: '16@ratio', color: C.white, fontSize: '15@ratio', fontFamily: FONT.regular },
    inputIcon: { paddingHorizontal: '12@ratio' },
    btn: { backgroundColor: C.brand5, borderRadius: '12@ratio', height: '50@ratio', alignItems: 'center', justifyContent: 'center' },
    btnText: { color: C.white, fontSize: '16@ratio', fontFamily: FONT.bold },
    loader: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  });

  const resetPassword = async () => {
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await authApi.forgotPassword({ email: email.trim() });
      Alert.alert('Success', 'Password reset email sent');
      navigation?.goBack();
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Forgot Password</Text>
          <Text style={styles.subtitle}>
            Enter your email address and we will send you a link to reset your password.
          </Text>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor={C.gray50}
              keyboardType="email-address"
              autoCapitalize="none"
              onSubmitEditing={resetPassword}
            />
            <View style={styles.inputIcon}>
              <Ionicons name="mail-outline" size={20} color={C.gray40} />
            </View>
          </View>
          {error ? <Text style={{ color: C.destructive, marginBottom: '8@ratio' }}>{error}</Text> : null}
          <TouchableOpacity style={styles.btn} onPress={resetPassword} activeOpacity={0.8}>
            <Text style={styles.btnText}>Continue</Text>
          </TouchableOpacity>
        </ScrollView>
        {isLoading && (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={C.brand5} />
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
