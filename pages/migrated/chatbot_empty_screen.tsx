import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';

export default function ChatBotEmptyScreen({ onTap, isScroll = false }: any) {

  const questionList = [
    'What is the best workout for building muscle?',
    'How can I lose weight effectively?',
    'What should I eat before a workout?',
  ];

  return (
    <ScrollView
      contentContainerStyle={[
        styles_local.container,
        { paddingBottom: isScroll ? 185 : 90 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {questionList.map((question, index) => (
        <TouchableOpacity
          key={index}
          style={styles_local.questionCard}
          onPress={() => onTap(question)}
          activeOpacity={0.7}
        >
          <Text style={styles_local.questionText}>{question}</Text>
          <Ionicons name="chevron-forward" size={16} color={C.gray40} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles_local = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  questionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surfaceLight,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: C.border,
    gap: 12,
  },
  questionText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONT.regular,
    color: C.white,
  },
});
