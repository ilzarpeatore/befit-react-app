import apiClient from './client';

// RETIRADO 2026-08-13: PackageItem/subscribeToPackage/getPackageList/cancel/
// getPaymentGateways (autoservicio de compra dentro de la app) — Apple/Google
// exigen que la app no venda contenido digital dentro sin su propio IAP. La
// compra pasa a ser 100% externa (web); el acceso se concede vía Plan/
// PlanSubscription (admin o webhook de Stripe). Esta pantalla ahora es de
// solo lectura, ver GET my-plan / SubscriptionController::myPlan().

export interface MyPlanItem {
  id: number;
  plan_id: number;
  plan_name: string | null;
  price: number | null;
  currency: string;
  payment_status: string;
  payment_method: string | null;
  starts_at: string | null;
  ends_at: string | null;
  canceled_at: string | null;
  created_at: string | null;
}

export interface MyPlanResponse {
  data: {
    active: MyPlanItem | null;
    history: MyPlanItem[];
  };
}

export const subscriptionApi = {
  getMyPlan: () => apiClient.get<MyPlanResponse>('my-plan'),
};
