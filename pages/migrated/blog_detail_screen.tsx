import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { C, FONT } from './theme';
import { blogApi, BlogDetailItem } from '../../api/blog';
import logger from '@helper/logger';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

// Blog content comes from the coach/admin rich-text editor and is rendered raw inside a
// WebView — strip the constructs that would let a compromised/malicious editor session
// execute script or redirect the WebView (stored-XSS defense-in-depth; the WebView's own
// originWhitelist/onShouldStartLoadWithRequest below is the primary navigation guard).
const sanitizeHtml = (html: string): string => {
  if (!html) return '';
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, '')
    .replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, '')
    .replace(/\son[a-z]+\s*=\s*'[^']*'/gi, '')
    .replace(/(href|src)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, '$1=$2#$2');
};

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
    body { margin:0; padding:0; background-color:${C.bg}; color:${C.white}; font-family:-apple-system,BlinkMacSystemFont,sans-serif; }
    img { max-width:100%; height:auto; border-radius:8px; margin:8px 0; }
    p, li { font-size:15px; line-height:1.7; color:#e0e0e0; margin:8px 0; }
    h1,h2,h3,h4 { color:${C.white}; margin:12px 0 8px; }
    blockquote { border-left:3px solid ${C.brand5}; padding-left:12px; margin:12px 0; color:${C.gray30}; }
    a { color:${C.brand5}; }
    iframe { border-radius:12px; }
  </style>
</head>
<body>
  <div id="content">__CONTENT__</div>
  <script>
    window.addEventListener('message', function(e) {
      if (e.data === 'resize') {
        document.body.style.height = document.documentElement.scrollHeight + 'px';
        window.ReactNativeWebView.postMessage(JSON.stringify({ type:'resize', height: document.documentElement.scrollHeight }));
      }
    });
    window.onload = function() {
      document.body.style.height = document.documentElement.scrollHeight + 'px';
      window.ReactNativeWebView.postMessage(JSON.stringify({ type:'resize', height: document.documentElement.scrollHeight }));
    };
  </script>
</body>
</html>`;

export default function BlogDetailScreen({ navigation, route }: any) {
  const mBlogModel = route?.params?.mBlogModel;
  // home_screen_modern.tsx navigates with { id } instead of { mBlogModel }; support both
  // so the post fetched from the API always matches what the user tapped.
  const blogId = mBlogModel?.id ?? route?.params?.id ?? 0;

  const [loading, setLoading] = useState(true);
  const [blog, setBlog] = useState<BlogDetailItem | null>(null);
  const [webViewHeight, setWebViewHeight] = useState(SCREEN_HEIGHT * 0.5);

  const loadDetail = async () => {
    setLoading(true);
    try {
      const res = await blogApi.getDetail(blogId);
      setBlog(res.data?.data ?? mBlogModel ?? null);
    } catch (e) {
      logger.error('Error loading blog detail:', e);
      setBlog(mBlogModel ?? null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [blogId]);

  const onWebViewMessage = (event: any) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'resize' && msg.height > 0) {
        setWebViewHeight(msg.height + 20);
      }
    } catch {}
  };

  const getRenderedHtml = () => {
    const content = blog?.content || blog?.description || '';
    const withEmbeds = renderYouTubeEmbeds(sanitizeHtml(content));
    return WRAPPER_HTML.replace('__CONTENT__', withEmbeds);
  };

  // Only the WRAPPER_HTML we generate (loaded as source.html, origin "about:blank") and the
  // YouTube embed iframe it may contain should ever load in this WebView — block navigation
  // to any other origin (e.g. a malicious link/redirect inside sanitized blog content).
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

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={C.orange} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Hero */}
        <View style={styles.heroWrap}>
          {blog?.post_image ? (
            <Image source={{ uri: blog.post_image }} style={styles.heroImage} resizeMode="cover" />
          ) : (
            <View style={[styles.heroImage, { backgroundColor: C.surface }]} />
          )}
          <View style={styles.heroOverlay} />

          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={28} color={C.white} />
          </TouchableOpacity>

          <View style={styles.dateBadge}>
            <Ionicons name="time-outline" size={14} color={C.white} style={{ marginRight: 4 }} />
            <Text style={styles.dateText}>{formatDate(blog?.datetime || blog?.created_at || '')}</Text>
          </View>

          <Text style={styles.heroTitle} numberOfLines={3}>{blog?.title ?? ''}</Text>

          {blog?.blog_category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{blog.blog_category.title}</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.contentSheet}>
          {/* Tags */}
          {blog?.tags_name && blog.tags_name.length > 0 && (
            <View style={styles.tagWrap}>
              {blog.tags_name.map((tag: any, index: number) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag.title ?? ''}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Rich content via WebView */}
          {blog?.content || blog?.description ? (
            <View style={styles.htmlContent}>
              <WebView
                source={{ html: getRenderedHtml() }}
                style={[styles.webView, { height: webViewHeight }]}
                scrollEnabled={false}
                originWhitelist={['about:blank']}
                onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
                onMessage={onWebViewMessage}
                javaScriptEnabled
              />
            </View>
          ) : null}

          {/* Bibliography / Sources */}
          {blog?.bibliography && blog.bibliography.trim().length > 0 && (
            <View style={styles.bibliographySection}>
              <View style={styles.bibliographyHeader}>
                <Ionicons name="book-outline" size={20} color={C.textPrimary} />
                <Text style={styles.bibliographyTitle}>Sources & References</Text>
              </View>
              <View style={styles.bibliographyDivider} />
              <View style={styles.bibliographyContent}>
                {blog.bibliography.split('\n').filter((line: string) => line.trim().length > 0).map((line: string, index: number) => {
                  const isUrl = line.trim().match(/^https?:\/\//);
                  return (
                    <View key={index} style={styles.bibliographyItem}>
                      <View style={styles.bibliographyDot} />
                      {isUrl ? (
                        <Text style={styles.bibliographyLink} numberOfLines={3}>{line.trim()}</Text>
                      ) : (
                        <Text style={styles.bibliographyText}>{line.trim()}</Text>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg },
  heroWrap: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.42,
    position: 'relative',
  },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.4)' },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateBadge: {
    position: 'absolute',
    top: 100,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  dateText: { fontSize: 12, fontFamily: FONT.regular, color: C.white },
  heroTitle: {
    position: 'absolute',
    bottom: 50,
    left: 16,
    right: 16,
    fontSize: 20,
    fontFamily: FONT.bold,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: C.brand5,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoryBadgeText: { fontSize: 12, fontFamily: FONT.semiBold, color: C.white },
  contentSheet: {
    backgroundColor: C.bg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  tag: {
    backgroundColor: C.surfaceLight,
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 0.5,
    borderColor: C.brand5,
  },
  tagText: { fontSize: 12, fontFamily: FONT.regular, color: C.textPrimary },
  htmlContent: { paddingHorizontal: 8, marginTop: 4 },
  webView: { width: '100%' },
  bibliographySection: {
    marginTop: 24,
    marginHorizontal: 16,
    backgroundColor: C.surfaceLight,
    borderRadius: 16,
    padding: 16,
  },
  bibliographyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  bibliographyTitle: { fontSize: 16, fontFamily: FONT.bold, color: C.white },
  bibliographyDivider: { height: 1, backgroundColor: C.gray60, marginBottom: 12 },
  bibliographyContent: { gap: 8 },
  bibliographyItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  bibliographyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.brand5,
    marginTop: 6,
  },
  bibliographyText: { flex: 1, fontSize: 14, fontFamily: FONT.regular, color: C.gray30, lineHeight: 20 },
  bibliographyLink: { flex: 1, fontSize: 13, fontFamily: FONT.regular, color: C.textPrimary, lineHeight: 18 },
});