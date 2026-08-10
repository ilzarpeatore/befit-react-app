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

interface LevelItem {
  id: number;
  title: string;
  image?: string;
  description?: string;
  [key: string]: any;
}

export default function ViewLevelScreen(props: any) {
  const [levelList, setLevelList] = useState<LevelItem[]>([]);
  const [page, setPage] = useState(1);
  const [numPage, setNumPage] = useState<number | null>(null);
  const [isLastPage, setIsLastPage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    getLevelData();
  }, []);

  useEffect(() => {
    if (numPage && page > 1) {
      getLevelDataPagination();
    }
  }, [page]);

  const getLevelData = async () => {
    setIsLoading(true);
    try {
      const value = await exercisesApi.getLevels(page);
      const items = (value.data.data ?? []).map((l) => ({
        id: l.id,
        title: l.title,
      }));
      setNumPage(value.data.pagination?.totalPages ?? 1);
      setIsLastPage(false);
      if (page === 1) setLevelList(items);
      else setLevelList((prev) => [...prev, ...items]);
    } catch (e) {
      setIsLastPage(true);
    } finally {
      setIsLoading(false);
    }
  };

  const getLevelDataPagination = async () => {
    setIsLoading(true);
    try {
      const value = await exercisesApi.getLevels(page);
      const items = (value.data.data ?? []).map((l) => ({
        id: l.id,
        title: l.title,
      }));
      setNumPage(value.data.pagination?.totalPages ?? 1);
      setIsLastPage(false);
      setLevelList((prev) => [...prev, ...items]);
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

  const renderLevelItem = ({ item, index }: { item: LevelItem; index: number }) => (
    <TouchableOpacity
      key={item.id?.toString() || index.toString()}
      style={styles.levelItem}
      activeOpacity={0.7}
      onPress={() =>
        props.navigation.navigate('MigratedSearch', {
          mTitle: item.title,
          isLevel: true,
          id: item.id,
        })
      }
    >
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.levelImage} resizeMode="cover" />
      ) : null}
      <View style={styles.levelContent}>
        <Text style={styles.levelTitle} numberOfLines={1}>{item.title}</Text>
        {item.description ? (
          <Text style={styles.levelDesc} numberOfLines={2}>{item.description}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => props.navigation?.goBack()}>
          <Ionicons name="chevron-back" size={24} color={C.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Levels</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.body}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scrollContent}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {levelList.map((item, index) => renderLevelItem({ item, index }))}
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
  scrollContent: { paddingVertical: 4, paddingHorizontal: 16 },
  levelItem: {
    flexDirection: 'row',
    backgroundColor: C.surfaceLight,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    alignItems: 'center',
  },
  levelImage: {
    width: 60,
    height: 60,
  },
  levelContent: {
    flex: 1,
    padding: 12,
  },
  levelTitle: {
    fontFamily: FONT.semiBold,
    fontSize: 16,
    color: C.white,
  },
  levelDesc: {
    fontFamily: FONT.regular,
    fontSize: 13,
    color: C.textSecondary,
    marginTop: 4,
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
});
