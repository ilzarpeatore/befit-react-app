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

export interface RecipeDetail {
  id: number;
  title: string;
  description: string;
  preparation_time: number;
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
  recipe_image: string;
  is_favourite: number;
  recipe_ingredients: {
    id: number;
    ingredient_name: string;
    measurement_unit_name: string;
    quantity: number;
    calories: number;
    protein: number;
    fats: number;
    carbs: number;
  }[];
  preparation_methods: string;
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
    apiClient.get<{ data: RecipeDetail }>(`recipe-detail/${id}`),
};
