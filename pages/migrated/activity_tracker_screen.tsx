import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function StatCard({ icon, iconColor, value, label, target, progress, bgColor }: any) {
  return (
    <View style={styles_local.statCard}>
      <View style={[styles_local.statIconWrap, { backgroundColor: bgColor }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <Text style={styles_local.statValue}>{value}</Text>
      <Text style={styles_local.statLabel}>{label}</Text>
      <View style={styles_local.progressTrack}>
        <View style={[styles_local.progressFill, { width: `${progress * 100}%`, backgroundColor: iconColor }]} />
      </View>
      <Text style={styles_local.statGoal}>Goal: {target}</Text>
    </View>
  );
}

function ActivityListItem({ icon, iconBgColor, iconColor, title, subtitle, time, value }: any) {
  return (
    <View style={styles_local.activityItem}>
      <View style={[styles_local.activityIconWrap, { backgroundColor: iconBgColor }]}>
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>
      <View style={styles_local.activityInfo}>
        <Text style={styles_local.activityTitle}>{title}</Text>
        <Text style={styles_local.activitySubtitle}>{subtitle}</Text>
        <Text style={styles_local.activityTime}>{time}</Text>
      </View>
      {value ? <Text style={styles_local.activityValue}>{value}</Text> : null}
    </View>
  );
}

function Bar({ day, heightFactor, isHighlighted = false }: any) {
  return (
    <View style={styles_local.barCol}>
      <View
        style={[
          styles_local.bar,
          {
            height: 140 * heightFactor,
            backgroundColor: isHighlighted ? C.orange : 'rgba(255, 152, 0, 0.35)',
            opacity: isHighlighted ? 1 : 0.7,
          },
        ]}
      />
      <Text style={styles_local.barLabel}>{day}</Text>
    </View>
  );
}

export default function ActivityTrackerScreen({ navigation }: any) {
  const [selectedPeriod, setSelectedPeriod] = useState('Today');
  const periods = ['Today', 'Week', 'Month', 'Year'];

  return (
    <View style={styles_local.container}>
      <View style={styles_local.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles_local.backBtn, pressed && { opacity: 0.2 }]}
        >
          <Ionicons name="chevron-back" size={24} color={C.white} />
        </Pressable>
        <Text style={styles_local.headerTitle}>Activity Tracker</Text>
        <Pressable style={({ pressed }) => [styles_local.backBtn, pressed && { opacity: 0.2 }]}>
          <Ionicons name="options-outline" size={22} color={C.gray30} />
        </Pressable>
      </View>

      <ScrollView style={styles_local.body} showsVerticalScrollIndicator={false}>
        {/* Period selector */}
        <View style={styles_local.periodWrap}>
          <View style={styles_local.periodContainer}>
            {periods.map((period) => {
              const isSelected = period === selectedPeriod;
              return (
                <Pressable
                  key={period}
                  style={({ pressed }) => [
                    styles_local.periodBtn,
                    isSelected && styles_local.periodBtnActive,
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={() => setSelectedPeriod(period)}
                >
                  <Text style={[styles_local.periodText, isSelected && styles_local.periodTextActive]}>
                    {period}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Main stats */}
        <View style={styles_local.statsRow}>
          <StatCard
            icon="walk-outline"
            iconColor={C.orange}
            value="6,842"
            label="Steps"
            target="10,000"
            progress={0.68}
            bgColor="#431407"
          />
          <StatCard
            icon="flame-outline"
            iconColor={C.red}
            value="486"
            label="Calories"
            target="600"
            progress={0.81}
            bgColor="#4C0519"
          />
          <StatCard
            icon="timer-outline"
            iconColor={C.blue}
            value="32"
            label="Minutes"
            target="45"
            progress={0.71}
            bgColor="#172554"
          />
        </View>

        {/* Weekly overview chart */}
        <View style={styles_local.chartCard}>
          <View style={styles_local.chartHeader}>
            <Text style={styles_local.chartTitle}>Weekly Overview</Text>
            <Text style={styles_local.chartSubtitle}>This Week</Text>
          </View>
          <View style={styles_local.barRow}>
            <Bar day="Mon" heightFactor={0.6} />
            <Bar day="Tue" heightFactor={0.8} />
            <Bar day="Wed" heightFactor={0.45} />
            <Bar day="Thu" heightFactor={0.9} isHighlighted />
            <Bar day="Fri" heightFactor={0.7} />
            <Bar day="Sat" heightFactor={0.5} />
            <Bar day="Sun" heightFactor={0.35} />
          </View>
        </View>

        {/* Today's activities */}
        <View style={styles_local.section}>
          <Text style={styles_local.sectionTitle}>Today's Activities</Text>
          <ActivityListItem
            icon="walk-outline"
            iconBgColor="#431407"
            iconColor={C.orange}
            title="Walking"
            subtitle="6,842 steps \u2022 5.2 km"
            time="Today, 8:30 AM"
            value="32 min"
          />
          <ActivityListItem
            icon="barbell-outline"
            iconBgColor="#172554"
            iconColor={C.blue}
            title="Upper Body Workout"
            subtitle="12 exercises completed"
            time="Today, 10:00 AM"
            value="45 min"
          />
          <ActivityListItem
            icon="water-outline"
            iconBgColor="#1C3D3A"
            iconColor={C.blue}
            title="Water Intake"
            subtitle="1.5L of 2.5L goal"
            time="Throughout the day"
            value=""
          />
        </View>
      </ScrollView>
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
  periodWrap: { paddingHorizontal: 20, paddingTop: 16 },
  periodContainer: {
    flexDirection: 'row',
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 4,
  },
  periodBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  periodBtnActive: { backgroundColor: C.orange },
  periodText: { fontSize: 13, fontFamily: FONT.semiBold, color: C.gray30, textAlign: 'center' },
  periodTextActive: { color: '#FFFFFF' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, marginTop: 24, gap: 12 },
  statCard: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 16,
  },
  statIconWrap: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  statValue: { fontSize: 24, fontFamily: FONT.bold, color: C.white, marginTop: 12 },
  statLabel: { fontSize: 12, fontFamily: FONT.regular, color: C.gray30, marginTop: 2 },
  progressTrack: { height: 4, backgroundColor: C.bg, borderRadius: 4, marginTop: 8, overflow: 'hidden' },
  progressFill: { height: 4, borderRadius: 4 },
  statGoal: { fontSize: 10, fontFamily: FONT.regular, color: C.gray30, marginTop: 4 },
  chartCard: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 20,
  },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chartTitle: { fontSize: 16, fontFamily: FONT.semiBold, color: C.white },
  chartSubtitle: { fontSize: 12, fontFamily: FONT.regular, color: C.gray30 },
  barRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 180,
    marginTop: 20,
  },
  barCol: { alignItems: 'center', justifyContent: 'flex-end' },
  bar: { width: 32, borderRadius: 8 },
  barLabel: { fontSize: 11, fontFamily: FONT.regular, color: C.gray30, marginTop: 8 },
  section: { paddingHorizontal: 20, marginTop: 24, marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontFamily: FONT.bold, color: C.white, marginBottom: 16 },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  activityIconWrap: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  activityInfo: { flex: 1, marginLeft: 14 },
  activityTitle: { fontSize: 15, fontFamily: FONT.semiBold, color: C.white },
  activitySubtitle: { fontSize: 12, fontFamily: FONT.regular, color: C.gray30, marginTop: 4 },
  activityTime: { fontSize: 11, fontFamily: FONT.regular, color: C.gray50, marginTop: 2 },
  activityValue: { fontSize: 14, fontFamily: FONT.semiBold, color: C.orange },
});
