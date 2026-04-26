import { Platform } from 'react-native';

const defaultHost = Platform.OS === 'android' ? '192.168.100.184' : '127.0.0.1';
const rawBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
const normalizedBaseUrl = (
  rawBaseUrl && rawBaseUrl.length > 0 ? rawBaseUrl : `http://${defaultHost}:8000`
).replace(/\/+$/, '');

// export const API_BASE_URL = normalizedBaseUrl.endsWith('/api/v1')
//   ? normalizedBaseUrl
//   : `${normalizedBaseUrl}/api/v1`;

export const API_BASE_URL ='http://192.168.100.184:8000/api/v1'
