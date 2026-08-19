import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';

interface MealsWaterReminderScreenProps {
  navigation?: any;
  route?: any;
}

export default function MealsWaterReminderScreen(props: MealsWaterReminderScreenProps) {
  const { navigation } = props;

  const styles = useResponsiveStyleSheet({
    container: { flex: 1, backgroundColor: C.bg },
    header: { fontSize: '20@ratio', fontFamily: FONT.bold, color: C.white, padding: '16@ratio' },
    body: { padding: '16@ratio' },
    card: { backgroundColor: C.surfaceLight, borderRadius: '12@ratio', overflow: 'hidden' },
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: '16@ratio', paddingHorizontal: '16@ratio' },
    rowIcon: { width: '24@ratio', alignItems: 'center', marginRight: '12@ratio' },
    rowLabel: { flex: 1, fontSize: '16@ratio', fontFamily: FONT.regular, color: C.white },
    divider: { height: 1, backgroundColor: C.border, marginHorizontal: '16@ratio' },
  });

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Meals & Water</Text>
      <View style={styles.body}>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation?.navigate('MigratedMealsReminders')}
            activeOpacity={0.7}
          >
            <View style={styles.rowIcon}>
              <Ionicons name="create-outline" size={24} color={C.orange} />
            </View>
            <Text style={styles.rowLabel}>Meals</Text>
            <Ionicons name="chevron-forward" size={20} color={C.gray40} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation?.navigate('MigratedWaterReminders')}
            activeOpacity={0.7}
          >
            <View style={styles.rowIcon}>
              <Ionicons name="water-outline" size={24} color={C.orange} />
            </View>
            <Text style={styles.rowLabel}>Water</Text>
            <Ionicons name="chevron-forward" size={20} color={C.gray40} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
