import * as jose from 'jose';

import type * as Firestore from './types';
import { FIRESTORE_ENDPOINT } from './utils';

const alg = 'RS256';
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
  const sign_key = await jose.importPKCS8(private_key.replace(/\\n/g, '\n'), alg);

  const jwt = await new jose.SignJWT({
    aud,
    uid,
    claims,
    sub: client_email,
    iss: client_email,
  })
    .setProtectedHeader({ alg, kid: private_key_id })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(sign_key);

  return {
    project_id,
    jwt,
  };
};
