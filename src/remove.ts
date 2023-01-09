import { FIRESTORE_ENDPOINT } from './constants';
import type * as Firestore from './types';

/**
 * Removes a document from Firestore.
 * Reference: {@link https://firebase.google.com/docs/firestore/reference/rest/v1/projects.databases.documents/delete}
 *
 * @param firestore
 * @param document_id
 * @param context
 *
 * @returns `true` if the deletion was successful.
 */
export const remove = async (
  { jwt, project_id }: Firestore.DB,
  collection_id: string,
  document_id: string
) => {
  const response = await fetch(
    `${FIRESTORE_ENDPOINT}/v1/projects/${project_id}/databases/(default)/documents/${collection_id}/${document_id}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    }
  );

  return response.ok;
};
