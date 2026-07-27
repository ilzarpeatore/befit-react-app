import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, Dimensions } from 'react-native';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';
// @ts-ignore - expo-av removed; fallback to View
const Video = (props: any) => <View style={[props.style, { backgroundColor: '#000' }]} />;
const ResizeMode = { CONTAIN: 'contain' };

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ASPECT_RATIO = 12 / 7;

export default function ChewieScreen({ route }: any) {
  const url = route?.params?.url;
  const image = route?.params?.image;
  const autoPlay = route?.params?.autoPlay ?? false;

  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const videoRef = useRef<Video>(null);

  useEffect(() => {
    initializePlayer();
    return () => {
      videoRef.current?.unloadAsync();
    };
  }, []);

  const initializePlayer = async () => {
    if (url) {
      setIsLoading(false);
      setIsInitialized(true);
    } else {
      setIsLoading(false);
    }
  };

  const handlePlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying);
    }
  };

  const handleVisibility = (visible: boolean) => {
    if (!videoRef.current) return;
    if (visible) {
      if (!isPlaying) {
        videoRef.current.playAsync();
      }
    } else {
      if (isPlaying) {
        videoRef.current.pauseAsync();
      }
    }
  };

  if (isInitialized && url) {
    return (
      <View style={styles_local.container}>
        <Video
          ref={videoRef}
          source={{ uri: url }}
          style={styles_local.video}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={autoPlay}
          isLooping
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          useNativeControls
        />
      </View>
    );
  }

  return (
    <View style={styles_local.container}>
      {isLoading ? (
        <View style={styles_local.loadingWrap}>
          <ActivityIndicator size="large" color={C.brand5} />
        </View>
      ) : image ? (
        <Image
          source={{ uri: image }}
          style={styles_local.fallbackImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles_local.placeholderWrap}>
          <Text style={styles_local.placeholderText}>No media available</Text>
        </View>
      )}
    </View>
  );
}

const styles_local = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    aspectRatio: ASPECT_RATIO,
    backgroundColor: C.bg,
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: C.bg,
  },
  fallbackImage: {
    width: '100%',
    height: '100%',
  },
  placeholderWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: C.bg,
  },
  placeholderText: {
    fontSize: 14,
    fontFamily: FONT.regular,
    color: C.gray40,
  },
});
