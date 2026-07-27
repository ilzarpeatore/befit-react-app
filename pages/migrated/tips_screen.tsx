import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, FONT } from './theme';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function TipsScreen(props: any) {
  const {
    mTips = '',
    mExerciseImage = '',
    mExerciseVideo = '',
    mExerciseInstruction = '',
  } = props.route?.params || {};

  const [select, setSelect] = useState(false);

  const isYouTube = mExerciseVideo?.includes('https://youtu');

  return (
    <View style={styles.container}>
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => props.navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={C.white} />
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>Tips & Instructions</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {isYouTube ? (
          <View style={styles.videoContainer}>
            {mExerciseImage ? (
              <Image
                source={{ uri: mExerciseImage }}
                style={styles.videoThumbnail}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.videoThumbnail, styles.videoPlaceholder]}>
                <Ionicons name="logo-youtube" size={48} color={C.red} />
              </View>
            )}
          </View>
        ) : mExerciseVideo ? (
          <View style={styles.videoContainer}>
            {mExerciseImage ? (
              <Image
                source={{ uri: mExerciseImage }}
                style={styles.videoThumbnail}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.videoThumbnail, styles.videoPlaceholder]}>
                <Ionicons name="play-circle" size={48} color={C.brand5} />
              </View>
            )}
          </View>
        ) : null}

        <View style={styles.tipsSection}>
          <TouchableOpacity
            style={styles.tipsCard}
            activeOpacity={0.8}
            onPress={() => setSelect(!select)}
          >
            <View style={styles.tipsHeader}>
              <View style={styles.tipsTitleRow}>
                <Ionicons name="information-circle-outline" size={25} color={C.brand5} />
                <Text style={styles.tipsTitle}>Tips</Text>
              </View>
              <Ionicons
                name={select ? 'chevron-down' : 'chevron-up'}
                size={30}
                color={C.brand5}
              />
            </View>
            {!select && mTips ? (
              <Text style={styles.tipsContent}>{mTips}</Text>
            ) : null}
          </TouchableOpacity>

          {mExerciseInstruction ? (
            <>
              <Text style={styles.instructionTitle}>Instructions</Text>
              <View style={styles.instructionCard}>
                <Text style={styles.instructionContent}>{mExerciseInstruction}</Text>
              </View>
            </>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    gap: 12,
  },
  appBarTitle: { fontSize: 20, fontFamily: FONT.bold, color: C.white },
  scrollContent: { paddingBottom: 32 },
  videoContainer: { width: SCREEN_WIDTH, aspectRatio: 12 / 7 },
  videoThumbnail: { width: '100%', height: '100%' },
  videoPlaceholder: {
    backgroundColor: C.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipsSection: { padding: 16 },
  tipsCard: {
    backgroundColor: C.surfaceLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  tipsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tipsTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  tipsTitle: { fontSize: 18, fontFamily: FONT.regular, color: C.white },
  tipsContent: {
    fontSize: 14,
    fontFamily: FONT.regular,
    color: C.gray10,
    marginTop: 8,
    lineHeight: 22,
  },
  instructionTitle: {
    fontSize: 16,
    fontFamily: FONT.bold,
    color: C.white,
    marginBottom: 12,
  },
  instructionCard: {
    backgroundColor: C.surfaceLight,
    borderRadius: 12,
    padding: 16,
  },
  instructionContent: {
    fontSize: 14,
    fontFamily: FONT.regular,
    color: C.gray10,
    lineHeight: 22,
  },
});
