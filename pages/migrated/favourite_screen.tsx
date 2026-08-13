import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Image, SafeAreaView, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';
import { workoutTemplateApi } from '../../api/workoutTemplate';
import { recipesApi } from '../../api/recipes';
import logger from '@helper/logger';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface FavouriteScreenProps {
  navigation: any;
  route: {
    params: {
      index?: number;
    };
  };
}

export default function FavouriteScreen(props: FavouriteScreenProps) {
  const initialIndex = props.route.params?.index ?? 0;

  const [select, setSelect] = useState(initialIndex === 0);

  useEffect(() => {
    setSelect(initialIndex === 0);
  }, [initialIndex]);

  return (
    <SafeAreaView style={localStyles.container}>
      {/* App Bar */}
      <View style={localStyles.appBar}>
        <TouchableOpacity onPress={() => props.navigation.goBack()} style={localStyles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={localStyles.appBarTitle}>Favourite Workouts & Nutritions</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tab Bar */}
      <View style={localStyles.tabBarContainer}>
        <View style={localStyles.tabBar}>
          <TouchableOpacity
            style={[localStyles.tab, select && localStyles.activeTab]}
            onPress={() => setSelect(true)}
          >
            <Text style={[localStyles.tabText, select && localStyles.activeTabText]}>
              Workouts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[localStyles.tab, !select && localStyles.activeTab]}
            onPress={() => setSelect(false)}
          >
            <Text style={[localStyles.tabText, !select && localStyles.activeTabText]}>
              Recipes
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <View style={localStyles.body}>
        {select ? (
          <WorkoutsFavContent navigation={props.navigation} />
        ) : (
          <RecipesFavContent navigation={props.navigation} />
        )}
      </View>
    </SafeAreaView>
  );
}

function WorkoutsFavContent({ navigation }: { navigation: any }) {
  // Antes leia workoutsApi.getFavourite() (Workout v1 legacy, "Rutinas" - ya
  // retirado de Home). El cliente hoy favorita WorkoutTemplate (v2) desde el
  // boton bookmark de workout_preview_screen.tsx (workoutTemplateApi.setFavourite) -
  // por eso nunca se veia nada aqui aunque el usuario si marcara favoritos.
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    setIsLoading(true);
    try {
      const res = await workoutTemplateApi.getFavourite(1, 50);
      setWorkouts(res.data.data ?? []);
    } catch (e) {
      logger.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={localStyles.centerContent}>
        <ActivityIndicator size="large" color={C.orange} />
      </View>
    );
  }

  if (workouts.length === 0) {
    return (
      <View style={localStyles.centerContent}>
        <Text style={localStyles.emptyText}>No favourite workouts</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={workouts}
      keyExtractor={(item, i) => `${item.id}-${i}`}
      contentContainerStyle={{ padding: 16 }}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={localStyles.listItem}
          onPress={() =>
            navigation.navigate('MigratedWorkoutPreview', {
              workoutTemplateId: item.id,
              mTitle: item.title,
            })
          }
          activeOpacity={0.7}
        >
          {item.thumbnail ? (
            <Image source={{ uri: item.thumbnail }} style={localStyles.itemThumb} />
          ) : null}
          <Text style={localStyles.listItemTitle}>{item.title || ''}</Text>
        </TouchableOpacity>
      )}
    />
  );
}

function RecipesFavContent({ navigation }: { navigation: any }) {
  // Antes leia dietApi.getFavourite() (Diet legacy - catalogo de dietas
  // completas, no lo que el usuario marca favorito de verdad). Las recetas
  // reales se favoritan desde diet_detail_screen.tsx (recipesApi.setFavourite),
  // mismo endpoint que ya usa favourite_recipe_screen.tsx.
  const [recipes, setRecipes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    setIsLoading(true);
    try {
      const res = await recipesApi.getFavourite(1);
      setRecipes(res.data.data ?? []);
    } catch (e) {
      logger.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={localStyles.centerContent}>
        <ActivityIndicator size="large" color={C.orange} />
      </View>
    );
  }

  if (recipes.length === 0) {
    return (
      <View style={localStyles.centerContent}>
        <Text style={localStyles.emptyText}>No favourite recipes</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={recipes}
      keyExtractor={(item, i) => `${item.id}-${i}`}
      contentContainerStyle={{ padding: 16 }}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={localStyles.listItem}
          onPress={() =>
            navigation.navigate('MigratedDietDetail', {
              recipeId: item.id,
              recipeImage: item.recipe_image || '',
            })
          }
          activeOpacity={0.7}
        >
          {item.recipe_image ? (
            <Image source={{ uri: item.recipe_image }} style={localStyles.itemThumb} />
          ) : null}
          <Text style={localStyles.listItemTitle}>{item.title || ''}</Text>
        </TouchableOpacity>
      )}
    />
  );
}

const localStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: C.bg,
  },
  backBtn: { padding: 8 },
  appBarTitle: {
    flex: 1,
    fontFamily: FONT.bold,
    fontSize: 16,
    color: C.white,
    textAlign: 'center',
  },
  tabBarContainer: {
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
    paddingHorizontal: 16,
  },
  tabBar: {
    flexDirection: 'row',
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
    color: C.textPrimary,
  },
  body: { flex: 1 },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: FONT.regular,
    fontSize: 14,
    color: C.gray30,
  },
  listItem: {
    backgroundColor: C.surfaceLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  listItemTitle: {
    flex: 1,
    fontFamily: FONT.semiBold,
    fontSize: 14,
    color: C.white,
  },
});