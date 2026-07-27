import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ChatbotImageEmptyScreen({ onTap, isScroll = false }: any) {
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const questionImageList = [
    'https://www.shoulder-pain-explained.com/images/shoulder-muscles-anatomy.jpg',
    'https://as1.ftcdn.net/v2/jpg/02/91/36/96/1000_F_291369692_6Wi20oLl9clU8w6a3BmckCWnsWIgSDjO.jpg',
    'https://www.shutterstock.com/image-illustration/leg-muscles-quadriceps-hamstrings-calves-600w-2448678081.jpg',
    'https://i.pinimg.com/736x/7a/1e/3c/7a1e3cb52d0a5369714a538920aaac94.jpg',
  ];

  const handleImageTap = (index: number) => {
    onTap(questionImageList[index]);
    setSelectedIndex(index);
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles_local.container,
        { paddingBottom: isScroll ? 185 : 90 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles_local.grid}>
        {questionImageList.map((uri, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles_local.imageCard,
              selectedIndex === index && styles_local.imageCardActive,
            ]}
            onPress={() => handleImageTap(index)}
            activeOpacity={0.7}
          >
            <Image source={{ uri }} style={styles_local.image} resizeMode="cover" />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles_local = StyleSheet.create({
  container: {
    padding: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  imageCard: {
    width: (SCREEN_WIDTH - 62) / 2,
    aspectRatio: 5 / 4,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  imageCardActive: {
    borderColor: C.brand5,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
