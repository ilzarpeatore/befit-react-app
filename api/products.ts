import apiClient from './client';

export interface ProductDashboard {
  featured: ProductItem[];
  categories: ProductCategoryItem[];
}

export interface ProductCategoryItem {
  id: number;
  title: string;
  image: string;
}

export interface ProductItem {
  id: number;
  title: string;
  description: string;
  image: string;
  price: string;
  category_id: number;
  category_title: string;
}

export interface ProductListResponse {
  data: ProductItem[];
  pagination: {
    total_items: number;
    per_page: number;
    current_page: number;
    total_pages: number;
  };
}

export const productsApi = {
  getDashboard: () =>
    apiClient.get<{ data: ProductDashboard }>('product-dashboard'),

  getCategories: () =>
    apiClient.get<{ data: ProductCategoryItem[] }>('productcategory-list'),

  getList: (params: { category_id?: number; page?: number }) =>
    apiClient.get<ProductListResponse>('product-list', { params }),
};
