/* eslint-disable @typescript-eslint/no-explicit-any */
import { create_document_from_fields, extract_fields_from_document } from './fields';
import type * as Firestore from './types';
import { get_firestore_endpoint } from './utils';

/**
 * Gets a single document from Firestore.
 * Reference: {@link https://firebase.google.com/docs/firestore/reference/rest/v1/projects.databases.documents/createDocument}
 *
 * @param firestore
 * @param collection_path
 * @param fields
 */
export const create = async <Fields extends Record<string, any>>(
  { jwt, project_id }: Firestore.DB,
  ...args: [...string[], Fields]
) => {
  const endpoint = get_firestore_endpoint(project_id);
  const collection_path = (args.slice(0, -1) as string[]).join('/');

  const fields = args.at(-1) as Fields;
  const payload = create_document_from_fields(fields);

  const response = await fetch(`${endpoint}/${collection_path}`, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });

  const data: Firestore.GetResponse = await response.json();

  if ('error' in data) throw new Error(data.error.message);

  const document = extract_fields_from_document<Fields>(data);
  return document;
};
