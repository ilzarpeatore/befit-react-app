import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';

export default function AboutAppScreen({ navigation }: any) {
  const [aboutPages, setAboutPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppSettings();
  }, []);

  async function loadAppSettings() {
    try {
      // TODO: Replace with actual API call
      // const response = await getAppSettingApi();
      // let pages = response.pages ?? [];
      // pages.sort((a: any, b: any) => (a.title ?? '').localeCompare(b.title ?? ''));
      // setAboutPages(pages);
      setLoading(false);
    } catch (e) {
      console.log('Error loading settings:', e);
      setLoading(false);
    }
  }

  const mOption = (icon: string, title: string, onPress: () => void) => (
    <TouchableOpacity style={styles_local.optionRow} onPress={onPress} activeOpacity={0.7}>
      <View style={styles_local.optionIcon}>
        <Ionicons name={icon as any} size={20} color={C.brand50} />
      </View>
      <Text style={styles_local.optionText}>{title}</Text>
      <Ionicons name="chevron-forward" size={18} color={C.gray30} />
    </TouchableOpacity>
  );

  return (
    <View style={styles_local.container}>
      <View style={styles_local.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles_local.backBtn}>
          <Ionicons name="chevron-back" size={24} color={C.white} />
        </TouchableOpacity>
        <Text style={styles_local.headerTitle}>About App</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles_local.body} showsVerticalScrollIndicator={false}>
        {mOption('document-text-outline', 'Privacy Policy', () => {
          // TODO: navigation.navigate('PrivacyPolicyScreen')
        })}
        <View style={styles_local.divider} />
        {mOption('document-text-outline', 'Terms of Services', () => {
          // TODO: navigation.navigate('TermsAndConditionScreen')
        })}
        <View style={styles_local.divider} />
        {mOption('information-circle-outline', 'About Us', () => {
          navigation.navigate('MigratedAboutUs');
        })}
        <View style={styles_local.divider} />
        {aboutPages.map((page: any, index: number) => (
          <View key={index}>
            {mOption('information-circle-outline', page.title ?? '', () => {
              // TODO: navigation.navigate('InAppWebPage', { url: page.url, title: page.title })
            })}
            <View style={styles_local.divider} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles_local = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 14,
    backgroundColor: C.surface,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontFamily: FONT.bold, color: C.white },
  body: { flex: 1, paddingTop: 8 },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: C.surface,
  },
  optionIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: C.surfaceLight, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  optionText: { flex: 1, fontSize: 15, fontFamily: FONT.medium, color: C.white },
  divider: { height: 1, backgroundColor: C.border, marginHorizontal: 16 },
});
