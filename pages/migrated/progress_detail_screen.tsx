import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ScrollView, Alert } from 'react-native';
import { Box } from '@components/ui/box';
import { Text } from '@components/ui/text';
import { Heading } from '@components/ui/heading';
import { Button } from '@components/ui/button';
import { Pressable } from '@components/ui/pressable';
import { Icon } from '@components/ui/icon';
import { Spinner } from '@components/ui/spinner';
import { C } from './theme';
import logger from '@helper/logger';

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
    <Box style={{ padding: 16 }}>
      {data.map((item, i) => {
        const val = parseFloat(item.value?.replace(/[^0-9.]/g, '') ?? '0') || 0;
        const pct = maxVal > 0 ? (val / maxVal) * 100 : 0;
        return (
          <Box key={i} className="flex-row items-center" style={{ marginBottom: 10 }}>
            <Text size="xs" muted numberOfLines={1} style={{ width: 60, textAlign: 'right', marginRight: 8 }}>
              {item.label ?? item.date ?? ''}
            </Text>
            <Box className="flex-1 rounded-sm overflow-hidden" style={{ height: 20, backgroundColor: C.gray70 }}>
              <Box className="rounded-sm" style={{ height: 20, width: `${pct}%`, backgroundColor: C.brand5 }} />
            </Box>
            <Text size="xs" muted style={{ width: 80, marginLeft: 8 }}>{val}{item.unit ? ` ${item.unit}` : ''}</Text>
          </Box>
        );
      })}
    </Box>
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
      logger.error('Progress fetch error:', e);
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
      logger.error('Progress LBS fetch error:', e);
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
    <Pressable
      key={label}
      className={`rounded-sm px-2.5 ${mWeight === index ? 'bg-primary' : ''}`}
      style={{ paddingVertical: 4 }}
      onPress={() => handleWeightToggle(index)}
    >
      <Text size="xs" className={mWeight === index ? 'text-primary-foreground' : 'text-muted-foreground'}>{label}</Text>
    </Pressable>
  );

  return (
    <Box className="flex-1 bg-background">
      <Box style={{ paddingTop: 48, paddingBottom: 12 }} className="px-3 flex-row items-center gap-2 bg-card">
        <Button variant="ghost" size="icon" onPress={() => props.navigation?.goBack()}>
          <Icon name="chevron-back" size={28} className="text-foreground" />
        </Button>
        <Heading size="sm" className="flex-1">{mTitle}</Heading>
        <Box className="flex-row items-center gap-2">
          {mTitle === 'Weight' && (
            <Box className="flex-row rounded-sm bg-secondary" style={{ padding: 4 }}>
              {renderWeightOption('LBS', 0)}
              {renderWeightOption('KG', 1)}
            </Box>
          )}
          <Button
            variant="ghost"
            size="icon"
            onPress={() => {
              Alert.alert('Filter', 'Select filter', [
                { text: 'All', onPress: () => handleFilterSelect('all') },
                { text: 'Month', onPress: () => handleFilterSelect('month') },
                { text: 'Year', onPress: () => handleFilterSelect('year') },
              ]);
            }}
          >
            <Icon name="ellipsis-vertical" size={20} className="text-muted-foreground" />
          </Button>
        </Box>
      </Box>

      <Box className="flex-1">
        {isLoading ? (
          <Box className="flex-1 items-center justify-center">
            <Spinner size="large" color={C.orange} />
          </Box>
        ) : graphData.length > 0 ? (
          <ScrollView ref={scrollRef} contentContainerStyle={{ paddingBottom: 24 }}>
            <Box className="rounded-md bg-card" style={{ margin: 16, padding: 8 }}>
              <HorizontalBarChart data={graphData} />
            </Box>
            <Box className="px-4">
              {graphData.map((item, index) => (
                <Box
                  key={index}
                  className="flex-row justify-between items-center"
                  style={{ paddingVertical: 12, borderBottomWidth: 0.3, borderBottomColor: C.gray70 }}
                >
                  <Text weight="bold" size="sm">
                    {item.value?.replace('user', '') ?? ''} {item.unit ?? ''}
                  </Text>
                  <Text size="sm" muted>{progressDateStringWidget(item.date ?? '')}</Text>
                </Box>
              ))}
            </Box>
          </ScrollView>
        ) : (
          <Box className="flex-1 items-center justify-center">
            <Icon name="bar-chart-outline" size={64} className="text-muted-foreground" />
            <Text weight="medium" muted style={{ marginTop: 16 }}>No results found</Text>
          </Box>
        )}
      </Box>

      <Pressable
        className="items-center justify-center rounded-pill bg-primary"
        style={{
          position: 'absolute',
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          elevation: 6,
          shadowColor: C.brand5,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        }}
        onPress={openAddProgress}
      >
        <Icon name="add" size={28} className="text-primary-foreground" />
      </Pressable>
    </Box>
  );
}
