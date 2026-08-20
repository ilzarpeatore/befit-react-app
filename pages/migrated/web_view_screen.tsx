import React, { useState, useRef, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Box } from '@components/ui/box';
import { Button } from '@components/ui/button';
import { Icon } from '@components/ui/icon';
import { Spinner } from '@components/ui/spinner';

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
    [],
  );

  const onLoadStart = () => setIsLoading(true);
  const onLoadEnd = () => setIsLoading(false);
  const onError = () => setIsLoading(false);

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-background">
      <Box className="flex-row items-center px-2 py-2.5 bg-card border-b border-border">
        <Button variant="ghost" size="icon" onPress={() => props.navigation?.goBack()}>
          <Icon name="chevron-back" size={24} className="text-foreground" />
        </Button>
        <Box className="flex-1" />
      </Box>

      <Box className="flex-1">
        <WebView
          ref={webViewRef}
          source={{ uri: url }}
          style={{ flex: 1 }}
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
          <Box className="items-center justify-center bg-card" style={StyleSheet.absoluteFill}>
            <Spinner size="large" />
          </Box>
        )}
      </Box>
    </SafeAreaView>
  );
}
