import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView, ScrollView, Modal } from 'react-native';
import { Box } from '@components/ui/box';
import { Text } from '@components/ui/text';
import { Heading } from '@components/ui/heading';
import { VStack } from '@components/ui/vstack';
import { HStack } from '@components/ui/hstack';
import { Button, ButtonText } from '@components/ui/button';
import { Pressable } from '@components/ui/pressable';
import { Icon } from '@components/ui/icon';
import { Spinner } from '@components/ui/spinner';
import { C } from './theme';
import { shoppingApi, ShoppingListItem } from '@api/shopping';
import logger from '@helper/logger';

export default function ShoppingListScreen(props: any) {
  const [shoppingLists, setShoppingLists] = useState<ShoppingListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showGenerateSheet, setShowGenerateSheet] = useState(false);
  const [selectedOption, setSelectedOption] = useState(0); // 0=Date, 1=Date range

  useEffect(() => {
    fetchShoppingLists();
    const unsubscribe = props.navigation.addListener('focus', fetchShoppingLists);
    return unsubscribe;
  }, []);

  const fetchShoppingLists = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await shoppingApi.getList();
      setShoppingLists(res.data?.data ?? []);
    } catch (e: any) {
      logger.error('Error fetching shopping lists:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const openAddListScreen = (isSpecificDate: boolean) => {
    setShowGenerateSheet(false);
    props.navigation.navigate('MigratedAddShoppingList', { isDefaultSpecificDate: isSpecificDate });
  };

  const openDetail = (list: ShoppingListItem) => {
    props.navigation.navigate('MigratedShoppingListDetail', { shoppingListId: list.id });
  };

  const renderOption = (index: number, title: string, subtitle: string) => {
    const selected = selectedOption === index;
    return (
      <Pressable
        className="flex-row items-center rounded-lg p-5"
        style={{
          borderWidth: 1.5,
          borderColor: selected ? C.brand5 : C.border,
          backgroundColor: selected ? `${C.brand5}1A` : C.surfaceLight,
        }}
        onPress={() => setSelectedOption(index)}
      >
        <Box
          className="rounded-md p-2.5"
          style={{ backgroundColor: selected ? `${C.brand5}33` : C.bg }}
        >
          <Icon name="calendar-outline" size={24} color={selected ? C.orange : C.gray40} />
        </Box>
        <Box className="flex-1 gap-1" style={{ marginLeft: 20 }}>
          <Text weight="bold" size="lg">{title}</Text>
          <Text size="sm" muted>{subtitle}</Text>
        </Box>
        {selected ? (
          <Icon name="checkmark-circle" size={24} color={C.success} />
        ) : (
          <Icon name="chevron-forward" size={24} className="text-muted-foreground" />
        )}
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-background">
      <HStack className="items-center justify-between p-4">
        <Button variant="ghost" size="icon" onPress={() => props.navigation.goBack()}>
          <Icon name="chevron-back" size={24} className="text-foreground" />
        </Button>
        <Heading size="sm">Shopping Lists</Heading>
        <Button variant="ghost" size="icon" onPress={() => setShowGenerateSheet(true)}>
          <Icon name="add" size={28} className="text-foreground" />
        </Button>
      </HStack>

      <Box className="flex-1">
        {isLoading && shoppingLists.length === 0 ? (
          <Box className="flex-1 items-center justify-center">
            <Spinner size="large" color={C.orange} />
          </Box>
        ) : shoppingLists.length === 0 ? (
          <Box className="flex-1 items-center justify-center gap-3">
            <Icon name="cart-outline" size={64} color={C.gray50} />
            <Text weight="medium" muted>No shopping lists found</Text>
          </Box>
        ) : (
          <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
            {shoppingLists.map((list) => (
              <Pressable
                key={list.id}
                className="p-4 bg-card rounded-md border border-border"
                onPress={() => openDetail(list)}
              >
                <HStack className="items-center justify-between">
                  <Box className="flex-1 gap-1">
                    <Text weight="bold">{list.title}</Text>
                    <Text size="sm" muted>{list.items_count ?? 0} items</Text>
                  </Box>
                  <Icon name="chevron-forward" size={20} color={C.gray40} />
                </HStack>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </Box>

      {/* Generate Bottom Sheet */}
      <Modal visible={showGenerateSheet} transparent animationType="slide">
        <Pressable
          className="flex-1 justify-end"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onPress={() => setShowGenerateSheet(false)}
        >
          <Pressable
            className="bg-background rounded-t-lg p-5"
            onPress={(e: any) => e.stopPropagation()}
          >
            <VStack space="lg">
              <Box className="w-10 h-1 rounded-pill bg-muted self-center" />
              <VStack space="sm">
                <Heading size="lg">Generate Shopping List</Heading>
                <Text muted>Choose which planned meals to include</Text>
              </VStack>

              {renderOption(0, 'Date', 'Select a specific date')}
              {renderOption(1, 'Date Range', 'Pick start and end dates')}

              <Button size="lg" onPress={() => openAddListScreen(selectedOption === 0)}>
                <ButtonText>Continue</ButtonText>
              </Button>

              <Button variant="ghost" onPress={() => setShowGenerateSheet(false)}>
                <ButtonText className="text-muted-foreground">Cancel</ButtonText>
              </Button>
            </VStack>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
