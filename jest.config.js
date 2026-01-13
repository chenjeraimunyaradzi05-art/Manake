/** @type {import('jest').Config} */
module.exports = {
  // This repo uses Vitest for `manake-web`.
  // Keep Jest scoped to React Native (Expo) tests only.
  projects: ['<rootDir>/manake-mobile/jest.config.js'],
};
