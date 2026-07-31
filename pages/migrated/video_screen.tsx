import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, FONT } from './theme';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function VideoComponent({ item }: { item: any }) {
  return (
    <TouchableOpacity style={styles.videoCard} activeOpacity={0.8}>
      <Image
        source={{ uri: item.image || '' }}
        style={styles.videoThumbnail}
        resizeMode="cover"
      />
      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle} numberOfLines={2}>{item.title || 'Video Title'}</Text>
        <Text style={styles.videoMeta}>{item.duration || '3:45'}</Text>
      </View>
      <View style={styles.playOverlay}>
        <Ionicons name="play" size={24} color={C.black} />
      </View>
    </TouchableOpacity>
  );
}

export default function VideoScreen(props: any) {
  const [videoList, setVideoList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [numPage, setNumPage] = useState(1);
  const [isLastPage, setIsLastPage] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    getVideoData();
  }, []);

  const getVideoData = async () => {
    setIsLoading(true);
    try {
      // const value = await getVideoApi({ page });
      // setNumPage(value.pagination.totalPages);
      // if (page === 1) setVideoList([]);
      // setVideoList(prev => [...prev, ...value.data]);
      setIsLoading(false);
    } catch (e) {
      setIsLastPage(true);
      setIsLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!isLastPage && !isLoading && page < numPage) {
      setPage(page + 1);
      getVideoData();
    }
  };

  const renderEmpty = () => {
    if (isLoading) return <ActivityIndicator size="large" color={C.gray50} style={{ marginTop: 60 }} />;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No videos found</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => props.navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={C.white} />
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>Videos</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={videoList}
        keyExtractor={(item, i) => String(item.id || i)}
        renderItem={({ item }) => <VideoComponent item={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={renderEmpty}
      />
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
  listContent: { paddingHorizontal: 16, paddingBottom: 16 },
  videoCard: {
    backgroundColor: C.surfaceLight,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  videoThumbnail: { width: 120, height: 80 },
  videoInfo: { flex: 1, padding: 12, justifyContent: 'center' },
  videoTitle: { fontSize: 14, fontFamily: FONT.semiBold, color: C.white, marginBottom: 4 },
  videoMeta: { fontSize: 12, color: C.gray30, fontFamily: FONT.regular },
  playOverlay: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: 12,
    top: '50%',
    marginTop: -20,
  },
  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 14, color: C.gray30, fontFamily: FONT.regular },
});
