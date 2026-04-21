import { safe_fetch, throw_if_error } from './error';
import type * as Firestore from './types';
import { get_firestore_endpoint } from './utils';

/**
 * Removes a document from Firestore.
 * Reference: {@link https://firebase.google.com/docs/firestore/reference/rest/v1/projects.databases.documents/delete}
 *
 * @param firestore The DB instance.
 * @param document_path The document path.
 *
 * @returns `true` if the deletion was successful.
 */
export const remove = async ({ jwt, project_id }: Firestore.DB, ...paths: string[]) => {
  const endpoint = get_firestore_endpoint(project_id, paths);

  const response = await safe_fetch(endpoint, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });

  if (!response.ok) {
    const data = await response.json();
    throw_if_error(data);
  }

  return true;
};
