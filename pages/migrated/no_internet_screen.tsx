import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface NoInternetScreenProps {
  navigation?: any;
  route?: any;
}

export default function NoInternetScreen(props: NoInternetScreenProps) {
  const styles = useResponsiveStyleSheet({
    container: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
    iconContainer: { width: SCREEN_WIDTH * 0.4, height: SCREEN_HEIGHT * 0.2, backgroundColor: C.gray70, borderRadius: '12@ratio', marginBottom: '16@ratio', alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: '20@ratio', fontFamily: FONT.bold, color: C.white, textAlign: 'center' },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="cloud-offline-outline" size={60} color={C.gray40} />
      </View>
      <Text style={styles.title}>No Internet Connection</Text>
    </SafeAreaView>
  );
}
