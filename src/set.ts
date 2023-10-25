/* eslint-disable @typescript-eslint/no-explicit-any */
import { create_document_from_fields, extract_fields_from_document } from './fields';
import type * as Firestore from './types';
import { get_firestore_endpoint } from './utils';

type Options = {
  merge?: boolean;
};

/**
 * Writes to a document. If the document does not yet exist, it will be created.
 * Similar to the SDK's [setDoc](https://firebase.google.com/docs/reference/js/firestore_.md#setdoc).
 *
 * Reference: {@link https://firebase.google.com/docs/firestore/reference/rest/v1/projects.databases.documents/patch}
 *
 * @param firestore
 * @param document_path
 * @param fields
 */
export const set = async <Fields extends Record<string, any>>(
  { jwt, project_id }: Firestore.DB,
  ...args: [...string[], Fields] | [...string[], Fields, Options]
) => {
  let paths;
  let fields;
  let options;

  if (typeof args.at(-2) === 'object') {
    paths = args.slice(0, -2) as string[];
    fields = args.at(-2) as Fields;
    options = args.at(-1) as Options;
  } else {
    paths = args.slice(0, -1) as string[];
    fields = args.at(-1) as Fields;
  }

  const payload = create_document_from_fields(fields);
  const endpoint = get_firestore_endpoint(project_id, paths);

  if (options?.merge) {
    // Ensure that the fields are updated without overwriting the rest of the document
    for (const key in fields) {
      endpoint.searchParams.append('updateMask.fieldPaths', key);
    }
  }

  const response = await fetch(endpoint, {
    method: 'PATCH',
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
