import React from "react";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Box } from "@components/ui/box";
import { Text } from "@components/ui/text";
import { Heading } from "@components/ui/heading";
import { HStack } from "@components/ui/hstack";
import { VStack } from "@components/ui/vstack";
import { Pressable } from "@components/ui/pressable";
import { Button, ButtonText } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Icon } from "@components/ui/icon";

const PROMPTS = [
  {
    title: "Set up your Sandow Score",
    desc: "Complete your profile to get a personalized fitness score",
    icon: "trophy",
    action: "Setup",
    tint: "warning",
  },
  {
    title: "Add your first metric",
    desc: "Track heart rate, steps, weight and more",
    icon: "stats-chart",
    action: "Add",
    tint: "default",
  },
  {
    title: "Start a workout",
    desc: "Begin your first training session today",
    icon: "barbell",
    action: "Start",
    tint: "success",
  },
] as const;

const TINT_STYLES: Record<string, { iconBg: string; iconColor: string; text: string }> = {
  warning: { iconBg: "bg-warning", iconColor: "text-warning-foreground", text: "text-warning" },
  success: { iconBg: "bg-success", iconColor: "text-success-foreground", text: "text-success" },
  default: { iconBg: "bg-secondary", iconColor: "text-foreground", text: "text-foreground" },
};

const NAV_ITEMS = [
  { icon: "home", label: "Home", active: true },
  { icon: "stats-chart", label: "Metrics", active: false },
  { icon: "fitness", label: "Workouts", active: false },
  { icon: "person", label: "Profile", active: false },
] as const;

export default function HomeEmptyScreen({ navigation }: any) {
  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-background">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        <VStack space="xl">
          <HStack className="items-center justify-between">
            <VStack space="xs">
              <Heading size="xl">Welcome back!</Heading>
              <Text size="sm" muted>Let's get you started</Text>
            </VStack>
            <Pressable className="w-11 h-11 rounded-sm bg-card border border-border items-center justify-center">
              <Icon name="notifications-outline" size={22} className="text-foreground" />
            </Pressable>
          </HStack>

          <Card variant="outline">
            <VStack space="xs" className="items-center">
              <Icon name="trophy" size={32} className="text-warning" />
              <Text size="sm" muted>Sandow Score</Text>
              <Text size="2xl" weight="extrabold">--</Text>
              <Text size="xs" muted>Complete setup to unlock</Text>
            </VStack>
          </Card>

          <VStack space="md">
            <Heading size="sm">Get Started</Heading>
            {PROMPTS.map((p, i) => {
              const tint = TINT_STYLES[p.tint];
              return (
                <Card key={i} variant="outline">
                  <HStack space="md" className="items-center">
                    <Box className={`w-12 h-12 rounded-sm items-center justify-center ${tint.iconBg}`}>
                      <Icon name={p.icon as any} size={24} className={tint.iconColor} />
                    </Box>
                    <VStack className="flex-1" space="xs">
                      <Text weight="semibold" size="sm">{p.title}</Text>
                      <Text size="xs" muted>{p.desc}</Text>
                    </VStack>
                    <Button variant="outline" size="sm">
                      <ButtonText className={tint.text}>{p.action}</ButtonText>
                    </Button>
                  </HStack>
                </Card>
              );
            })}
          </VStack>
        </VStack>
      </ScrollView>

      <HStack
        className="justify-around items-center bg-card border-t border-border"
        style={{ paddingTop: 12, paddingBottom: 24 }}
      >
        {NAV_ITEMS.map((item) => (
          <Pressable key={item.label} className="items-center" style={{ gap: 4 }}>
            <Icon
              name={item.icon as any}
              size={22}
              className={item.active ? "text-foreground" : "text-muted-foreground"}
            />
            <Text
              size="xs"
              weight="medium"
              className={item.active ? "text-foreground" : "text-muted-foreground"}
            >
              {item.label}
            </Text>
          </Pressable>
        ))}
      </HStack>
    </SafeAreaView>
  );
}
