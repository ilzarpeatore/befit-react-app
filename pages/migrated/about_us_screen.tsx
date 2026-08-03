import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppIcon from '@components/AppIcon';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';

export default function AboutUsScreen({ navigation }: any) {

  const launchUrl = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  };

  return (
    <View style={styles_local.container}>
      <View style={styles_local.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles_local.backBtn}>
          <Ionicons name="chevron-back" size={24} color={C.white} />
        </TouchableOpacity>
        <Text style={styles_local.headerTitle}>About Us</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles_local.body} contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
        <Text style={styles_local.appName}>MightyFitness</Text>
        <View style={styles_local.accentBar} />
        <Text style={styles_local.description}>
          {'TODO: Replace with site description from stored settings'}
        </Text>

        <TouchableOpacity style={styles_local.infoRow} activeOpacity={0.7}>
          <AppIcon name="mail-outline" size={18} color={C.blue} bg={C.blue10} containerSize={36} borderRadius={12} />
          <Text style={styles_local.infoText}>{'contact@example.com'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles_local.infoRow} activeOpacity={0.7}>
          <AppIcon name="chatbubble-ellipses-outline" size={18} color={C.success} bg={C.success10} containerSize={36} borderRadius={12} />
          <Text style={styles_local.infoText}>{'support.example.com'}</Text>
        </TouchableOpacity>

        <View style={styles_local.infoRow}>
          <AppIcon name="call-outline" size={18} color={C.orange} bg="rgba(255,107,53,0.15)" containerSize={36} borderRadius={12} />
          <Text style={styles_local.infoText}>{'+1 234 567 890'}</Text>
        </View>
      </ScrollView>

      <View style={styles_local.bottomBar}>
        <Text style={styles_local.followUsText}>Follow Us</Text>
        <View style={styles_local.socialRow}>
          <TouchableOpacity onPress={() => launchUrl('https://facebook.com')} activeOpacity={0.7}>
            <AppIcon name="logo-facebook" size={22} color={C.blue} bg={C.blue10} containerSize={48} borderRadius={16} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => launchUrl('https://instagram.com')} activeOpacity={0.7}>
            <AppIcon name="logo-instagram" size={22} color={C.destructive} bg={C.destructive10} containerSize={48} borderRadius={16} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => launchUrl('https://twitter.com')} activeOpacity={0.7}>
            <AppIcon name="logo-twitter" size={22} color={C.blue} bg={C.blue10} containerSize={48} borderRadius={16} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => launchUrl('https://linkedin.com')} activeOpacity={0.7}>
            <AppIcon name="logo-linkedin" size={22} color={C.blue} bg={C.blue10} containerSize={48} borderRadius={16} />
          </TouchableOpacity>
        </View>
        <Text style={styles_local.copyright}>{'\u00A9 2024 MightyFitness. All rights reserved.'}</Text>
      </View>
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
  body: { flex: 1 },
  appName: { fontSize: 22, fontFamily: FONT.bold, color: C.white },
  accentBar: { width: 110, height: 2, backgroundColor: C.brand5, marginTop: 4, marginBottom: 16 },
  description: { fontSize: 14, fontFamily: FONT.regular, color: C.gray30, lineHeight: 22, marginBottom: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 },
  infoText: { fontSize: 14, fontFamily: FONT.regular, color: C.gray30 },
  bottomBar: { height: 110, borderTopWidth: 1, borderTopColor: C.border, alignItems: 'center', justifyContent: 'center', paddingBottom: 8 },
  followUsText: { fontSize: 14, fontFamily: FONT.medium, color: C.textSecondary, marginBottom: 10 },
  socialRow: { flexDirection: 'row', alignItems: 'center', gap: 24 },
  socialBtn: { padding: 8 },
  copyright: { fontSize: 12, fontFamily: FONT.regular, color: C.gray40, marginTop: 6 },
});
