import React from 'react';
import { ScrollView } from 'react-native';
import { Box } from '@components/ui/box';
import { Text } from '@components/ui/text';
import { Heading } from '@components/ui/heading';
import { Button } from '@components/ui/button';
import { Icon } from '@components/ui/icon';

export default function PrivacyPolicyScreen(props: any) {

  const privacyPolicy = props.route?.params?.privacyPolicy ?? 'Privacy policy content will be loaded here.';

  return (
    <Box className="flex-1 bg-background">
      <Box style={{ paddingTop: 48, paddingBottom: 12 }} className="flex-row items-center justify-between px-4 bg-card">
        <Button variant="ghost" size="icon" onPress={() => props.navigation?.goBack()}>
          <Icon name="chevron-back" size={24} className="text-foreground" />
        </Button>
        <Heading size="sm">Privacy Policy</Heading>
        <Box className="w-6" />
      </Box>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text muted className="leading-6">{privacyPolicy}</Text>
      </ScrollView>
    </Box>
  );
}
