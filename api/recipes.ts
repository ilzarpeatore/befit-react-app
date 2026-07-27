import apiClient from './client';

export interface RecipeListItem {
  id: number;
  title: string;
  image: string;
  calories: string;
  description: string;
  is_favourite: number;
}

export interface RecipeCategory {
  id: number;
  title: string;
  image: string;
}

export interface RecipeTag {
  id: number;
  title: string;
}

export interface MacroNutrient {
  id: number;
  title: string;
  value: string;
  unit: string;
}

export interface RecipeListResponse {
  data: RecipeListItem[];
  pagination: {
    total_items: number;
    per_page: number;
    current_page: number;
    total_pages: number;
  };
}

export const recipesApi = {
  getFilteredList: (params?: Record<string, any>) =>
    apiClient.get<RecipeListResponse>('recipe-filter-list', { params }),

  saveDailyPlanRecipe: (daily_plan_id: number, recipe_id: number, meal_type: string) =>
    apiClient.post('save-daily-plan-recipe', { daily_plan_id, recipe_id, meal_type }),

  deleteDailyPlanRecipe: (id: number) =>
    apiClient.post('daily-plan-recipe-delete', { id }),

  deleteAllDailyPlanRecipes: (daily_plan_id: number) =>
    apiClient.post('daily-plan-recipe-delete-all', { daily_plan_id }),

  getMacroNutrients: () =>
    apiClient.get<{ data: MacroNutrient[] }>('get-macro-nutrient'),

  getCategories: () =>
    apiClient.get<{ data: RecipeCategory[] }>('recipecategory-list'),

  getTags: () =>
    apiClient.get<{ data: RecipeTag[] }>('recipetag-list'),

  setFavourite: (recipe_id: number) =>
    apiClient.post('set-favourite-recipe', { recipe_id }),

  getFavourite: (page: number = 1) =>
    apiClient.get<RecipeListResponse>(`get-favourite-recipe?page=${page}`),
};
