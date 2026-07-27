import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';
import { dietApi } from '../../api/diet';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface DietModel {
  id?: number;
  title?: string;
  dietImage?: string;
  calories?: string;
  carbs?: string;
  fat?: string;
  protein?: string;
  totalTime?: string;
  ingredients?: string;
  description?: string;
  isFavourite?: number;
  isPremium?: number;
  [key: string]: any;
}

interface DietDetailScreenProps {
  navigation: any;
  route: {
    params: {
      dietModel?: DietModel;
      isCategory?: boolean;
      isFeatured?: boolean;
    };
  };
}

export default function DietDetailScreen(props: DietDetailScreenProps) {
  const dietModel = props.route.params?.dietModel ?? {};
  const [select, setSelect] = useState(true);
  const [dietState, setDietState] = useState<DietModel>(dietModel);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // init
  }, []);

  const setDiet = async (id?: number) => {
    if (!id) return;
    setIsLoading(true);
    try {
      await dietApi.setFavourite(id);
      setDietState((prev) => ({
        ...prev,
        isFavourite: prev.isFavourite === 1 ? 0 : 1,
      }));
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  const getVitamins = (icon: string, title: string, subTitle: string) => (
    <View style={localStyles.vitaminItem}>
      <Ionicons name={icon as any} size={26} color={C.brand5} />
      <Text style={localStyles.vitaminTitle}>{title}</Text>
      <Text style={localStyles.vitaminSubtitle}>{subTitle}</Text>
    </View>
  );

  const ingredients = () => (
    <View style={localStyles.htmlContent}>
      <Text style={localStyles.htmlText}>{dietState.ingredients || ''}</Text>
    </View>
  );

  const instruction = () => (
    <View style={localStyles.htmlContent}>
      <Text style={localStyles.htmlText}>{dietState.description || ''}</Text>
    </View>
  );

  return (
    <View style={localStyles.container}>
      {/* Header Image */}
      <View style={localStyles.headerSection}>
        <Image
          source={{ uri: dietState.dietImage || '' }}
          style={localStyles.headerImage}
          resizeMode="cover"
        />
        <View style={localStyles.headerOverlay} />

        {/* Back Button */}
        <TouchableOpacity
          style={localStyles.backBtn}
          onPress={() => props.navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={C.white} />
        </TouchableOpacity>

        {/* Premium Badge */}
        {dietState.isPremium === 1 && (
          <View style={localStyles.premiumBadge}>
            <Text style={localStyles.premiumText}>PRO</Text>
          </View>
        )}

        {/* Favourite Button */}
        <TouchableOpacity
          style={localStyles.favBtn}
          onPress={() => setDiet(dietState.id)}
        >
          <View style={localStyles.favBtnInner}>
            <Ionicons
              name={dietState.isFavourite === 1 ? 'heart' : 'heart-outline'}
              size={20}
              color={dietState.isFavourite === 1 ? C.brand5 : C.white}
            />
          </View>
        </TouchableOpacity>

        {/* Title + Time */}
        <View style={localStyles.titleRow}>
          <Text style={localStyles.dietTitle} numberOfLines={2}>
            {dietState.title || ''}
          </Text>
          <View style={localStyles.timeBadge}>
            <Ionicons name="time-outline" size={16} color={C.white} />
            <Text style={localStyles.timeText}>{dietState.totalTime || ''}</Text>
          </View>
        </View>
      </View>

      {/* Content Sheet */}
      <View style={localStyles.contentSheet}>
        <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
          {/* Nutrients Row */}
          <View style={localStyles.nutrientsRow}>
            {getVitamins('flame-outline', `${dietState.calories || '0'} Kcal`, 'Calories')}
            <View style={localStyles.divider} />
            {getVitamins('leaf-outline', `${dietState.carbs || '0'} g`, 'Carbs')}
            <View style={localStyles.divider} />
            {getVitamins('water-outline', `${dietState.fat || '0'} g`, 'Fat')}
            <View style={localStyles.divider} />
            {getVitamins('nutrition-outline', `${dietState.protein || '0'} g`, 'Protein')}
          </View>

          <View style={localStyles.separator} />

          {/* Tabs: Ingredients / Instruction */}
          <View style={localStyles.tabsRow}>
            <TouchableOpacity
              style={[localStyles.tab, select && localStyles.activeTab]}
              onPress={() => setSelect(true)}
            >
              <Text style={[localStyles.tabText, select && localStyles.activeTabText]}>
                Ingredients
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[localStyles.tab, !select && localStyles.activeTab]}
              onPress={() => setSelect(false)}
            >
              <Text style={[localStyles.tabText, !select && localStyles.activeTabText]}>
                Instruction
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ padding: 16 }}>
            {select ? ingredients() : instruction()}
          </View>
        </ScrollView>
      </View>

      {isLoading && (
        <View style={localStyles.loaderContainer}>
          <ActivityIndicator size="large" color={C.brand5} />
        </View>
      )}
    </View>
  );
}

const localStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  headerSection: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.37,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 0,
    padding: 8,
  },
  premiumBadge: {
    position: 'absolute',
    top: 58,
    left: 16,
    backgroundColor: C.warning,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  premiumText: {
    fontFamily: FONT.bold,
    fontSize: 10,
    color: C.white,
  },
  favBtn: {
    position: 'absolute',
    top: 60,
    right: 16,
  },
  favBtnInner: {
    padding: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  titleRow: {
    position: 'absolute',
    bottom: 40,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  dietTitle: {
    flex: 1,
    fontFamily: FONT.bold,
    fontSize: 20,
    color: C.white,
    marginRight: 12,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  timeText: {
    fontFamily: FONT.regular,
    fontSize: 13,
    color: C.white,
    marginLeft: 4,
  },
  contentSheet: {
    flex: 1,
    backgroundColor: C.bg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
  },
  nutrientsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  vitaminItem: {
    alignItems: 'center',
    flex: 1,
  },
  vitaminTitle: {
    fontFamily: FONT.bold,
    fontSize: 13,
    color: C.white,
    marginTop: 8,
    textAlign: 'center',
  },
  vitaminSubtitle: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: C.gray30,
    marginTop: 4,
    textAlign: 'center',
  },
  divider: {
    width: 1,
    height: 65,
    backgroundColor: C.border,
    marginHorizontal: 4,
  },
  separator: {
    height: 0.5,
    backgroundColor: C.border,
    marginHorizontal: 16,
  },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1.5,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: C.brand5,
  },
  tabText: {
    fontFamily: FONT.bold,
    fontSize: 14,
    color: C.gray30,
  },
  activeTabText: {
    color: C.brand5,
  },
  htmlContent: {
    paddingHorizontal: 8,
  },
  htmlText: {
    fontFamily: FONT.regular,
    fontSize: 14,
    color: C.white,
    lineHeight: 22,
  },
  loaderContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
