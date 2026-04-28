import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  REMEMBER_ME: 'remember_me',
} as const;

// For web, use in-memory storage as fallback
const memoryStorage: Record<string, string> = {};
const isWeb = Platform.OS === 'web';

/**
 * Generic storage operations with web fallback
 */
export const storage = {
  async set<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      if (isWeb) {
        memoryStorage[key] = jsonValue;
      } else {
        await AsyncStorage.setItem(key, jsonValue);
      }
    } catch (error) {
      console.error(`Error storing ${key}:`, error);
    }
  },

  async get<T>(key: string): Promise<T | null> {
    try {
      let value: string | null = null;
      if (isWeb) {
        value = memoryStorage[key] || null;
      } else {
        value = await AsyncStorage.getItem(key);
      }
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error retrieving ${key}:`, error);
      return null;
    }
  },

  async setString(key: string, value: string): Promise<void> {
    try {
      if (isWeb) {
        memoryStorage[key] = value;
      } else {
        await AsyncStorage.setItem(key, value);
      }
    } catch (error) {
      console.error(`Error storing string ${key}:`, error);
    }
  },

  async getString(key: string): Promise<string | null> {
    try {
      if (isWeb) {
        return memoryStorage[key] || null;
      }
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error(`Error retrieving string ${key}:`, error);
      return null;
    }
  },

  async remove(key: string): Promise<void> {
    try {
      if (isWeb) {
        delete memoryStorage[key];
      } else {
        await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
    }
  },

  async clear(): Promise<void> {
    try {
      if (isWeb) {
        Object.keys(memoryStorage).forEach(key => delete memoryStorage[key]);
      } else {
        await AsyncStorage.clear();
      }
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },
};

/**
 * Authentication-related storage
 */
export const authStorage = {
  async setToken(token: string): Promise<void> {
    await storage.setString(STORAGE_KEYS.AUTH_TOKEN, token);
  },

  async getToken(): Promise<string | null> {
    return await storage.getString(STORAGE_KEYS.AUTH_TOKEN);
  },

  async removeToken(): Promise<void> {
    await storage.remove(STORAGE_KEYS.AUTH_TOKEN);
  },

  async hasToken(): Promise<boolean> {
    const token = await authStorage.getToken();
    return !!token;
  },

  async setUserData(userData: any): Promise<void> {
    await storage.set(STORAGE_KEYS.USER_DATA, userData);
  },

  async getUserData(): Promise<any | null> {
    return await storage.get(STORAGE_KEYS.USER_DATA);
  },

  async removeUserData(): Promise<void> {
    await storage.remove(STORAGE_KEYS.USER_DATA);
  },

  async setRememberMe(remember: boolean): Promise<void> {
    await storage.setString(STORAGE_KEYS.REMEMBER_ME, String(remember));
  },

  async getRememberMe(): Promise<boolean> {
    const value = await storage.getString(STORAGE_KEYS.REMEMBER_ME);
    return value === 'true';
  },

  async clearAuthData(): Promise<void> {
    await storage.remove(STORAGE_KEYS.AUTH_TOKEN);
    await storage.remove(STORAGE_KEYS.USER_DATA);
    await storage.remove(STORAGE_KEYS.REMEMBER_ME);
  },
};

export default storage;
