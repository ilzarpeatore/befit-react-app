import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Box } from '@components/ui/box';
import { Text } from '@components/ui/text';
import { Icon } from '@components/ui/icon';

interface NoInternetScreenProps {
  navigation?: any;
  route?: any;
}

export default function NoInternetScreen(props: NoInternetScreenProps) {
  return (
    <SafeAreaView
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
      className="bg-background"
    >
      <Box
        style={{ width: 160, height: 160, marginBottom: 16 }}
        className="items-center justify-center rounded-lg bg-secondary"
      >
        <Icon name="cloud-offline-outline" size={60} className="text-muted-foreground" />
      </Box>
      <Text weight="bold" size="xl">No Internet Connection</Text>
    </SafeAreaView>
  );
}
