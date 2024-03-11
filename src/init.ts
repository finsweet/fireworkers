import { sign } from '@tsndr/cloudflare-worker-jwt';

import type * as Firestore from './types';
import { FIRESTORE_ENDPOINT } from './utils';

const algorithm = 'RS256';
const aud = `${FIRESTORE_ENDPOINT}/`;

/**
 * Inits a Firestore instance by creating a [custom token](https://firebase.google.com/docs/auth/admin/create-custom-tokens).
 *
 * @param params
 * @returns A {@link Firestore.DB} object.
 */
export const init = async ({
  client_email,
  private_key,
  private_key_id,
  uid,
  project_id,
  claims = {},
}: {
  project_id: string;
  private_key_id: string;
  client_email: string;
  private_key: string;
  uid: string;
  claims?: Record<string, string>;
}): Promise<Firestore.DB> => {
  const jwt = await sign(
    {
      aud,
      uid,
      claims,
      sub: client_email,
      iss: client_email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
      ...claims,
    },
    private_key,
    { algorithm, header: { kid: private_key_id } }
  );

  return {
    project_id,
    jwt,
  };
};
