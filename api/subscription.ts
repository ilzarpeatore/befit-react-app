import apiClient from './client';

export interface PackageItem {
  id: number;
  title: string;
  description: string;
  price: string;
  duration: string;
  duration_type: string;
}

export interface SubscriptionPlanItem {
  id: number;
  package_id: number;
  status: string;
  start_date: string;
  end_date: string;
  package: PackageItem;
}

export interface PaymentGatewayItem {
  id: number;
  title: string;
  image: string;
}

export const subscriptionApi = {
  getPackageList: () =>
    apiClient.get<{ data: PackageItem[] }>('package-list'),

  subscribe: (package_id: number, payment_method: string) =>
    apiClient.post('subscribe-package', { package_id, payment_method }),

  getSubscriptionPlanList: () =>
    apiClient.get<{ data: SubscriptionPlanItem[] }>('subscriptionplan-list'),

  cancel: (subscription_id: number) =>
    apiClient.post('cancel-subscription', { subscription_id }),

  getPaymentGateways: () =>
    apiClient.get<{ data: PaymentGatewayItem[] }>('payment-gateway-list'),
};
