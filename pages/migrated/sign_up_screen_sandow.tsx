import React, { useState } from 'react';
import { ScrollView, SafeAreaView, Alert, StyleSheet } from 'react-native';
import { Box } from '@components/ui/box';
import { VStack } from '@components/ui/vstack';
import { Text } from '@components/ui/text';
import { Heading } from '@components/ui/heading';
import { Button, ButtonText } from '@components/ui/button';
import { Input, InputField } from '@components/ui/input';
import { Icon } from '@components/ui/icon';
import { Spinner } from '@components/ui/spinner';
import { Pressable } from '@components/ui/pressable';
import { useAuth } from '@store/AuthContext';
import { C } from './theme';

export default function SignUpScreenSandow(props: any) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [obscurePassword, setObscurePassword] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  const registerUser = async () => {
    if (!firstName.trim()) {
      Alert.alert('Error', 'Please enter your first name');
      return;
    }
    if (!lastName.trim()) {
      Alert.alert('Error', 'Please enter your last name');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    if (!password.trim() || password.trim().length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }
    setIsLoading(true);
    try {
      await register({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        password: password.trim(),
        username: email.trim(),
        user_type: 'LoginUser',
      });
      Alert.alert('Success', 'Account created successfully! Please sign in.');
      props.navigation.navigate('Home', { screen: 'HomePage' });
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
          <Pressable onPress={() => props.navigation.goBack()} style={{ padding: 10, marginBottom: 16 }}>
            <Icon name="chevron-back" size={20} className="text-muted-foreground" />
          </Pressable>

          <VStack space="2xl">
            <VStack space="xs">
              <Heading size="xl">Create Account</Heading>
              <Text muted>Start your fitness transformation</Text>
            </VStack>

            <VStack space="md">
              {/* First Name */}
              <VStack space="xs">
                <Text weight="medium">First Name</Text>
                <Input size="lg" className="rounded-sm">
                  <Icon name="person-outline" size={20} className="text-muted-foreground" style={{ marginLeft: 16 }} />
                  <InputField
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="John"
                  />
                </Input>
              </VStack>

              {/* Last Name */}
              <VStack space="xs">
                <Text weight="medium">Last Name</Text>
                <Input size="lg" className="rounded-sm">
                  <Icon name="person-outline" size={20} className="text-muted-foreground" style={{ marginLeft: 16 }} />
                  <InputField
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Doe"
                  />
                </Input>
              </VStack>

              {/* Email */}
              <VStack space="xs">
                <Text weight="medium">Email</Text>
                <Input size="lg" className="rounded-sm">
                  <Icon name="mail-outline" size={20} className="text-muted-foreground" style={{ marginLeft: 16 }} />
                  <InputField
                    value={email}
                    onChangeText={setEmail}
                    placeholder="john@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </Input>
              </VStack>

              {/* Password */}
              <VStack space="xs">
                <Text weight="medium">Password</Text>
                <Input size="lg" className="rounded-sm">
                  <Icon name="lock-closed-outline" size={20} className="text-muted-foreground" style={{ marginLeft: 16 }} />
                  <InputField
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Min. 8 characters"
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
              </VStack>
            </VStack>

            {/* Create Account Button */}
            <Button onPress={registerUser} radius="pill" className="w-full">
              <ButtonText>Create Account</ButtonText>
            </Button>

            {/* Sign In */}
            <Box className="flex-row justify-center">
              <Text muted size="sm">Already have an account?</Text>
              <Pressable onPress={() => props.navigation.goBack()}>
                <Text weight="semibold" size="sm" className="text-primary"> Sign In</Text>
              </Pressable>
            </Box>
          </VStack>
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
