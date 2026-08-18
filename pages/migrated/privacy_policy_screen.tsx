import React from 'react';
import { ScrollView } from 'react-native';
import { Box } from '@components/ui/box';
import { Text } from '@components/ui/text';
import ScreenHeader from '@components/ScreenHeader';

export default function PrivacyPolicyScreen(props: any) {

  const privacyPolicy = props.route?.params?.privacyPolicy ?? 'Privacy policy content will be loaded here.';

  return (
    <Box className="flex-1 bg-background">
      <ScreenHeader title="Privacy Policy" onBack={() => props.navigation?.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text muted className="leading-6">{privacyPolicy}</Text>
      </ScrollView>
    </Box>
  );
}
