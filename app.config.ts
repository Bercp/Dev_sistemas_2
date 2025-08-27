import 'dotenv/config';
import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Check-in de Evento',      
  slug: 'checkin-de-evento',       
  scheme: 'eventcheckin',
  version: '1.0.0',
  orientation: 'portrait',
  platforms: ['ios', 'android'],
  assetBundlePatterns: ['**/*'],
  extra: {
    BASE_URL: process.env.BASE_URL,
    EVENT_ID: process.env.EVENT_ID,
    TOKEN: process.env.TOKEN
  },
};
export default config;
