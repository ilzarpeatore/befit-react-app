import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, FONT } from './theme';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { exercisesApi } from '../../api/exercises';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

function BodyPartComponent({ item, onPress }: { item: any; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.bodyPartCard} activeOpacity={0.8} onPress={onPress}>
      <Image
        source={{ uri: item.image || '' }}
        style={styles.bodyPartImage}
        resizeMode="cover"
      />
      <View style={styles.bodyPartOverlay}>
        <Text style={styles.bodyPartName}>{item.name || 'Body Part'}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function ViewBodyPartScreen(props: any) {
  const [bodyPartList, setBodyPartList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [numPage, setNumPage] = useState(1);
  const [isLastPage, setIsLastPage] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    init();
  }, []);

  const init = () => {
    getBodyPartData();
  };

  const getBodyPartData = async () => {
    setIsLoading(true);
    try {
      const value = await exercisesApi.getBodyParts(page);
      const items = (value.data.data ?? []).map((bp) => ({
        id: bp.id,
        name: bp.title,
        image: bp.bodypart_image,
      }));
      setNumPage(value.data.pagination?.totalPages ?? 1);
      if (page === 1) setBodyPartList(items);
      else setBodyPartList((prev) => [...prev, ...items]);
      setIsLoading(false);
    } catch (e) {
      setIsLastPage(true);
      setIsLoading(false);
    }
  };

  const handleScroll = ({ nativeEvent }: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
    const isAtEnd = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
    if (isAtEnd && !isLastPage && !isLoading && page < numPage) {
      setPage(page + 1);
      getBodyPartData();
    }
  };

  if (bodyPartList.length > 0) {
    return (
      <View style={styles.container}>
        <View style={styles.appBar}>
          <TouchableOpacity onPress={() => props.navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={C.white} />
          </TouchableOpacity>
          <Text style={styles.appBarTitle}>Body Part Exercises</Text>
        </View>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          <View style={styles.grid}>
            {bodyPartList.map((item, index) => (
              <BodyPartComponent
                key={item.id || index}
                item={item}
                onPress={() =>
                  props.navigation.navigate('MigratedExerciseList', {
                    mTitle: item.name,
                    isBodyPart: true,
                    id: item.id,
                  })
                }
              />
            ))}
          </View>
        </ScrollView>

        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={C.brand5} />
          </View>
        )}
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.appBar}>
          <TouchableOpacity onPress={() => props.navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={C.white} />
          </TouchableOpacity>
          <Text style={styles.appBarTitle}>Body Part Exercises</Text>
        </View>
        <ActivityIndicator size="large" color={C.brand5} style={{ flex: 1 }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => props.navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={C.white} />
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>Body Part Exercises</Text>
      </View>
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No data found</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    gap: 12,
  },
  appBarTitle: { fontSize: 20, fontFamily: FONT.bold, color: C.white },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 20 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  bodyPartCard: {
    width: CARD_WIDTH,
    height: CARD_WIDTH,
    borderRadius: 12,
    overflow: 'hidden',
  },
  bodyPartImage: { width: '100%', height: '100%' },
  bodyPartOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  bodyPartName: { fontSize: 14, fontFamily: FONT.semiBold, color: C.white },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, fontFamily: FONT.bold, color: C.gray30 },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
