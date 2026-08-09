import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { C, FONT } from './theme';
import { resourcesApi, ResourceListItem } from '../../api/resources';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Mismo patron probado en blog_detail_screen.tsx: contenido subido por el coach
// (incluso documentos HTML completos, ver isFullDocument) renderizado tal cual en
// un WebView — se sanea (quita <script>/<iframe> ajenos y atributos on*=) antes de
// inyectar el propio <iframe> de YouTube e el resize script, ambos de confianza.
const sanitizeHtml = (html: string): string => {
  if (!html) return '';
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, '')
    .replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, '')
    .replace(/\son[a-z]+\s*=\s*'[^']*'/gi, '')
    .replace(/(href|src)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, '$1=$2#$2');
};

// Mismo patron probado en blog_detail_screen.tsx: altura dinamica via
// postMessage (el WebView no sabe su propia altura de contenido de otra
// forma), mas transformacion de enlaces de YouTube a embed real.
const renderYouTubeEmbeds = (html: string): string => {
  if (!html) return '';
  return html.replace(
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/g,
    `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:16px 0;">
      <iframe src="https://www.youtube.com/embed/$1" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;"
        allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>
    </div>`
  );
};

const WRAPPER_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    body { margin:0; padding:0; background-color:${C.surface}; color:${C.textPrimary}; font-family:-apple-system,BlinkMacSystemFont,sans-serif; }
    img { max-width:100%; height:auto; border-radius:8px; margin:8px 0; }
    p, li { font-size:15px; line-height:1.7; color:${C.textSecondary}; margin:8px 0; }
    h1,h2,h3,h4 { color:${C.textPrimary}; margin:12px 0 8px; }
    table { width:100%; border-collapse:collapse; margin:12px 0; }
    th, td { border:1px solid ${C.border}; padding:8px; font-size:14px; text-align:left; }
    blockquote { border-left:3px solid ${C.accentBlack}; padding-left:12px; margin:12px 0; color:${C.textSecondary}; }
    a { color:${C.blue60}; }
    iframe { border-radius:12px; }
  </style>
</head>
<body>
  <div id="content">__CONTENT__</div>
  <script>
    window.onload = function() {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type:'resize', height: document.documentElement.scrollHeight }));
    };
  </script>
</body>
</html>`;

// Recursos subidos como archivo HTML completo (con su propio <html>/<head>/<style>)
// en vez de un fragmento: se sirven tal cual, sin envolverlos en WRAPPER_HTML
// (anidar <html> dentro de <html> es invalido), solo se les inyecta el mismo
// script de medicion de altura que usa WRAPPER_HTML.
const isFullDocument = (html: string): boolean => /^\s*(<!DOCTYPE|<html)/i.test(html);

const RESIZE_SCRIPT = `<script>
  window.onload = function() {
    window.ReactNativeWebView.postMessage(JSON.stringify({ type:'resize', height: document.documentElement.scrollHeight }));
  };
</script>`;

const injectResizeScript = (html: string): string => {
  if (/<\/body>/i.test(html)) {
    return html.replace(/<\/body>/i, `${RESIZE_SCRIPT}</body>`);
  }
  return html + RESIZE_SCRIPT;
};

interface Props {
  navigation?: any;
  route?: any;
}

export default function ResourceDetailScreen(props: Props) {
  const { navigation, route } = props;
  const resourceId: number | undefined = route?.params?.resourceId;
  const fallbackTitle: string | undefined = route?.params?.title;

  const [isLoading, setIsLoading] = useState(!!resourceId);
  const [error, setError] = useState(!resourceId);
  const [resource, setResource] = useState<ResourceListItem | null>(null);
  const [webViewHeight, setWebViewHeight] = useState(SCREEN_HEIGHT * 0.5);

  useEffect(() => {
    if (!resourceId) return;
    resourcesApi
      .getDetail(resourceId)
      .then((res) => setResource(res.data.data))
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
  }, [resourceId]);

  const onWebViewMessage = (event: any) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'resize' && msg.height > 0) {
        setWebViewHeight(msg.height + 24);
      }
    } catch {}
  };

  // Solo el documento que generamos nosotros mismos (source.html, origin "about:blank")
  // y el iframe de YouTube que pueda contener deben poder navegar en este WebView.
  const onShouldStartLoadWithRequest = (request: any) => {
    const url: string = request?.url ?? '';
    if (url === 'about:blank' || url.startsWith('data:')) return true;
    try {
      const host = new URL(url).hostname;
      return host === 'www.youtube.com' || host === 'youtube.com' || host.endsWith('.googlevideo.com') || host.endsWith('.ytimg.com');
    } catch {
      return false;
    }
  };

  const openExternal = () => {
    if (!resource?.external_url) return;
    navigation?.navigate('MigratedWebView', { mInitialUrl: resource.external_url });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()}>
            <Ionicons name="chevron-back" size={24} color={C.textPrimary} />
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={C.textPrimary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !resource) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()}>
            <Ionicons name="chevron-back" size={24} color={C.textPrimary} />
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <Text style={styles.emptyText}>No se pudo cargar el recurso.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isExternalType = resource.type === 'video' || resource.type === 'link';

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <Ionicons name="chevron-back" size={24} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{resource.title || fallbackTitle}</Text>
        <View style={{ width: 24 }} />
      </View>

      {isExternalType ? (
        <View style={styles.center}>
          <Ionicons name={resource.type === 'video' ? 'play-circle-outline' : 'link-outline'} size={48} color={C.textSecondary} />
          <Text style={[styles.title, { marginTop: 16 }]}>{resource.title}</Text>
          <TouchableOpacity style={styles.openBtn} activeOpacity={0.85} onPress={openExternal}>
            <Text style={styles.openBtnText}>{resource.type === 'video' ? 'VER VÍDEO' : 'ABRIR ENLACE'}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>{resource.title}</Text>
          {resource.content ? (
            <WebView
              source={{
                html: (() => {
                  const sanitized = sanitizeHtml(resource.content);
                  return isFullDocument(sanitized)
                    ? injectResizeScript(renderYouTubeEmbeds(sanitized))
                    : WRAPPER_HTML.replace('__CONTENT__', renderYouTubeEmbeds(sanitized));
                })(),
              }}
              style={[styles.webView, { height: webViewHeight }]}
              scrollEnabled={false}
              originWhitelist={['about:blank']}
              onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
              onMessage={onWebViewMessage}
              javaScriptEnabled
            />
          ) : (
            <Text style={styles.emptyText}>Este recurso todavía no tiene contenido.</Text>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  headerTitle: { flex: 1, textAlign: 'center', fontFamily: FONT.bold, fontSize: 15, color: C.textPrimary, marginHorizontal: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  emptyText: { fontFamily: FONT.regular, fontSize: 14, color: C.textSecondary, textAlign: 'center' },
  title: { fontFamily: FONT.extraBold, fontSize: 19, color: C.textPrimary, paddingHorizontal: 20, marginBottom: 12, textAlign: 'center' },
  scrollContent: { paddingBottom: 32 },
  webView: { width: '100%' },
  openBtn: {
    marginTop: 24,
    backgroundColor: C.accentBlack,
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  openBtnText: { fontFamily: FONT.bold, fontSize: 14, color: '#FFFFFF', letterSpacing: 0.5 },
});
