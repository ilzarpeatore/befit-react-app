import React, { useState, useEffect } from 'react';
import { FlatList, Image, SafeAreaView, ActivityIndicator } from 'react-native';
import { Box } from '@components/ui/box';
import { Text } from '@components/ui/text';
import { Pressable } from '@components/ui/pressable';
import ScreenHeader from '@components/ScreenHeader';
import { workoutTemplateApi } from '../../api/workoutTemplate';
import { recipesApi } from '../../api/recipes';
import logger from '@helper/logger';

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
    <SafeAreaView style={{ flex: 1 }} className="bg-background">
      {/* App Bar */}
      <ScreenHeader title="Favourite Workouts & Nutritions" onBack={() => props.navigation.goBack()} />

      {/* Tab Bar */}
      <Box className="border-b border-border px-4">
        <Box className="flex-row">
          <Pressable
            style={{ paddingBottom: 8 }}
            className={`flex-1 items-center border-b-2 ${select ? 'border-foreground' : 'border-transparent'}`}
            onPress={() => setSelect(true)}
          >
            <Text weight="bold" size="sm" className={select ? 'text-foreground' : 'text-muted-foreground'}>
              Workouts
            </Text>
          </Pressable>
          <Pressable
            style={{ paddingBottom: 8 }}
            className={`flex-1 items-center border-b-2 ${!select ? 'border-foreground' : 'border-transparent'}`}
            onPress={() => setSelect(false)}
          >
            <Text weight="bold" size="sm" className={!select ? 'text-foreground' : 'text-muted-foreground'}>
              Recipes
            </Text>
          </Pressable>
        </Box>
      </Box>

      {/* Content */}
      <Box className="flex-1">
        {select ? (
          <WorkoutsFavContent navigation={props.navigation} />
        ) : (
          <RecipesFavContent navigation={props.navigation} />
        )}
      </Box>
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
      <Box className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#000000" />
      </Box>
    );
  }

  if (workouts.length === 0) {
    return (
      <Box className="flex-1 items-center justify-center">
        <Text muted size="sm">No favourite workouts</Text>
      </Box>
    );
  }

  return (
    <FlatList
      data={workouts}
      keyExtractor={(item, i) => `${item.id}-${i}`}
      contentContainerStyle={{ padding: 16, gap: 10 }}
      renderItem={({ item }) => (
        <Pressable
          className="flex-row items-center gap-3 bg-secondary rounded-lg p-4"
          onPress={() =>
            navigation.navigate('MigratedWorkoutPreview', {
              workoutTemplateId: item.id,
              mTitle: item.title,
            })
          }
        >
          {item.thumbnail ? (
            <Image source={{ uri: item.thumbnail }} style={{ width: 44, height: 44, borderRadius: 8 }} />
          ) : null}
          <Text weight="semibold" size="sm" className="flex-1">
            {item.title || ''}
          </Text>
        </Pressable>
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
      <Box className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#000000" />
      </Box>
    );
  }

  if (recipes.length === 0) {
    return (
      <Box className="flex-1 items-center justify-center">
        <Text muted size="sm">No favourite recipes</Text>
      </Box>
    );
  }

  return (
    <FlatList
      data={recipes}
      keyExtractor={(item, i) => `${item.id}-${i}`}
      contentContainerStyle={{ padding: 16, gap: 10 }}
      renderItem={({ item }) => (
        <Pressable
          className="flex-row items-center gap-3 bg-secondary rounded-lg p-4"
          onPress={() =>
            navigation.navigate('MigratedDietDetail', {
              recipeId: item.id,
              recipeImage: item.recipe_image || '',
            })
          }
        >
          {item.recipe_image ? (
            <Image source={{ uri: item.recipe_image }} style={{ width: 44, height: 44, borderRadius: 8 }} />
          ) : null}
          <Text weight="semibold" size="sm" className="flex-1">
            {item.title || ''}
          </Text>
        </Pressable>
      )}
    />
  );
}
