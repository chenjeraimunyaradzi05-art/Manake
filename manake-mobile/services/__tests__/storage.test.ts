// Mock expo-secure-store before importing
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

// Mock react-native Platform
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
}));

import { secureStorage, STORAGE_KEYS } from '../storage';
import * as SecureStore from 'expo-secure-store';

describe('SecureStorage Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('setItem', () => {
    it('stores a value using SecureStore', async () => {
      await secureStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'test-token');

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        STORAGE_KEYS.AUTH_TOKEN,
        'test-token'
      );
    });
  });

  describe('getItem', () => {
    it('retrieves a value from SecureStore', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('stored-token');

      const result = await secureStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

      expect(SecureStore.getItemAsync).toHaveBeenCalledWith(STORAGE_KEYS.AUTH_TOKEN);
      expect(result).toBe('stored-token');
    });

    it('returns null when value does not exist', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      const result = await secureStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

      expect(result).toBeNull();
    });
  });

  describe('deleteItem', () => {
    it('deletes a value from SecureStore', async () => {
      await secureStorage.deleteItem(STORAGE_KEYS.AUTH_TOKEN);

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(STORAGE_KEYS.AUTH_TOKEN);
    });
  });

  describe('setObject / getObject', () => {
    it('stores and retrieves objects as JSON', async () => {
      const testObject = { name: 'Test User', id: 123 };

      await secureStorage.setObject(STORAGE_KEYS.USER_DATA, testObject);

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        STORAGE_KEYS.USER_DATA,
        JSON.stringify(testObject)
      );
    });

    it('parses JSON when retrieving objects', async () => {
      const testObject = { name: 'Test User', id: 123 };
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(JSON.stringify(testObject));

      const result = await secureStorage.getObject(STORAGE_KEYS.USER_DATA);

      expect(result).toEqual(testObject);
    });

    it('returns null for invalid JSON', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('invalid-json');

      const result = await secureStorage.getObject(STORAGE_KEYS.USER_DATA);

      expect(result).toBeNull();
    });
  });
});
