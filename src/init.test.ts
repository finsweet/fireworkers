import { generateKeyPairSync } from 'crypto';
import { describe, expect, it } from 'vitest';

import { init } from './init';

// Generate a throwaway RSA key pair at test time — no stored secrets.
const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const TEST_PRIVATE_KEY = privateKey.export({ type: 'pkcs8', format: 'pem' }) as string;

const BASE_PARAMS = {
  project_id: 'test-project',
  uid: 'test-user',
  client_email: 'test@test-project.iam.gserviceaccount.com',
  private_key: TEST_PRIVATE_KEY,
  private_key_id: 'test-key-id',
};

describe('init', () => {
  it('returns a DB instance with the correct project_id', async () => {
    const db = await init(BASE_PARAMS);
    expect(db.project_id).toBe('test-project');
  });

  it('returns a DB instance with a signed JWT string', async () => {
    const db = await init(BASE_PARAMS);
    expect(typeof db.jwt).toBe('string');
    // A JWT is always three base64url segments separated by dots
    expect(db.jwt.split('.').length).toBe(3);
  });

  it('embeds custom claims in the JWT payload', async () => {
    const db = await init({ ...BASE_PARAMS, claims: { premium_account: 'true' } });
    const payload = JSON.parse(Buffer.from(db.jwt.split('.')[1]!, 'base64url').toString());
    expect(payload.claims).toEqual({ premium_account: 'true' });
  });

  it('uses an empty claims object when none is provided', async () => {
    const db = await init(BASE_PARAMS);
    const payload = JSON.parse(Buffer.from(db.jwt.split('.')[1]!, 'base64url').toString());
    expect(payload.claims).toEqual({});
  });

  it('throws when given an invalid private key', async () => {
    await expect(init({ ...BASE_PARAMS, private_key: 'not-a-real-key' })).rejects.toThrow();
  });
});
