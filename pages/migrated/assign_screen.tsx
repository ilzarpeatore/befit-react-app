import React, { useState } from 'react';
import { Box } from '@components/ui/box';
import { Text } from '@components/ui/text';
import { Heading } from '@components/ui/heading';
import { Button } from '@components/ui/button';
import { Pressable } from '@components/ui/pressable';
import { Icon } from '@components/ui/icon';

export default function AssignScreen({ navigation }: any) {
  const [select, setSelect] = useState(true);

  return (
    <Box className="flex-1 bg-background">
      <Box style={{ paddingTop: 50, paddingBottom: 14 }} className="flex-row items-center justify-between px-4 bg-card">
        <Button variant="ghost" size="icon" onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={24} className="text-foreground" />
        </Button>
        <Heading size="sm">Plan</Heading>
        <Box className="w-10" />
      </Box>

      {/* Tab bar */}
      <Box className="flex-row px-4 border-b border-border bg-card">
        <Pressable
          className={`flex-1 py-3 items-center border-b-2 ${select ? 'border-primary' : 'border-transparent'}`}
          onPress={() => setSelect(true)}
        >
          <Text weight="semibold" className={select ? 'text-foreground' : 'text-muted-foreground'}>
            Workouts
          </Text>
        </Pressable>
        <Pressable
          className={`flex-1 py-3 items-center border-b-2 ${!select ? 'border-primary' : 'border-transparent'}`}
          onPress={() => setSelect(false)}
        >
          <Text weight="semibold" className={!select ? 'text-foreground' : 'text-muted-foreground'}>
            Diet
          </Text>
        </Pressable>
      </Box>

      {/* Content placeholder */}
      <Box className="flex-1 items-center justify-center">
        {select ? (
          <Box className="items-center gap-3">
            <Icon name="barbell-outline" size={48} className="text-muted-foreground" />
            <Text weight="semibold" muted>Workouts Assign View</Text>
            <Text size="sm" muted>TODO: Integrate ViewWorkoutsScreen</Text>
          </Box>
        ) : (
          <Box className="items-center gap-3">
            <Icon name="nutrition-outline" size={48} className="text-muted-foreground" />
            <Text weight="semibold" muted>Diet Assign View</Text>
            <Text size="sm" muted>TODO: Integrate ViewAllDiet</Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}
