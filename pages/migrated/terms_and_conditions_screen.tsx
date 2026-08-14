import React from 'react';
import { ScrollView } from 'react-native';
import { Box } from '@components/ui/box';
import { Text } from '@components/ui/text';
import { Heading } from '@components/ui/heading';
import { Button } from '@components/ui/button';
import { Icon } from '@components/ui/icon';
import { Card } from '@components/ui/card';

export default function TermsAndConditionsScreen(props: any) {
  return (
    <Box className="flex-1 bg-background">
      <Box style={{ paddingTop: 48, paddingBottom: 12 }} className="flex-row items-center px-4 gap-3">
        <Button variant="ghost" size="icon" onPress={() => props.navigation.goBack()}>
          <Icon name="arrow-back" size={24} className="text-foreground" />
        </Button>
        <Heading size="md">Terms of Services</Heading>
      </Box>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
        <Card variant="outline">
          <Text muted className="leading-6">
            {`Terms and Conditions\n\n` +
              `Welcome to MightyFitness. By using our application, you agree to the following terms and conditions.\n\n` +
              `1. Acceptance of Terms\n` +
              `By accessing or using the MightyFitness application, you agree to be bound by these Terms and Conditions.\n\n` +
              `2. Use of the Application\n` +
              `You may use this application for personal, non-commercial purposes only.\n\n` +
              `3. User Accounts\n` +
              `You are responsible for maintaining the confidentiality of your account credentials.\n\n` +
              `4. Privacy\n` +
              `Your use of this application is also governed by our Privacy Policy.\n\n` +
              `5. Subscriptions\n` +
              `Paid plans are arranged and billed outside the app, directly with your coach. This application does not process any payment.`}
          </Text>
        </Card>
      </ScrollView>
    </Box>
  );
}
