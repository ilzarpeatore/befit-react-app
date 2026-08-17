import React, { useState, useEffect } from 'react';
import { ScrollView, Alert, StyleSheet } from 'react-native';
import { Box } from '@components/ui/box';
import { VStack } from '@components/ui/vstack';
import { Text } from '@components/ui/text';
import { Heading } from '@components/ui/heading';
import { Button, ButtonText } from '@components/ui/button';
import { Input, InputField } from '@components/ui/input';
import { Icon } from '@components/ui/icon';
import { Spinner } from '@components/ui/spinner';
import { C } from './theme';

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
    <Box className="flex-1 bg-background">
      <Box style={{ paddingTop: 48, paddingBottom: 12 }} className="flex-row items-center justify-between px-4 bg-card">
        <Button variant="ghost" size="icon" onPress={() => props.navigation?.goBack()}>
          <Icon name="chevron-back" size={24} className="text-foreground" />
        </Button>
        <Box className="w-6" />
      </Box>
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 24 }} keyboardShouldPersistTaps="handled">
        <VStack space="2xl">
          <VStack space="xs">
            <Heading size="lg">Continue with Phone</Heading>
            <Text muted>We will send you a verification code via SMS to verify your phone number.</Text>
          </VStack>

          <VStack space="xs">
            <Text muted>Phone Number</Text>
            <Input className="rounded-sm" size="lg">
              <InputField
                value={countryCode}
                onChangeText={setCountryCode}
                keyboardType="phone-pad"
                maxLength={5}
                className="flex-none w-12"
              />
              <Box className="w-px h-6 bg-border" />
              <InputField
                value={mobileNumber}
                onChangeText={setMobileNumber}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
              />
              <Icon name="call-outline" size={18} className="text-muted-foreground" style={{ marginRight: 12 }} />
            </Input>
          </VStack>

          <Button onPress={sendOTP} disabled={isLoading} radius="pill" className="w-full">
            {isLoading ? <Spinner size="small" color="#FFFFFF" /> : <ButtonText>Continue</ButtonText>}
          </Button>
        </VStack>
      </ScrollView>
      {isLoading && (
        <Box style={StyleSheet.absoluteFill} className="bg-black/50 items-center justify-center">
          <Spinner size="large" color={C.orange} />
        </Box>
      )}
    </Box>
  );
}
