import React, { useState } from 'react';
import { ScrollView, KeyboardAvoidingView, Platform, Alert, SafeAreaView, StyleSheet } from 'react-native';
import { Box } from '@components/ui/box';
import { VStack } from '@components/ui/vstack';
import { Text } from '@components/ui/text';
import { Heading } from '@components/ui/heading';
import { Button, ButtonText } from '@components/ui/button';
import { Input, InputField } from '@components/ui/input';
import { Icon } from '@components/ui/icon';
import { Spinner } from '@components/ui/spinner';
import { authApi } from '@api/auth';
import { C } from './theme';

interface ForgotPwdScreenProps {
  navigation?: any;
  route?: any;
}

export default function ForgotPwdScreen(props: ForgotPwdScreenProps) {
  const { navigation } = props;
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <VStack space="lg">
            <VStack space="xs">
              <Heading size="lg">Forgot Password</Heading>
              <Text muted>
                Enter your email address and we will send you a link to reset your password.
              </Text>
            </VStack>

            <VStack space="xs">
              <Text weight="medium">Email</Text>
              <Input className="rounded-sm" size="lg">
                <InputField
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onSubmitEditing={resetPassword}
                />
                <Icon name="mail-outline" size={20} className="text-muted-foreground" style={{ marginRight: 12 }} />
              </Input>
              {error ? <Text className="text-destructive">{error}</Text> : null}
            </VStack>

            <Button onPress={resetPassword} radius="pill" className="w-full">
              <ButtonText>Continue</ButtonText>
            </Button>
          </VStack>
        </ScrollView>
        {isLoading && (
          <Box style={StyleSheet.absoluteFill} className="items-center justify-center">
            <Spinner size="large" color={C.orange} />
          </Box>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
