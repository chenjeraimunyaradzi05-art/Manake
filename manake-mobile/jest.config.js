/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  cacheDirectory: '<rootDir>/.jest/cache',
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native|@react-native-community|expo(nent)?|@expo(nent)?|expo-modules-core|expo-router|@expo/vector-icons|react-native-safe-area-context|react-native-screens|@testing-library/react-native)/)',
  ],
};
