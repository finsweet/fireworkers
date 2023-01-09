/* eslint-disable @typescript-eslint/no-explicit-any */
import { FIRESTORE_ENDPOINT } from './constants';
import { create_document_from_fields, extract_fields_from_document } from './fields';
import type * as Firestore from './types';

/**
 * Updates a document.
 * Reference: {@link https://firebase.google.com/docs/firestore/reference/rest/v1/projects.databases.documents/patch}
 *
 * @param firestore
 * @param collection_id
 * @param document_id
 * @param fields
 */
export const update = async <Fields extends Record<string, any>>(
  { jwt, project_id }: Firestore.DB,
  collection_id: string,
  document_id: string,
  fields: Fields
) => {
  const payload = create_document_from_fields(fields);

  const response = await fetch(
    `${FIRESTORE_ENDPOINT}/v1/projects/${project_id}/databases/(default)/documents/${collection_id}/${document_id}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
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
