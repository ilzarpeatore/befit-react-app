import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';

export default function AssignScreen({ navigation }: any) {
  const [select, setSelect] = useState(true);

  return (
    <View style={styles_local.container}>
      <View style={styles_local.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles_local.backBtn}>
          <Ionicons name="chevron-back" size={24} color={C.white} />
        </TouchableOpacity>
        <Text style={styles_local.headerTitle}>Plan</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tab bar */}
      <View style={styles_local.tabBar}>
        <TouchableOpacity
          style={[styles_local.tab, select && styles_local.tabActive]}
          onPress={() => setSelect(true)}
          activeOpacity={0.7}
        >
          <Text style={[styles_local.tabText, select && styles_local.tabTextActive]}>Workouts</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles_local.tab, !select && styles_local.tabActive]}
          onPress={() => setSelect(false)}
          activeOpacity={0.7}
        >
          <Text style={[styles_local.tabText, !select && styles_local.tabTextActive]}>Diet</Text>
        </TouchableOpacity>
      </View>

      {/* Content placeholder */}
      <View style={styles_local.content}>
        {select ? (
          <View style={styles_local.placeholder}>
            <Ionicons name="barbell-outline" size={48} color={C.gray60} />
            <Text style={styles_local.placeholderText}>Workouts Assign View</Text>
            <Text style={styles_local.placeholderSubtext}>TODO: Integrate ViewWorkoutsScreen</Text>
          </View>
        ) : (
          <View style={styles_local.placeholder}>
            <Ionicons name="nutrition-outline" size={48} color={C.gray60} />
            <Text style={styles_local.placeholderText}>Diet Assign View</Text>
            <Text style={styles_local.placeholderSubtext}>TODO: Integrate ViewAllDiet</Text>
          </View>
        )}
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
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: C.surface,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: C.brand5,
  },
  tabText: {
    fontSize: 15,
    fontFamily: FONT.semiBold,
    color: C.gray40,
  },
  tabTextActive: {
    color: C.textPrimary,
  },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholder: { alignItems: 'center', gap: 12 },
  placeholderText: { fontSize: 16, fontFamily: FONT.semiBold, color: C.gray30 },
  placeholderSubtext: { fontSize: 13, fontFamily: FONT.regular, color: C.gray50 },
});
