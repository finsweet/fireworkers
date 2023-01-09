/* eslint-disable @typescript-eslint/no-explicit-any */
import { FIRESTORE_ENDPOINT } from './constants';
import { extract_fields_from_document } from './fields';
import type * as Firestore from './types';

/**
 * Gets a single document from Firestore.
 * Reference: {@link https://firebase.google.com/docs/firestore/reference/rest/v1/projects.databases.documents/get}
 *
 * @param firestore
 * @param collection_id
 * @param document_id
 */
export const get = async <Fields extends Record<string, any>>(
  { jwt, project_id }: Firestore.DB,
  collection_id: string,
  document_id: string
) => {
  const response = await fetch(
    `${FIRESTORE_ENDPOINT}/v1/projects/${project_id}/databases/(default)/documents/${collection_id}/${document_id}`,
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    }
  );

  const data: Firestore.GetResponse = await response.json();

  if ('error' in data) throw new Error(data.error.message);

  const document = extract_fields_from_document<Fields>(data);
  return document;
};
