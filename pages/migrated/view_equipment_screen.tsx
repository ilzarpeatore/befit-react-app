import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';
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
    <TouchableOpacity
      key={item.id?.toString() || index.toString()}
      style={styles.gridItem}
      activeOpacity={0.7}
      onPress={() =>
        props.navigation.navigate('MigratedExerciseList', {
          mTitle: item.title,
          isEquipment: true,
          id: item.id,
        })
      }
    >
      <Image source={{ uri: item.image }} style={styles.equipmentImage} resizeMode="cover" />
      <Text style={styles.equipmentTitle} numberOfLines={2}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => props.navigation?.goBack()}>
          <Ionicons name="chevron-back" size={24} color={C.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Equipments Exercise</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.body}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scrollContent}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          <View style={styles.grid}>
            {equipmentList.map((item, index) => renderEquipmentItem({ item, index }))}
          </View>
        </ScrollView>

        {isLoading && (
          <View style={styles.loaderOverlay}>
            <ActivityIndicator size="large" color={C.orange} />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerTitle: {
    fontFamily: FONT.semiBold,
    fontSize: 18,
    color: C.white,
  },
  body: { flex: 1 },
  scrollContent: { padding: 16 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '47%',
    marginBottom: 16,
    backgroundColor: C.surfaceLight,
    borderRadius: 12,
    overflow: 'hidden',
  },
  equipmentImage: {
    width: '100%',
    height: 120,
  },
  equipmentTitle: {
    fontFamily: FONT.medium,
    fontSize: 14,
    color: C.white,
    padding: 10,
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
});
