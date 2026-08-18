import React, { useState, useEffect } from 'react';
import { ScrollView, SafeAreaView, Alert, StyleSheet } from 'react-native';
import { Box } from '@components/ui/box';
import { HStack } from '@components/ui/hstack';
import { Text } from '@components/ui/text';
import { Heading } from '@components/ui/heading';
import { Button, ButtonText } from '@components/ui/button';
import { Input, InputField } from '@components/ui/input';
import { Icon } from '@components/ui/icon';
import { Spinner } from '@components/ui/spinner';
import { Pressable } from '@components/ui/pressable';
import { useAuth } from '@store/AuthContext';
import { C } from './theme';

interface Props {
  showBack?: boolean;
}

export default function SignInScreenSandow(props: any) {
  const showBack = props.route?.params?.showBack ?? true;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [obscurePassword, setObscurePassword] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    initRemembered();
  }, []);

  const initRemembered = async () => {
    // if (getBoolAsync(IS_REMEMBER)) {
    //   setEmail(getStringAsync(EMAIL));
    //   setPassword(getStringAsync(PASSWORD));
    // }
  };

  const save = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }
    setIsLoading(true);
    try {
      await login({ email: email.trim(), password: password.trim() });
      props.navigation.replace('Home', { screen: 'HomePage' });
    } catch (e: any) {
      // toast(e.toString());
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = async () => {
    setIsLoading(true);
    try {
      // await signInWithGoogle();
      // setValue(IS_SOCIAL, true);
      // getUSerDetail, then navigate
      props.navigation.navigate('Home', { screen: 'HomePage' });
    } catch (e: any) {
      // toast(e.toString());
    } finally {
      setIsLoading(false);
    }
  };

  const appleLogin = async () => {
    setIsLoading(true);
    try {
      // await appleLogIn();
      // setValue(IS_SOCIAL, true);
    } catch (e: any) {
      // toast(e.toString());
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Box className="flex-1">
        <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 8, paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
          {showBack && (
            <Pressable onPress={() => props.navigation.goBack()} style={{ padding: 10, marginBottom: 24 }}>
              <Icon name="chevron-back" size={20} className="text-muted-foreground" />
            </Pressable>
          )}

          <Heading size="2xl" style={{ lineHeight: 40 }}>
            {'Welcome to\nBe Stronger!'}
          </Heading>
          <Text muted style={{ marginTop: 12 }}>
            Sign in to continue your fitness journey
          </Text>

          {/* Email */}
          <Text weight="medium" style={{ marginTop: 32, marginBottom: 8 }}>Email</Text>
          <Input size="lg" className="rounded-sm">
            <Icon name="mail-outline" size={20} className="text-muted-foreground" style={{ marginLeft: 16 }} />
            <InputField
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </Input>

          {/* Password */}
          <Text weight="medium" style={{ marginTop: 32, marginBottom: 8 }}>Password</Text>
          <Input size="lg" className="rounded-sm">
            <Icon name="lock-closed-outline" size={20} className="text-muted-foreground" style={{ marginLeft: 16 }} />
            <InputField
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry={obscurePassword}
            />
            <Pressable onPress={() => setObscurePassword((p) => !p)} style={{ padding: 12 }}>
              <Icon
                name={obscurePassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                className="text-muted-foreground"
              />
            </Pressable>
          </Input>

          {/* Remember Me / Forgot Password */}
          <Box className="flex-row justify-between items-center" style={{ marginTop: 16 }}>
            <Pressable className="flex-row items-center" onPress={() => setRememberMe((p) => !p)}>
              <Box className={`w-5 h-5 rounded items-center justify-center border ${rememberMe ? 'bg-primary border-primary' : 'border-border'}`}>
                {rememberMe && <Icon name="checkmark" size={12} className="text-primary-foreground" />}
              </Box>
              <Text muted size="sm" style={{ marginLeft: 8 }}>Remember me</Text>
            </Pressable>
            <Pressable onPress={() => props.navigation.navigate('MigratedForgotPwd')}>
              <Text weight="medium" size="sm" className="text-primary">Forgot Password?</Text>
            </Pressable>
          </Box>

          {/* Sign In Button */}
          <Button onPress={save} radius="pill" className="w-full" style={{ marginTop: 32 }}>
            <ButtonText>Sign In</ButtonText>
          </Button>

          {/* Or Divider */}
          <Box className="flex-row items-center" style={{ marginTop: 24 }}>
            <Box className="flex-1 h-px bg-border" />
            <Text muted size="sm" className="mx-4">or</Text>
            <Box className="flex-1 h-px bg-border" />
          </Box>

          {/* Social Buttons */}
          <HStack space="lg" className="justify-center" style={{ marginTop: 24 }}>
            <Pressable
              className="rounded-md bg-secondary items-center justify-center"
              style={{ width: 52, height: 52 }}
              onPress={() => props.navigation.navigate('MigratedOTP')}
            >
              <Icon name="phone-portrait-outline" size={28} className="text-foreground" />
            </Pressable>
            <Pressable
              className="rounded-md bg-secondary items-center justify-center"
              style={{ width: 52, height: 52 }}
              onPress={googleLogin}
            >
              <Icon name="logo-google" size={28} className="text-foreground" />
            </Pressable>
            <Pressable
              className="rounded-md bg-secondary items-center justify-center"
              style={{ width: 52, height: 52 }}
              onPress={appleLogin}
            >
              <Icon name="logo-apple" size={28} className="text-foreground" />
            </Pressable>
          </HStack>

          {/* Sign Up */}
          <Box className="flex-row justify-center" style={{ marginTop: 32 }}>
            <Text muted size="sm">New user?</Text>
            <Pressable onPress={() => props.navigation.navigate('MigratedSignUpSandow')}>
              <Text weight="semibold" size="sm" className="text-primary"> Sign Up</Text>
            </Pressable>
          </Box>
        </ScrollView>

        {isLoading && (
          <Box style={StyleSheet.absoluteFill} className="bg-black/50 items-center justify-center">
            <Spinner size="large" color={C.orange} />
          </Box>
        )}
      </Box>
    </SafeAreaView>
  );
}
