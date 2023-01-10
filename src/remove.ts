import type * as Firestore from './types';
import { get_firestore_endpoint } from './utils';

/**
 * Removes a document from Firestore.
 * Reference: {@link https://firebase.google.com/docs/firestore/reference/rest/v1/projects.databases.documents/delete}
 *
 * @param firestore The DB instance.
 * @param args The document path.
 *
 * @returns `true` if the deletion was successful.
 */
export const remove = async ({ jwt, project_id }: Firestore.DB, ...args: string[]) => {
  const endpoint = get_firestore_endpoint(project_id);
  const document_path = args.join('/');

  const response = await fetch(`${endpoint}/${document_path}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });

  return response.ok;
};
