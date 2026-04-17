import { generateKeyPairSync } from 'crypto';

import { init } from '../../src/init';
import type { DB } from '../../src/types';

export const TEST_PROJECT_ID = 'test-project';

const EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST ?? '127.0.0.1:8080';

// Generate a throwaway RSA key pair each test run.
// The emulator parses the JWT structure for security rules but does NOT verify
// the signature when the Auth emulator is not running.
const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });

let _db: DB;

export const initDb = async (): Promise<DB> => {
  if (!_db) {
    _db = await init({
      project_id: TEST_PROJECT_ID,
      uid: 'test-user',
      client_email: 'test@test-project.iam.gserviceaccount.com',
      private_key: privateKey.export({ type: 'pkcs8', format: 'pem' }) as string,
      private_key_id: 'test-key-id',
    });
  }
  return _db;
};

/**
 * Deletes all documents in the emulator database so each test starts clean.
 * Uses the emulator-only admin REST endpoint.
 */
export const clearFirestore = async (): Promise<void> => {
  const response = await fetch(
    `http://${EMULATOR_HOST}/emulator/v1/projects/${TEST_PROJECT_ID}/databases/(default)/documents`,
    { method: 'DELETE' }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to clear Firestore emulator: ${response.status} ${response.statusText}`
    );
  }
};
