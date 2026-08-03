import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

function extractYoutubeVideoId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

interface YoutubePlayerScreenProps {
  route?: {
    params?: {
      url?: string;
      img?: string;
      autoPlay?: boolean;
      hideControl?: boolean;
    };
  };
  navigation?: any;
}

export default function YoutubePlayerScreen(props: YoutubePlayerScreenProps) {
  const { url, img, autoPlay = false, hideControl = false } = props.route?.params || {};

  const [videoId, setVideoId] = useState<string>('');
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [visibleOption, setVisibleOption] = useState(true);
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    if (url) {
      const id = extractYoutubeVideoId(url);
      if (id) {
        setVideoId(id);
      }
    }

    return () => {
      // Cleanup - pause video if needed
    };
  }, [url]);

  const getEmbedUrl = () => {
    const params = [
      `enablejsapi=1`,
      `autoplay=${autoPlay ? 1 : 0}`,
      `controls=${hideControl ? 0 : 1}`,
      `rel=0`,
      `modestbranding=1`,
    ].join('&');
    return `https://www.youtube.com/embed/${videoId}?${params}`;
  };

  const onMessage = useCallback((event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.event === 'onReady') {
        setIsPlayerReady(true);
      }
      if (data.info) {
        setIsPlaying(data.info.playerState === 1);
      }
    } catch (e) {
      // Handle non-JSON messages
    }
  }, []);

  const postMessage = (func: string, args?: any[]) => {
    const message = JSON.stringify({ func, args: args || [] });
    webViewRef.current?.postMessage(message);
  };

  const playVideo = () => {
    postMessage('playVideo');
    setIsPlaying(true);
  };

  const pauseVideo = () => {
    postMessage('pauseVideo');
    setIsPlaying(false);
  };

  const seekTo = (seconds: number) => {
    postMessage('seekTo', [seconds, true]);
  };

  const goBackward10 = () => {
    postMessage('getCurrentTime');
  };

  const goForward10 = () => {
    postMessage('getCurrentTime');
  };

  const exitScreen = () => {
    props.navigation?.goBack();
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      pauseVideo();
    } else {
      playVideo();
    }
  };

  const youtubeHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <style>
        * { margin: 0; padding: 0; }
        html, body { width: 100%; height: 100%; background: #000; }
        iframe { width: 100%; height: 100%; border: none; }
      </style>
    </head>
    <body>
      <div id="player"></div>
      <script>
        var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        var player;
        function onYouTubeIframeAPIReady() {
          player = new YT.Player('player', {
            height: '100%',
            width: '100%',
            videoId: '${videoId}',
            playerVars: {
              'autoplay': ${autoPlay ? 1 : 0},
              'controls': ${hideControl ? 0 : 1},
              'rel': 0,
              'modestbranding': 1
            },
            events: {
              'onReady': function(event) {
                window.postMessage(JSON.stringify({event: 'onReady'}));
              },
              'onStateChange': function(event) {
                window.postMessage(JSON.stringify({
                  event: 'onStateChange',
                  info: { playerState: event.data, currentTime: event.target.getCurrentTime() }
                }));
              }
            }
          });
        }

        window.addEventListener('message', function(event) {
          try {
            var data = JSON.parse(event.data);
            if (data.func && player) {
              if (data.func === 'playVideo') player.playVideo();
              if (data.func === 'pauseVideo') player.pauseVideo();
              if (data.func === 'seekTo' && data.args) player.seekTo(data.args[0], data.args[1]);
              if (data.func === 'getCurrentTime' && player.getCurrentTime) {
                window.postMessage(JSON.stringify({
                  event: 'currentTime',
                  currentTime: player.getCurrentTime()
                }));
              }
            }
          } catch(e) {}
        });
      </script>
    </body>
    </html>
  `;

  if (!videoId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Invalid YouTube URL</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={exitScreen}>
            <Text style={styles.closeBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.playerContainer}>
        {/* Close and PiP buttons */}
        {visibleOption && (
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.closeCircle} onPress={exitScreen}>
              <Ionicons name="close" size={25} color={'#FFFFFF'} />
            </TouchableOpacity>
            {Platform.OS === 'android' && (
              <TouchableOpacity
                style={styles.pipBtn}
                onPress={() => {
                  setVisibleOption(false);
                  // SimplePip.enterPipMode() equivalent
                }}
              >
                <Ionicons name="copy-outline" size={25} color={'#FFFFFF'} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* WebView YouTube Player */}
        <WebView
          ref={webViewRef}
          source={{ html: youtubeHtml }}
          style={styles.webView}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          onMessage={onMessage}
          allowsFullscreenVideo={true}
        />

        {/* Custom Controls Overlay */}
        <View style={styles.controlsOverlay}>
          {/* Rewind 10s */}
          {!isPlaying && isPlayerReady && (
            <TouchableOpacity style={styles.controlBtn} onPress={goBackward10}>
              <Ionicons name="play-back" size={30} color={'#FFFFFF'} />
            </TouchableOpacity>
          )}

          {/* Play/Pause Center Touch Area */}
          <TouchableOpacity style={styles.playPauseArea} onPress={togglePlayPause} />

          {/* Forward 10s */}
          {!isPlaying && isPlayerReady && (
            <TouchableOpacity style={styles.controlBtn} onPress={goForward10}>
              <Ionicons name="play-forward" size={30} color={'#FFFFFF'} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  playerContainer: {
    flex: 1,
    position: 'relative',
  },
  topBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  closeCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pipBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  webView: {
    flex: 1,
    backgroundColor: '#000',
  },
  controlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  controlBtn: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseArea: {
    width: 60,
    height: 60,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontFamily: FONT.regular,
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 20,
  },
  closeBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  closeBtnText: {
    fontFamily: FONT.semiBold,
    fontSize: 14,
    color: C.white,
  },
});
