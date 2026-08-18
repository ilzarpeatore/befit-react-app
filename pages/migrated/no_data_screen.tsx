import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Box } from '@components/ui/box';
import { Text } from '@components/ui/text';

interface NoDataScreenProps {
  navigation?: any;
  route?: any;
}

export default function NoDataScreen(props: NoDataScreenProps) {
  const { route } = props;
  const mTitle = route?.params?.mTitle || 'No data found';

  return (
    <SafeAreaView
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
      className="bg-background"
    >
      <Box style={{ width: 160, height: 160, marginBottom: 16 }} className="rounded-lg bg-secondary" />
      <Text weight="bold" className="text-center">{mTitle}</Text>
    </SafeAreaView>
  );
}
