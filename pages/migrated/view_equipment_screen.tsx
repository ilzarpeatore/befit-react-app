import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, Image, ActivityIndicator } from 'react-native';
import { Box } from '@components/ui/box';
import { Text } from '@components/ui/text';
import { Pressable } from '@components/ui/pressable';
import ScreenHeader from '@components/ScreenHeader';
import { exercisesApi } from '../../api/exercises';

interface EquipmentItem {
  id: number;
  title: string;
  image: string;
  [key: string]: any;
}

export default function ViewEquipmentScreen(props: any) {
  const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>([]);
  const [page, setPage] = useState(1);
  const [numPage, setNumPage] = useState<number | null>(null);
  const [isLastPage, setIsLastPage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    getEquipmentData();
  }, []);

  useEffect(() => {
    if (numPage && page > 1) {
      getEquipmentDataPagination();
    }
  }, [page]);

  const getEquipmentData = async () => {
    setIsLoading(true);
    try {
      const value = await exercisesApi.getEquipment(page);
      const items = (value.data.data ?? []).map((e) => ({
        id: e.id,
        title: e.title,
        image: e.equipment_image,
      }));
      setNumPage(value.data.pagination?.totalPages ?? 1);
      setIsLastPage(false);
      if (page === 1) setEquipmentList(items);
      else setEquipmentList((prev) => [...prev, ...items]);
    } catch (e) {
      setIsLastPage(true);
    } finally {
      setIsLoading(false);
    }
  };

  const getEquipmentDataPagination = async () => {
    setIsLoading(true);
    try {
      const value = await exercisesApi.getEquipment(page);
      const items = (value.data.data ?? []).map((e) => ({
        id: e.id,
        title: e.title,
        image: e.equipment_image,
      }));
      setNumPage(value.data.pagination?.totalPages ?? 1);
      setIsLastPage(false);
      setEquipmentList((prev) => [...prev, ...items]);
    } catch (e) {
      setIsLastPage(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isAtEnd = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
    if (isAtEnd && !isLoading && numPage && page < numPage) {
      setPage((prev) => prev + 1);
    }
  };

  const renderEquipmentItem = ({ item, index }: { item: EquipmentItem; index: number }) => (
    <Pressable
      key={item.id?.toString() || index.toString()}
      style={{ width: '47%' }}
      className="bg-card rounded-lg overflow-hidden"
      onPress={() =>
        props.navigation.navigate('MigratedSearch', {
          mTitle: item.title,
          isEquipment: true,
          id: item.id,
        })
      }
    >
      <Image source={{ uri: item.image }} style={{ width: '100%', height: 120 }} resizeMode="cover" />
      <Text weight="medium" size="sm" numberOfLines={2} className="p-2.5">
        {item.title}
      </Text>
    </Pressable>
  );

  return (
    <Box className="flex-1 bg-background">
      <Box style={{ paddingTop: 40 }}>
        <ScreenHeader title="Equipments Exercise" onBack={() => props.navigation?.goBack()} />
      </Box>

      <Box className="flex-1">
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ padding: 16 }}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          <Box style={{ rowGap: 16 }} className="flex-row flex-wrap justify-between">
            {equipmentList.map((item, index) => renderEquipmentItem({ item, index }))}
          </Box>
        </ScrollView>

        {isLoading && (
          <Box
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            className="items-center justify-center bg-black/40"
          >
            <ActivityIndicator size="large" color="#000000" />
          </Box>
        )}
      </Box>
    </Box>
  );
}
