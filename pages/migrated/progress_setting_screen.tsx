import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';

interface ProgressSettingItem {
  id?: number;
  name?: string;
  isEnable?: boolean;
}

export default function ProgressSettingScreen(props: any) {

  const [progressList, setProgressList] = useState<ProgressSettingItem[]>([
    { id: 1, name: 'Weight', isEnable: true },
    { id: 2, name: 'Heart Rate', isEnable: true },
    { id: 3, name: 'Push Up', isEnable: true },
  ]);

  useEffect(() => {
    // Load settings from store
  }, []);

  const toggleSetting = (index: number) => {
    const updated = [...progressList];
    updated[index] = { ...updated[index], isEnable: !updated[index].isEnable };
    setProgressList(updated);
    // Update store: userStore.updateProgress(updated[index])
    // Emit event: LiveStream().emit('PROGRESS_SETTING')
  };

  const renderItem = ({ item, index }: { item: ProgressSettingItem; index: number }) => (
    <TouchableOpacity
      style={[s.settingItem, item.isEnable && s.settingItemActive]}
      onPress={() => toggleSetting(index)}
      activeOpacity={0.7}
    >
      <Text style={[s.settingLabel, item.isEnable && s.settingLabelActive]}>{item.name ?? ''}</Text>
      <View style={s.radioContainer}>
        {item.isEnable ? (
          <View style={s.radioActive}>
            <Ionicons name="checkmark" size={14} color={C.white} />
          </View>
        ) : (
          <View style={s.radioInactive} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={s.container}>
      <View style={s.appBar}>
        <TouchableOpacity onPress={() => props.navigation?.goBack()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color={C.brand5} />
        </TouchableOpacity>
        <Text style={s.appBarTitle}>Metrics Settings</Text>
        <View style={{ width: 24 }} />
      </View>
      <FlatList
        data={progressList}
        keyExtractor={(item, i) => (item.id?.toString() ?? i.toString())}
        contentContainerStyle={s.listContent}
        renderItem={renderItem}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  appBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 48, paddingBottom: 12, backgroundColor: C.surface },
  backBtn: { padding: 4 },
  appBarTitle: { fontSize: 18, fontFamily: FONT.bold, color: C.white },
  listContent: { padding: 16 },
  settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16, backgroundColor: C.surface, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: C.border },
  settingItemActive: { backgroundColor: C.brand5, borderColor: C.brand5 },
  settingLabel: { fontSize: 16, fontFamily: FONT.bold, color: C.gray20 },
  settingLabelActive: { color: C.white },
  radioContainer: { marginLeft: 12 },
  radioActive: { width: 22, height: 22, borderRadius: 11, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' },
  radioInactive: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: C.brand5 },
});
