import React, { useState, useEffect, useRef } from 'react';
import { Image, Dimensions } from 'react-native';
import { Box } from '@components/ui/box';
import { Text } from '@components/ui/text';
import { Spinner } from '@components/ui/spinner';
// @ts-ignore - expo-av removed; fallback to View
const Video = (props: any) => <Box style={props.style} className="bg-black" />;
const ResizeMode = { CONTAIN: 'contain' };

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ASPECT_RATIO = 12 / 7;

export default function ChewieScreen({ route }: any) {
  const url = route?.params?.url;
  const image = route?.params?.image;
  const autoPlay = route?.params?.autoPlay ?? false;

  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const isPlayingRef = useRef(autoPlay);
  const videoRef = useRef<any>(null);

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
      isPlayingRef.current = status.isPlaying;
    }
  };

  const handleVisibility = (visible: boolean) => {
    if (!videoRef.current) return;
    if (visible) {
      if (!isPlayingRef.current) {
        videoRef.current.playAsync();
      }
    } else {
      if (isPlayingRef.current) {
        videoRef.current.pauseAsync();
      }
    }
  };

  if (isInitialized && url) {
    return (
      <Box style={{ width: SCREEN_WIDTH, aspectRatio: ASPECT_RATIO, overflow: 'hidden' }} className="bg-background">
        <Video
          ref={videoRef}
          source={{ uri: url }}
          style={{ width: '100%', height: '100%' }}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={autoPlay}
          isLooping
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          useNativeControls
        />
      </Box>
    );
  }

  return (
    <Box style={{ width: SCREEN_WIDTH, aspectRatio: ASPECT_RATIO, overflow: 'hidden' }} className="bg-background">
      {isLoading ? (
        <Box className="flex-1 items-center justify-center bg-background">
          <Spinner size="large" />
        </Box>
      ) : image ? (
        <Image
          source={{ uri: image }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
      ) : (
        <Box className="flex-1 items-center justify-center bg-background">
          <Text size="sm" muted>No media available</Text>
        </Box>
      )}
    </Box>
  );
}
