import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Keyboard, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { authApi } from '@api/auth';
import { C, FONT } from './theme';

export default function ChangePwdScreen({ navigation }: any) {

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [oldSecure, setOldSecure] = useState(true);
  const [newSecure, setNewSecure] = useState(true);
  const [confirmSecure, setConfirmSecure] = useState(true);

  const newPasswordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const changePwd = async () => {
    Keyboard.dismiss();
    if (!oldPassword.trim()) {
      Alert.alert('Error', 'Please enter your current password');
      return;
    }
    if (!newPassword.trim()) {
      Alert.alert('Error', 'Please enter a new password');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    if (newPassword.trim() !== confirmPassword.trim()) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await authApi.changePassword({ old_password: oldPassword.trim(), new_password: newPassword.trim() });
      setLoading(false);
      Alert.alert('Success', 'Password changed successfully');
      navigation.goBack();
    } catch (e: any) {
      setLoading(false);
      Alert.alert('Error', e?.message ?? 'Failed to change password');
    }
  };

  return (
    <View style={styles_local.container}>
      <View style={styles_local.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles_local.backBtn}>
          <Ionicons name="chevron-back" size={24} color={C.white} />
        </TouchableOpacity>
        <Text style={styles_local.headerTitle}>Change Password</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles_local.body}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles_local.subtitle}>
          Please enter your current password and choose a new password.
        </Text>

        {/* Current password */}
        <Text style={styles_local.label}>Current Password</Text>
        <View style={styles_local.inputWrap}>
          <TextInput
            style={styles_local.input}
            placeholder="Enter current password"
            placeholderTextColor={C.gray50}
            value={oldPassword}
            onChangeText={setOldPassword}
            secureTextEntry={oldSecure}
            returnKeyType="next"
            onSubmitEditing={() => newPasswordRef.current?.focus()}
          />
          <TouchableOpacity style={styles_local.eyeBtn} onPress={() => setOldSecure(!oldSecure)}>
            <Ionicons name={oldSecure ? 'eye-off-outline' : 'eye-outline'} size={18} color={C.gray40} />
          </TouchableOpacity>
        </View>

        {/* New password */}
        <Text style={[styles_local.label, { marginTop: 16 }]}>New Password</Text>
        <View style={styles_local.inputWrap}>
          <TextInput
            ref={newPasswordRef}
            style={styles_local.input}
            placeholder="Enter new password"
            placeholderTextColor={C.gray50}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={newSecure}
            returnKeyType="next"
            onSubmitEditing={() => confirmPasswordRef.current?.focus()}
          />
          <TouchableOpacity style={styles_local.eyeBtn} onPress={() => setNewSecure(!newSecure)}>
            <Ionicons name={newSecure ? 'eye-off-outline' : 'eye-outline'} size={18} color={C.gray40} />
          </TouchableOpacity>
        </View>

        {/* Confirm password */}
        <Text style={[styles_local.label, { marginTop: 16 }]}>Confirm Password</Text>
        <View style={styles_local.inputWrap}>
          <TextInput
            ref={confirmPasswordRef}
            style={styles_local.input}
            placeholder="Enter confirm password"
            placeholderTextColor={C.gray50}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={confirmSecure}
            returnKeyType="done"
            onSubmitEditing={changePwd}
          />
          <TouchableOpacity style={styles_local.eyeBtn} onPress={() => setConfirmSecure(!confirmSecure)}>
            <Ionicons name={confirmSecure ? 'eye-off-outline' : 'eye-outline'} size={18} color={C.gray40} />
          </TouchableOpacity>
        </View>

        {confirmPassword.length > 0 && confirmPassword !== newPassword && (
          <Text style={styles_local.errorText}>Passwords do not match</Text>
        )}

        {/* Submit */}
        <TouchableOpacity style={styles_local.submitBtn} onPress={changePwd} activeOpacity={0.8}>
          <Text style={styles_local.submitText}>Submit</Text>
        </TouchableOpacity>
      </ScrollView>

      {loading && (
        <View style={styles_local.loadingOverlay}>
          <ActivityIndicator size="large" color={C.orange} />
        </View>
      )}
    </View>
  );
}

const styles_local = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 14,
    backgroundColor: C.surface,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontFamily: FONT.bold, color: C.white },
  body: { flex: 1 },
  subtitle: { fontSize: 14, fontFamily: FONT.regular, color: C.gray30, marginBottom: 24 },
  label: { fontSize: 14, fontFamily: FONT.semiBold, color: C.textPrimary, marginBottom: 6 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surfaceLight,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: C.white,
    fontFamily: FONT.regular,
    fontSize: 14,
  },
  eyeBtn: { paddingHorizontal: 12 },
  errorText: { fontSize: 12, fontFamily: FONT.regular, color: C.destructive, marginTop: 6 },
  submitBtn: {
    backgroundColor: C.brand5,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  submitText: { fontSize: 16, fontFamily: FONT.semiBold, color: C.white },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
