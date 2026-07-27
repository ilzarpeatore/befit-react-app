import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface NoDataScreenProps {
  navigation?: any;
  route?: any;
}

export default function NoDataScreen(props: NoDataScreenProps) {
  const { route } = props;
  const mTitle = route?.params?.mTitle || 'No data found';

  const styles = useResponsiveStyleSheet({
    container: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
    image: { width: SCREEN_WIDTH * 0.4, height: SCREEN_HEIGHT * 0.2, backgroundColor: C.gray70, borderRadius: '12@ratio', marginBottom: '16@ratio' },
    title: { fontSize: '16@ratio', fontFamily: FONT.bold, color: C.white, textAlign: 'center' },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.image} />
      <Text style={styles.title}>{mTitle}</Text>
    </SafeAreaView>
  );
}
