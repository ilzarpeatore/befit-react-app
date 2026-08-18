import React from 'react';
import { ScrollView } from 'react-native';
import { Box } from '@components/ui/box';
import { Text } from '@components/ui/text';
import { Button } from '@components/ui/button';
import { Icon } from '@components/ui/icon';

export default function VideoDetailScreen(props: any) {
  return (
    <Box className="flex-1 bg-background">
      <Box style={{ paddingTop: 50, paddingBottom: 12 }} className="flex-row items-center px-4">
        <Button variant="ghost" size="icon" onPress={() => props.navigation.goBack()}>
          <Icon name="arrow-back" size={24} className="text-foreground" />
        </Button>
      </Box>

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <Box style={{ marginBottom: 16 }} className="w-full h-[200px] bg-secondary items-center justify-center">
          <Icon name="play-circle" size={64} className="text-warning" />
        </Box>

        <Box className="px-2 gap-2">
          <Text size="lg" weight="bold">Title</Text>
          <Text size="sm" muted className="px-2" style={{ lineHeight: 22 }}>
            Exercise instruction content will be displayed here. This section contains detailed
            instructions about the exercise, proper form, and safety guidelines.
          </Text>
        </Box>
      </ScrollView>
    </Box>
  );
}
