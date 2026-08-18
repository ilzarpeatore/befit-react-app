import React, { useState } from 'react';
import { ScrollView, Alert, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Box } from '@components/ui/box';
import { VStack } from '@components/ui/vstack';
import { Text } from '@components/ui/text';
import { Heading } from '@components/ui/heading';
import { Button, ButtonText } from '@components/ui/button';
import { Input, InputField } from '@components/ui/input';
import { Icon } from '@components/ui/icon';
import { Spinner } from '@components/ui/spinner';
import { C } from './theme';
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
      <Box className="flex-1 bg-background">
        <Box style={{ paddingTop: 50, paddingBottom: 12 }} className="flex-row items-center px-4">
          <Button variant="ghost" size="icon" onPress={() => props.navigation.goBack()}>
            <Icon name="arrow-back" size={24} className="text-foreground" />
          </Button>
        </Box>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
          <VStack space="2xl">
            <VStack space="xs">
              <Heading size="lg">Verify OTP</Heading>
              <Text muted>Code sent to {phoneNumber}</Text>
            </VStack>

            <Box className="flex-row justify-center gap-2.5">
              {otpDigits.map((digit, index) => (
                <Input key={index} className="w-12 h-[50px] rounded-sm" size="lg">
                  <InputField
                    value={digit}
                    onChangeText={(text) => handleDigitChange(text, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                    className="text-center px-0"
                  />
                </Input>
              ))}
            </Box>

            <Button onPress={submit} radius="pill" className="w-full">
              <ButtonText>Verify & Proceed</ButtonText>
            </Button>
          </VStack>
        </ScrollView>

        {isLoading && (
          <Box style={StyleSheet.absoluteFill} className="bg-black/30 items-center justify-center">
            <Spinner size="large" color={C.orange} />
          </Box>
        )}
      </Box>
    </KeyboardAvoidingView>
  );
}
