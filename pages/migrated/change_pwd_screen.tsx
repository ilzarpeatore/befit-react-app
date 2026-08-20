import React, { useState, useRef } from 'react';
import { ScrollView, Alert, Keyboard, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Box } from '@components/ui/box';
import { Text } from '@components/ui/text';
import { Button, ButtonText } from '@components/ui/button';
import { Input, InputField, InputSlot } from '@components/ui/input';
import { Icon } from '@components/ui/icon';
import { Spinner } from '@components/ui/spinner';
import ScreenHeader from '@components/ScreenHeader';
import { authApi } from '@api/auth';
import { C } from './theme';

export default function ChangePwdScreen({ navigation }: any) {

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [oldSecure, setOldSecure] = useState(true);
  const [newSecure, setNewSecure] = useState(true);
  const [confirmSecure, setConfirmSecure] = useState(true);

  // Tipado como `any`: el ref forwarding de InputField (createInput de
  // gluestack) expone un tipo Ref<TextInputProps> en vez de la instancia de
  // TextInput — en runtime sigue siendo el TextInput real (.focus() funciona).
  const newPasswordRef = useRef<any>(null);
  const confirmPasswordRef = useRef<any>(null);

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
    <SafeAreaView style={{ flex: 1 }} className="bg-background" edges={['top']}>
      <ScreenHeader title="Change Password" onBack={() => navigation.goBack()} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text size="sm" muted style={{ marginBottom: 24 }}>
          Please enter your current password and choose a new password.
        </Text>

        {/* Current password */}
        <Text weight="semibold" size="sm" style={{ marginBottom: 6 }}>Current Password</Text>
        <Input className="rounded-sm">
          <InputField
            placeholder="Enter current password"
            value={oldPassword}
            onChangeText={setOldPassword}
            secureTextEntry={oldSecure}
            returnKeyType="next"
            onSubmitEditing={() => newPasswordRef.current?.focus()}
          />
          <InputSlot className="px-3" onPress={() => setOldSecure(!oldSecure)}>
            <Icon name={oldSecure ? 'eye-off-outline' : 'eye-outline'} size={18} className="text-muted-foreground" />
          </InputSlot>
        </Input>

        {/* New password */}
        <Text weight="semibold" size="sm" style={{ marginTop: 16, marginBottom: 6 }}>New Password</Text>
        <Input className="rounded-sm">
          <InputField
            ref={newPasswordRef}
            placeholder="Enter new password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={newSecure}
            returnKeyType="next"
            onSubmitEditing={() => confirmPasswordRef.current?.focus()}
          />
          <InputSlot className="px-3" onPress={() => setNewSecure(!newSecure)}>
            <Icon name={newSecure ? 'eye-off-outline' : 'eye-outline'} size={18} className="text-muted-foreground" />
          </InputSlot>
        </Input>

        {/* Confirm password */}
        <Text weight="semibold" size="sm" style={{ marginTop: 16, marginBottom: 6 }}>Confirm Password</Text>
        <Input className="rounded-sm">
          <InputField
            ref={confirmPasswordRef}
            placeholder="Enter confirm password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={confirmSecure}
            returnKeyType="done"
            onSubmitEditing={changePwd}
          />
          <InputSlot className="px-3" onPress={() => setConfirmSecure(!confirmSecure)}>
            <Icon name={confirmSecure ? 'eye-off-outline' : 'eye-outline'} size={18} className="text-muted-foreground" />
          </InputSlot>
        </Input>

        {confirmPassword.length > 0 && confirmPassword !== newPassword && (
          <Text size="xs" className="text-destructive" style={{ marginTop: 6 }}>Passwords do not match</Text>
        )}

        {/* Submit */}
        <Button onPress={changePwd} className="w-full" style={{ marginTop: 24 }}>
          <ButtonText>Submit</ButtonText>
        </Button>
      </ScrollView>

      {loading && (
        <Box
          style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
          className="items-center justify-center"
        >
          <Spinner size="large" color={C.orange} />
        </Box>
      )}
    </SafeAreaView>
  );
}
