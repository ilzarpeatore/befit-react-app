import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, FONT } from './theme';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';

export default function VideoDetailScreen(props: any) {
  return (
    <View style={styles.container}>
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => props.navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={C.white} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.videoPlaceholder}>
          <Ionicons name="play-circle" size={64} color={C.brand5} />
        </View>

        <View style={styles.contentSection}>
          <Text style={styles.title}>Title</Text>
          <View style={{ height: 8 }} />
          <Text style={styles.description}>
            Exercise instruction content will be displayed here. This section contains detailed
            instructions about the exercise, proper form, and safety guidelines.
          </Text>
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
  },
  scrollContent: { paddingBottom: 32 },
  videoPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: C.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  contentSection: { paddingHorizontal: 8 },
  title: { fontSize: 18, fontFamily: FONT.bold, color: C.white },
  description: {
    fontSize: 14,
    fontFamily: FONT.regular,
    color: C.gray10,
    lineHeight: 22,
    paddingHorizontal: 8,
  },
});
