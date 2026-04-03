/**
 * api.ts — Axios instance for all RakshaAI backend requests.
 *
 * - Base URL: EXPO_PUBLIC_API_BASE_URL (never hardcoded)
 * - Auth: JWT from expo-secure-store attached to every request
 * - 401 handling: clears token and navigates to Login via navigationRef
 */
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from '@/utils/constants';

// navigationRef is set in App.tsx and used here for 401 redirects
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- navigationRef typed loosely to avoid circular dep
let _navigationRef: any = null;

export const setNavigationRef = (ref: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
  _navigationRef = ref;
};

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:5000/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach JWT ──────────────────────────────────────────
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(STORAGE_KEYS.authToken);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: handle 401 ────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.authToken);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.user);
      // Navigate to Login screen if navigationRef is available
      _navigationRef?.navigate?.('Login');
    }
    return Promise.reject(error);
  },
);
