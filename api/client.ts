import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

function resolveBaseUrl(): string {
  if (__DEV__) {
    const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest?.debuggerHost;
    const ip = hostUri?.split(':')[0];
    if (ip) return `http://${ip}:8000/api`;
  }
  if (__DEV__) {
    // USB con adb reverse tcp:8000 tcp:8000 (ver docs/ARRANQUE_DESARROLLO.md) - inmune a cambios de IP
    return 'http://localhost:8000/api';
  }
  return Constants.expoConfig?.extra?.apiBaseUrl
    || (Constants as any).manifest?.extra?.apiBaseUrl
    || 'http://192.168.1.145:8000/api';
}

const BASE_URL = resolveBaseUrl();

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Accept': 'application/json; charset=utf-8',
    'Cache-Control': 'no-cache',
  },
});

let logoutHandler: (() => void) | null = null;

export function setLogoutHandler(handler: () => void) {
  logoutHandler = handler;
}

apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('TOKEN');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('TOKEN');
      if (logoutHandler) {
        logoutHandler();
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
