import apiClient from './client';

export interface LoginPayload {
  email: string;
  password: string;
  user_type?: string;
}

export interface LoginResponse {
  data: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    user_type: string;
    status: string;
    login_type: string;
    gender: string;
    display_name: string;
    api_token: string;
    profile_image: string;
    is_subscribe: number;
    is_personal_client: boolean;
    created_at: string;
    updated_at: string;
  };
}

export interface SocialLoginPayload {
  email: string;
  login_type: string;
}

export interface SocialOtpLoginPayload {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  login_type: string;
  user_type: string;
  accessToken: string;
  phone_number: string;
  player_id: string;
}

export interface SocialOtpLoginResponse {
  status: boolean;
  message?: string;
  is_user_exist?: boolean;
  data?: LoginResponse['data'];
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  user_type?: string;
  status?: string;
  phone_number?: string;
  gender?: string;
  invite_code?: string;
}

export const authApi = {
  login: (payload: LoginPayload) =>
    apiClient.post<LoginResponse>('login', payload),

  register: (payload: RegisterPayload) =>
    apiClient.post('register', payload),

  // Valida un código de invitación de cliente de entrenamiento personal
  // antes de enviar el registro, para poder mostrar una confirmación.
  checkInviteCode: (code: string) =>
    apiClient.post<{ data: { valid: boolean; reason?: string; first_name?: string | null; last_name?: string | null } }>('check-invite-code', { code }),

  socialLogin: (payload: SocialLoginPayload) =>
    apiClient.post('social-mail-login', payload),

  socialOtpLogin: (payload: SocialOtpLoginPayload) =>
    apiClient.post<SocialOtpLoginResponse>('social-otp-login', payload),

  updateProfile: (payload: Record<string, any>) =>
    apiClient.post('update-profile', payload),

  getUserDetail: (id: number) =>
    apiClient.get(`user-detail?id=${id}`),

  changePassword: (payload: { old_password: string; new_password: string }) =>
    apiClient.post('change-password', payload),

  forgotPassword: (payload: { email: string }) =>
    apiClient.post('forget-password', payload),
};
