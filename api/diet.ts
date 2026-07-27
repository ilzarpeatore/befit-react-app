import apiClient from './client';

export interface DietListItem {
  id: number;
  title: string;
  calories: string;
  carbs: string;
  protein: string;
  fat: string;
  servings: string;
  total_time: string;
  is_featured: string;
  diet_image: string;
  is_premium: number;
  is_favourite: number;
}

export interface DietListResponse {
  data: DietListItem[];
  pagination: {
    total_items: number;
    per_page: number;
    current_page: number;
    total_pages: number;
  };
}

export interface DietCategory {
  id: number;
  title: string;
  category_image: string;
}

export interface DailyPlanData {
  id: number;
  user_id: number;
  date: string;
  eaten: number;
  left_eat: number;
  daily_kcal: number;
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
  meal_type: {
    id: number;
    title: string;
    recipe: {
      id: number;
      title: string;
      calories: number;
      protein: number;
      carbs: number;
      fats: number;
      recipe_image: string;
    }[];
  }[];
}

export interface DietDetailItem {
  id: number;
  title: string;
  calories: string;
  carbs: string;
  protein: string;
  fat: string;
  servings: string;
  total_time: string;
  is_featured: string;
  status: string;
  ingredients: string;
  description: string;
  diet_image: string;
  is_premium: number;
  categorydiet_id: number | null;
  categorydiet_title: string | null;
}

export interface RecipeDetail {
  id: number;
  title: string;
  description: string;
  preparation_time: number;
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
  recipe_image?: string;
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

export const dietApi = {
  getDashboard: () =>
    apiClient.get<{ data: DietListItem[] }>('diet-dashboard'),

  getList: (params: { is_featured?: boolean; categorydiet_id?: number; page?: number }) =>
    apiClient.get<DietListResponse>('diet-list', { params }),

  search: (title: string, page: number = 1) =>
    apiClient.get<DietListResponse>(`diet-list?title=${encodeURIComponent(title)}&page=${page}`),

  getCategories: (page: number = 1) =>
    apiClient.get<{ data: DietCategory[] }>(`categorydiet-list?page=${page}`),

  setFavourite: (dietId: number) =>
    apiClient.post('set-favourite-diet', { diet_id: dietId }),

  getFavourite: (page: number = 1) =>
    apiClient.get<DietListResponse>(`get-favourite-diet?page=${page}`),

  getDailyPlan: (date: string) =>
    apiClient.get<{ data: DailyPlanData }>(`daily-plan-detail?date=${date}`),

  getRecipeDetail: (id: number) =>
    apiClient.get<RecipeDetailResponse>(`recipe-detail/${id}`),

  getDetail: (id: number) =>
    apiClient.post<{ data: DietDetailItem }>('diet-detail', null, { params: { id } }),
};
