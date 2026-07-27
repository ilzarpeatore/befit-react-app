import apiClient from './client';

export interface ShoppingListItem {
  id: number;
  name: string;
  items: ShoppingListTodoItem[];
  created_at: string;
}

export interface ShoppingListTodoItem {
  id: number;
  name: string;
  quantity: string;
  unit: string;
  is_checked: number;
  list_id: number;
}

export interface ShoppingListResponse {
  data: ShoppingListItem[];
}

export interface MeasurementUnit {
  id: number;
  title: string;
}

export const shoppingApi = {
  getList: () =>
    apiClient.get<ShoppingListResponse>('shopping-list'),

  save: (name: string, items: { name: string; quantity: string; unit: string }[]) =>
    apiClient.post('shopping-list-save', { name, items }),

  getDetail: (id: number) =>
    apiClient.get<{ data: ShoppingListItem }>('shopping-list-detail', { params: { id } }),

  delete: (id: number) =>
    apiClient.post('shopping-list-delete', { id }),

  toggleItem: (item_id: number, list_id: number) =>
    apiClient.post('shopping-list-item-toggle', { item_id, list_id }),

  addItem: (list_id: number, name: string, quantity: string, unit: string) =>
    apiClient.post('shopping-list-item-add', { list_id, name, quantity, unit }),

  generateFromPlan: (daily_plan_id: number) =>
    apiClient.post('daily-plan-shopping-list-generate', { daily_plan_id }),

  getMeasurementUnits: () =>
    apiClient.get<{ data: MeasurementUnit[] }>('get-measurementunit'),
};
