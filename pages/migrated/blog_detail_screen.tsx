import React, { useState, useEffect } from 'react';
import { ScrollView, Dimensions, ActivityIndicator, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { WebView } from 'react-native-webview';
import { Box } from '@components/ui/box';
import { Text } from '@components/ui/text';
import { HStack } from '@components/ui/hstack';
import { VStack } from '@components/ui/vstack';
import { Button } from '@components/ui/button';
import { Icon } from '@components/ui/icon';
import {
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionTitleText,
  AccordionContent,
} from '@components/ui/accordion';
import { C } from './theme';
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

export default function BlogDetailScreen({ navigation, route }: any) {
  const mBlogModel = route?.params?.mBlogModel;
  // home_screen_modern.tsx navigates with { id } instead of { mBlogModel }; support both
  // so the post fetched from the API always matches what the user tapped.
  const blogId = mBlogModel?.id ?? route?.params?.id ?? 0;

  const [loading, setLoading] = useState(true);
  const [blog, setBlog] = useState<BlogDetailItem | null>(null);
  const [webViewHeight, setWebViewHeight] = useState(SCREEN_HEIGHT * 0.5);
  const [bibliographyOpen, setBibliographyOpen] = useState(false);

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

  if (loading) {
    return (
      <Box className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color={C.orange} />
      </Box>
    );
  }

  return (
    <Box className="flex-1 bg-background">
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Hero */}
        <Box style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 0.42, position: 'relative' }}>
          {blog?.post_image ? (
            <Image source={{ uri: blog.post_image }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
          ) : (
            <Box className="bg-card" style={{ width: '100%', height: '100%' }} />
          )}
          <Box style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.4)' }]} />

          <Button
            variant="ghost"
            size="icon"
            style={{ position: 'absolute', top: 50, left: 8 }}
            onPress={() => navigation.goBack()}
          >
            <Icon name="chevron-back" size={28} color={C.white} />
          </Button>

          <HStack
            className="items-center rounded-sm"
            style={{
              position: 'absolute',
              top: 100,
              left: 16,
              backgroundColor: 'rgba(255,255,255,0.2)',
              paddingHorizontal: 8,
              paddingVertical: 5,
            }}
          >
            <Icon name="time-outline" size={14} color={C.white} style={{ marginRight: 4 }} />
            <Text size="xs" style={{ color: C.white }}>{formatDate(blog?.datetime || blog?.created_at || '')}</Text>
          </HStack>

          <Text
            weight="bold"
            size="xl"
            numberOfLines={3}
            style={{
              position: 'absolute',
              bottom: 50,
              left: 16,
              right: 16,
              color: '#FFFFFF',
              textShadowColor: 'rgba(0,0,0,0.5)',
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 4,
            }}
          >
            {blog?.title ?? ''}
          </Text>

          {blog?.blog_category && (
            <Box
              className="rounded-sm"
              style={{
                position: 'absolute',
                bottom: 16,
                left: 16,
                backgroundColor: C.brand5,
                paddingHorizontal: 10,
                paddingVertical: 4,
              }}
            >
              <Text size="xs" weight="semibold" style={{ color: C.white }}>{blog.blog_category.title}</Text>
            </Box>
          )}
        </Box>

        {/* Content */}
        <Box className="bg-background rounded-t-lg" style={{ paddingTop: 16, paddingBottom: 40 }}>
          {/* Tags */}
          {blog?.tags_name && blog.tags_name.length > 0 && (
            <Box
              className="flex-row flex-wrap"
              style={{ paddingHorizontal: 16, paddingBottom: 12, gap: 8 }}
            >
              {blog.tags_name.map((tag: any, index: number) => (
                <Box
                  key={index}
                  className="bg-card rounded-pill"
                  style={{ paddingHorizontal: 12, paddingVertical: 5, borderWidth: 0.5, borderColor: C.brand5 }}
                >
                  <Text size="xs" style={{ color: C.textPrimary }}>{tag.title ?? ''}</Text>
                </Box>
              ))}
            </Box>
          )}

          {/* Rich content via WebView */}
          {blog?.content || blog?.description ? (
            <Box style={{ paddingHorizontal: 8, marginTop: 4 }}>
              <WebView
                source={{ html: getRenderedHtml() }}
                style={{ width: '100%', height: webViewHeight }}
                scrollEnabled={false}
                originWhitelist={['about:blank']}
                onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
                onMessage={onWebViewMessage}
                javaScriptEnabled
              />
            </Box>
          ) : null}

          {/* Fuente / Bibliografía — acordeón real (Accordion de Gluestack) */}
          {blog?.bibliography && blog.bibliography.trim().length > 0 && (
            <Accordion
              type="single"
              isCollapsible
              value={bibliographyOpen ? ['bibliography'] : []}
              onValueChange={(value) => setBibliographyOpen(value.includes('bibliography'))}
              className="bg-card rounded-lg"
              style={{ marginTop: 24, marginHorizontal: 16 }}
            >
              <AccordionItem value="bibliography">
                <AccordionHeader>
                  <AccordionTrigger style={{ paddingHorizontal: 16, paddingVertical: 16 }}>
                    {({ isExpanded }: { isExpanded: boolean }) => (
                      <>
                        <Icon name="book-outline" size={20} color={C.textPrimary} />
                        <AccordionTitleText className="flex-1">Fuente / Bibliografía</AccordionTitleText>
                        <Icon name={isExpanded ? 'chevron-up' : 'chevron-down'} size={18} color={C.textPrimary} />
                      </>
                    )}
                  </AccordionTrigger>
                </AccordionHeader>
                <AccordionContent style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
                  <Box style={{ height: 1, backgroundColor: C.gray60, marginBottom: 12 }} />
                  <VStack space="sm">
                    {blog.bibliography.split('\n').filter((line: string) => line.trim().length > 0).map((line: string, index: number) => {
                      const isUrl = line.trim().match(/^https?:\/\//);
                      return (
                        <HStack key={index} space="sm" style={{ alignItems: 'flex-start' }}>
                          <Box style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.brand5, marginTop: 6 }} />
                          {isUrl ? (
                            <Text
                              numberOfLines={3}
                              className="flex-1"
                              size="sm"
                              style={{ color: C.textPrimary, lineHeight: 18 }}
                            >
                              {line.trim()}
                            </Text>
                          ) : (
                            <Text className="flex-1" size="sm" style={{ color: C.gray30, lineHeight: 20 }}>
                              {line.trim()}
                            </Text>
                          )}
                        </HStack>
                      );
                    })}
                  </VStack>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </Box>
      </ScrollView>
    </Box>
  );
}
