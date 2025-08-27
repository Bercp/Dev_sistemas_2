import axios from 'axios';
import Constants from 'expo-constants';

const extra = (Constants?.expoConfig || (Constants as any)?.manifest)?.extra as any;

export const api = axios.create({ baseURL: extra?.BASE_URL, timeout: 15000 });

api.interceptors.request.use((config) => {
  config.headers = config.headers ?? {};
  (config.headers as any).Authorization = extra?.TOKEN;
  return config;
});

export const ENV = { BASE_URL: extra?.BASE_URL, EVENT_ID: extra?.EVENT_ID as string, TOKEN: extra?.TOKEN } as const;
