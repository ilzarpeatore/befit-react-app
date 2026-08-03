import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';

interface GoalCaloriesMacrosScreenProps {
  navigation?: any;
  route?: any;
}

export default function GoalCaloriesMacrosScreen(props: GoalCaloriesMacrosScreenProps) {
  const { navigation } = props;

  const styles = useResponsiveStyleSheet({
    container: { flex: 1, backgroundColor: C.bg },
    header: { fontSize: '20@ratio', fontFamily: FONT.bold, color: C.white, padding: '16@ratio' },
    optionRow: {
      flexDirection: 'row', alignItems: 'center', paddingVertical: '16@ratio',
      paddingHorizontal: '16@ratio', borderBottomWidth: 1, borderBottomColor: C.border,
    },
    optionIcon: { width: '40@ratio', height: '40@ratio', borderRadius: '20@ratio', backgroundColor: C.surfaceLight, alignItems: 'center', justifyContent: 'center', marginRight: '12@ratio' },
    optionText: { flex: 1, fontSize: '16@ratio', fontFamily: FONT.medium, color: C.white },
    chevron: { color: C.gray40 },
  });

  const options = [
    { icon: 'flame-outline' as const, label: 'Goal', step: 5 },
    { icon: 'bar-chart-outline' as const, label: 'Activity Level', step: 6 },
    { icon: 'nutrition-outline' as const, label: 'Macros Diet Type', step: 7 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Goal, Calories & Macros</Text>
      {options.map((opt, idx) => (
        <TouchableOpacity
          key={idx}
          style={styles.optionRow}
          onPress={() => navigation?.navigate('MigratedGoalSelection', { step: opt.step })}
          activeOpacity={0.7}
        >
          <View style={styles.optionIcon}>
            <Ionicons name={opt.icon} size={20} color={C.textPrimary} />
          </View>
          <Text style={styles.optionText}>{opt.label}</Text>
          <Ionicons name="chevron-forward" size={20} style={styles.chevron} />
        </TouchableOpacity>
      ))}
    </SafeAreaView>
  );
}
