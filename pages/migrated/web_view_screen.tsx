import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';

interface WebViewScreenProps {
  route?: {
    params?: {
      mInitialUrl?: string;
      isAdsLoad?: boolean;
      onClick?: (status: string) => void;
    };
  };
  navigation?: any;
}

export default function WebViewScreen(props: WebViewScreenProps) {
  const { mInitialUrl, isAdsLoad = false, onClick } = props.route?.params || {};
  const [isLoading, setIsLoading] = useState(true);
  const webViewRef = useRef<WebView>(null);

  const url = mInitialUrl || 'https://www.google.com';

  const onWebViewMessage = useCallback((event: any) => {
    // Handle messages from webview if needed
  }, []);

  const onNavigationStateChange = useCallback(
    (navState: any) => {
      const currentUrl = navState.url || '';

      // Handle social/app URLs - in RN webview these would open externally
      const externalDomains = [
        'linkedin.com',
        'market://',
        'whatsapp://',
        'truecaller://',
        'pinterest.com',
        'snapchat.com',
        'instagram.com',
        'play.google.com',
        'mailto:',
        'tel:',
        'share=telegram',
        'messenger.com',
      ];

      for (const domain of externalDomains) {
        if (currentUrl.includes(domain)) {
          // Linking.openURL(currentUrl);
          return;
        }
      }
    },
    [onClick, props.navigation],
  );

  const onLoadStart = () => setIsLoading(true);
  const onLoadEnd = () => setIsLoading(false);
  const onError = () => setIsLoading(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => props.navigation?.goBack()}>
          <Ionicons name="chevron-back" size={24} color={C.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
      </View>

      <View style={styles.webViewContainer}>
        <WebView
          ref={webViewRef}
          source={{ uri: url }}
          style={styles.webView}
          onLoadStart={onLoadStart}
          onLoadEnd={onLoadEnd}
          onError={onError}
          onNavigationStateChange={onNavigationStateChange}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          allowsBackForwardNavigationGestures={true}
          userAgent="Mozilla/5.0 (Linux; Android 4.2.2; GT-I9505 Build/JDQ39) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.59 Mobile Safari/537.36"
        />

        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={C.orange} />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  webViewContainer: {
    flex: 1,
  },
  webView: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: C.surface,
  },
});
