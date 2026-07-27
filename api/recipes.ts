import apiClient from './client';

export interface RecipeListItem {
  id: number;
  title: string;
  slug: string;
  type: string;
  meal_type: string[];
  recipe_category: string[];
  recipe_tag: string[];
  preparation_time: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  recipe_image: string | null;
  is_favourite: number;
}

export interface RecipeDetail {
  id: number;
  title: string;
  slug: string;
  type: string;
  meal_type: string;
  description: string;
  preparation_time: number;
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
  is_favourite: number;
  recipe_categories: { id: number; name: string }[];
  recipe_tags: { id: number; name: string }[];
}

export interface RecipeStep {
  id: number;
  instruction: string;
  sequence: number;
}

export interface RecipeIngredient {
  id: number;
  ingredient_id: number;
  ingredient_title: string;
  measurement_unit_id: number;
  measurement_unit_title: string;
  quantity: number;
  amount: number;
  quantity_grams: number;
  quantity_display: string;
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
}

export interface RecipeDetailResponse {
  data: RecipeDetail;
  recipe_steps: RecipeStep[];
  recipe_ingredients: RecipeIngredient[];
}

export interface RecipeCategory {
  id: number;
  title: string;
  slug: string;
  status: string;
  recipe_category_image: string | null;
}

export interface RecipeTag {
  id: number;
  title: string;
  slug: string;
  status: string;
  recipe_tag_image: string | null;
}

export interface MacroNutrient {
  id: number;
  title: string;
  value: string;
  unit: string;
}

export interface Pagination {
  total_items: number;
  per_page: number;
  currentPage: number;
  totalPages: number;
}

export interface RecipeListResponse {
  data: RecipeListItem[];
  pagination: Pagination;
}

export const recipesApi = {
  getFilteredList: (params?: Record<string, any>) =>
    apiClient.get<RecipeListResponse>('recipe-filter-list', { params }),

  getDetail: (id: number) =>
    apiClient.get<RecipeDetailResponse>(`recipe-detail/${id}`),

  saveDailyPlanRecipe: (daily_plan_id: number, recipe_id: number, meal_type: string) =>
    apiClient.post('save-daily-plan-recipe', { daily_plan_id, recipe_id, meal_type }),

  deleteDailyPlanRecipe: (id: number) =>
    apiClient.post('daily-plan-recipe-delete', { id }),

  deleteAllDailyPlanRecipes: (daily_plan_id: number) =>
    apiClient.post('daily-plan-recipe-delete-all', { daily_plan_id }),

  getMacroNutrients: () =>
    apiClient.get<{ data: MacroNutrient[] }>('get-macro-nutrient'),

  getCategories: (page: number = 1, per_page?: number) =>
    apiClient.get<{ data: RecipeCategory[]; pagination: Pagination }>('recipecategory-list', { params: { page, per_page } }),

  getTags: (page: number = 1, per_page?: number) =>
    apiClient.get<{ data: RecipeTag[]; pagination: Pagination }>('recipetag-list', { params: { page, per_page } }),

  setFavourite: (recipe_id: number) =>
    apiClient.post('set-favourite-recipe', { recipe_id }),

  getFavourite: (page: number = 1) =>
    apiClient.get<RecipeListResponse>(`get-favourite-recipe?page=${page}`),
};
