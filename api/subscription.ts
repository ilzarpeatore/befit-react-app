import apiClient from './client';

export interface PackageItem {
  id: number;
  name: string;
  description: string | null;
  price: number;
  duration: number;
  duration_unit: 'day' | 'week' | 'month' | 'year';
  status: string;
  training_program_id: number | null;
  training_program_title: string | null;
  meal_plan_template_id: number | null;
  meal_plan_template_title: string | null;
}

export interface SubscriptionPlanItem {
  id: number;
  user_id: number;
  package_id: number;
  package_name: string;
  total_amount: number;
  payment_type: string;
  payment_status: string;
  status: string;
  subscription_start_date: string;
  subscription_end_date: string;
  created_at: string;
}

export interface PaymentGatewayItem {
  id: number;
  title: string;
  image: string;
}

interface PaginatedResponse<T> {
  pagination: { total_items: number; per_page: number; currentPage: number; totalPages: number };
  data: T[];
}

export const subscriptionApi = {
  getPackageList: () =>
    apiClient.get<PaginatedResponse<PackageItem>>('package-list?per_page=-1'),

  // Auto-suscripción del cliente a un Package de contenido (Training/Nutrición).
  // Sin pago real todavía (Fase 4) — crea la Subscription directamente como
  // pagada/activa para validar el resto del flujo de punta a punta.
  subscribeToPackage: (package_id: number) =>
    apiClient.post<{ message: string; data: SubscriptionPlanItem }>('subscribe-to-package', { package_id }),

  getSubscriptionPlanList: () =>
    apiClient.get<PaginatedResponse<SubscriptionPlanItem>>('subscriptionplan-list?per_page=-1'),

  cancel: (subscription_id: number) =>
    apiClient.post('cancel-subscription', { id: subscription_id }),

  getPaymentGateways: () =>
    apiClient.get<{ data: PaymentGatewayItem[] }>('payment-gateway-list'),
};
