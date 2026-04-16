import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    env: {
      // Port must match the firestore emulator port in firebase.json
      FIRESTORE_EMULATOR_HOST: '127.0.0.1:8080',
    },
    // Allow time for emulator round-trips
    testTimeout: 15000,
  },
});
