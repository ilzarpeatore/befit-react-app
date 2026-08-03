import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';

type SampleMenu = 'all' | 'month' | 'year';

interface GraphDataItem {
  value?: string;
  unit?: string;
  date?: string;
  label?: string;
}

function progressDateStringWidget(dateStr: string): string {
  const d = new Date(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function HorizontalBarChart({ data }: { data: GraphDataItem[] }) {
  if (!data || data.length === 0) return null;
  const maxVal = Math.max(...data.map(d => parseFloat(d.value?.replace(/[^0-9.]/g, '') ?? '0') || 0));
  return (
    <View style={chartStyles.container}>
      {data.map((item, i) => {
        const val = parseFloat(item.value?.replace(/[^0-9.]/g, '') ?? '0') || 0;
        const pct = maxVal > 0 ? (val / maxVal) * 100 : 0;
        return (
          <View key={i} style={chartStyles.barRow}>
            <Text style={chartStyles.barLabel} numberOfLines={1}>{item.label ?? item.date ?? ''}</Text>
            <View style={chartStyles.barTrack}>
              <View style={[chartStyles.barFill, { width: `${pct}%` }]} />
            </View>
            <Text style={chartStyles.barValue}>{val}{item.unit ? ` ${item.unit}` : ''}</Text>
          </View>
        );
      })}
    </View>
  );
}

export default function ProgressDetailScreen(props: any) {
  const mType: string = props.route?.params?.mType ?? '';
  const mUnit: string = props.route?.params?.mUnit ?? '';
  const mTitle: string = props.route?.params?.mTitle ?? 'Progress';

  const [graphData, setGraphData] = useState<GraphDataItem[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<SampleMenu>('all');
  const [page, setPage] = useState(1);
  const [numPage, setNumPage] = useState(1);
  const [isLastPage, setIsLastPage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mWeight, setMWeight] = useState(1);
  const [isKGClicked, setIsKGClicked] = useState(false);
  const [isLBSClicked, setIsLBSClicked] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    init();
  }, []);

  const init = useCallback(async (isFilter?: boolean, isFilterType?: string) => {
    setIsLoading(true);
    try {
      // API call placeholder: getProgressApi(mType, isFilter, isFilterType)
      // const value = await getProgressApi(mType, { isFilter, isFilterType });
      // setGraphData(value.data ?? []);
      // setNumPage(value.pagination?.totalPages ?? 1);
    } catch (e) {
      console.log('Progress fetch error:', e);
    } finally {
      setIsLoading(false);
    }
  }, [mType]);

  const initLbs = useCallback(async (isFilter?: boolean, isFilterType?: string) => {
    setIsLoading(true);
    try {
      // API call and convert to lbs
      // const value = await getProgressApi(mType, { isFilter, isFilterType });
      // setGraphData(convertWeightsToLbs(value.data));
    } catch (e) {
      console.log('Progress LBS fetch error:', e);
    } finally {
      setIsLoading(false);
    }
  }, [mType]);

  const convertWeightsToLbs = (data: GraphDataItem[]): GraphDataItem[] => {
    const factor = 2.20462;
    return data.map(item => {
      if (item.value) {
        const val = parseFloat(item.value.replace(/[^0-9.]/g, '') || '0');
        return { ...item, value: (val * factor).toFixed(2), unit: 'lbs' };
      }
      return item;
    });
  };

  const handleFilterSelect = (item: SampleMenu) => {
    setSelectedMenu(item);
    if (item === 'all') {
      isLBSClicked ? initLbs() : init();
    } else if (item === 'month') {
      isLBSClicked ? initLbs(true, 'month') : init(true, 'month');
    } else {
      isLBSClicked ? initLbs(true, 'year') : init(true, 'year');
    }
  };

  const handleWeightToggle = (index: number) => {
    setMWeight(index);
    if (index === 0) {
      if (!isLBSClicked) {
        initLbs();
        setIsLBSClicked(true);
        setIsKGClicked(false);
      }
    } else {
      if (!isKGClicked) {
        init();
        setIsKGClicked(true);
        setIsLBSClicked(false);
      }
    }
  };

  const openAddProgress = () => {
    Alert.alert('Add Progress', 'Open add progress form');
    // In real app: show modal/bottom sheet with ProgressComponent
  };

  const renderWeightOption = (label: string, index: number) => (
    <TouchableOpacity
      style={[s.weightOption, mWeight === index && s.weightOptionActive]}
      onPress={() => handleWeightToggle(index)}
    >
      <Text style={[s.weightOptionText, mWeight === index && s.weightOptionTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={s.container}>
      <View style={s.appBar}>
        <TouchableOpacity onPress={() => props.navigation?.goBack()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={28} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={s.appBarTitle}>{mTitle}</Text>
        <View style={s.appBarActions}>
          {mTitle === 'Weight' && (
            <View style={s.weightToggle}>
              {renderWeightOption('LBS', 0)}
              {renderWeightOption('KG', 1)}
            </View>
          )}
          <TouchableOpacity style={s.moreBtn} onPress={() => {
            Alert.alert('Filter', 'Select filter', [
              { text: 'All', onPress: () => handleFilterSelect('all') },
              { text: 'Month', onPress: () => handleFilterSelect('month') },
              { text: 'Year', onPress: () => handleFilterSelect('year') },
            ]);
          }}>
            <Ionicons name="ellipsis-vertical" size={20} color={C.gray40} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={s.body}>
        {isLoading ? (
          <View style={s.loadingContainer}>
            <ActivityIndicator size="large" color={C.orange} />
          </View>
        ) : graphData.length > 0 ? (
          <ScrollView ref={scrollRef} contentContainerStyle={s.scrollContent}>
            <View style={s.chartSection}>
              <HorizontalBarChart data={graphData} />
            </View>
            <View style={s.listSection}>
              {graphData.map((item, index) => (
                <View key={index} style={s.listItem}>
                  <Text style={s.listItemValue}>
                    {item.value?.replace('user', '') ?? ''} {item.unit ?? ''}
                  </Text>
                  <Text style={s.listItemDate}>{progressDateStringWidget(item.date ?? '')}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        ) : (
          <View style={s.emptyContainer}>
            <Ionicons name="bar-chart-outline" size={64} color={C.gray50} />
            <Text style={s.emptyText}>No results found</Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={s.fab} onPress={openAddProgress}>
        <Ionicons name="add" size={28} color={C.white} />
      </TouchableOpacity>
    </View>
  );
}

const chartStyles = StyleSheet.create({
  container: { padding: 16 },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  barLabel: { width: 60, fontSize: 11, color: C.gray40, textAlign: 'right', marginRight: 8 },
  barTrack: { flex: 1, height: 20, backgroundColor: C.gray70, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: 20, backgroundColor: C.brand5, borderRadius: 4 },
  barValue: { width: 80, fontSize: 11, color: C.gray40, marginLeft: 8 },
});

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  appBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingTop: 48, paddingBottom: 12, backgroundColor: C.surface },
  backBtn: { padding: 4, marginRight: 8 },
  appBarTitle: { flex: 1, fontSize: 18, fontFamily: FONT.bold, color: C.white },
  appBarActions: { flexDirection: 'row', alignItems: 'center' },
  weightToggle: { flexDirection: 'row', backgroundColor: C.surfaceLight, borderRadius: 8, padding: 4, marginRight: 8 },
  weightOption: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  weightOptionActive: { backgroundColor: C.brand5 },
  weightOptionText: { fontSize: 12, color: C.gray40 },
  weightOptionTextActive: { color: C.white },
  moreBtn: { padding: 8 },
  body: { flex: 1 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingBottom: 24 },
  chartSection: { backgroundColor: C.surface, borderRadius: 16, margin: 16, padding: 8 },
  listSection: { paddingHorizontal: 16 },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 0.3, borderBottomColor: C.gray70 },
  listItemValue: { fontSize: 14, fontFamily: FONT.bold, color: C.white },
  listItemDate: { fontSize: 13, color: C.gray40 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 16, fontFamily: FONT.medium, color: C.gray40, marginTop: 16 },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: C.brand5, alignItems: 'center', justifyContent: 'center', elevation: 6, shadowColor: C.brand5, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
});
