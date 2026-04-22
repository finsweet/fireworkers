/* eslint-disable @typescript-eslint/no-explicit-any */
import { safe_fetch, throw_if_error } from './error';
import { create_document_from_fields, extract_fields_from_document } from './fields';
import type * as Firestore from './types';
import { get_firestore_endpoint } from './utils';

/**
 * Updates a document.
 * Similar to the SDK's [updateDoc](https://firebase.google.com/docs/reference/js/firestore_.md#updatedoc).
 *
 * Reference: {@link https://firebase.google.com/docs/firestore/reference/rest/v1/projects.databases.documents/patch}
 *
 * @param firestore
 * @param document_path
 * @param fields
 */
export const update = async <Fields extends Record<string, any>>(
  { jwt, project_id }: Firestore.DB,
  ...args: [...string[], Fields]
) => {
  const paths = args.slice(0, -1) as string[];
  const fields = args.at(-1) as Fields;

  const payload = create_document_from_fields(fields);
  const endpoint = get_firestore_endpoint(project_id, paths);

  // Fail if the document doesn't exist, similar to the SDK's [updateDoc](https://firebase.google.com/docs/reference/js/firestore_.md#updatedoc)
  endpoint.searchParams.set('currentDocument.exists', 'true');

  // Ensure that the fields are updated without overwriting the rest of the document
  for (const key in fields) {
    endpoint.searchParams.append('updateMask.fieldPaths', key);
  }

  const response = await safe_fetch(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(payload),
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });

  const data: Firestore.GetResponse = await response.json();

  throw_if_error(data);

  const document = extract_fields_from_document<Fields>(data);
  return document;
};
