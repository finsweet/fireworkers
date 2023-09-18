/* eslint-disable @typescript-eslint/no-explicit-any */
import { extract_fields_from_document } from './fields';
import type * as Firestore from './types';
import { get_firestore_endpoint } from './utils';

/**
 * Gets a single document from Firestore.
 * Reference: {@link https://firebase.google.com/docs/firestore/reference/rest/v1/projects.databases.documents/get}
 *
 * @param firestore The DB instance.
 * @param document_path The document path.
 */
export const get = async <Fields extends Record<string, any>>(
  { jwt, project_id }: Firestore.DB,
  ...paths: string[]
) => {
  const endpoint = get_firestore_endpoint(project_id, paths);

  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });

  const data: Firestore.GetResponse = await response.json();

  if ('error' in data) throw new Error(data.error.message);

  const document = extract_fields_from_document<Fields>(data);
  return document;
};
