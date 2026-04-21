/* eslint-disable @typescript-eslint/no-explicit-any */
import { safe_fetch, throw_if_error } from './error';
import { extract_fields_from_document } from './fields';
import type * as Firestore from './types';
import { get_firestore_endpoint } from './utils';

type RunQueryRequest = {
  parent?: string;
  structuredQuery?: Firestore.StructuredQuery;
  transaction?: string;
  newTransaction?: Firestore.TransactionOptions;
  readTime?: string;
};

type RunQueryResponse = Array<{
  transaction?: string;
  document?: Firestore.Document;
  readTime?: string;
  skippedResults?: number;
}>;

/**
 * Performs a query to Firestore.
 * Reference: {@link https://firebase.google.com/docs/firestore/reference/rest/v1/projects.databases.documents/runQuery}
 *
 * @param firestore The DB instance.
 * @param query A [StructuredQuery](https://firebase.google.com/docs/firestore/reference/rest/v1/StructuredQuery) object.
 */
export const query = async <Fields extends Record<string, any>>(
  { jwt, project_id }: Firestore.DB,
  query: Firestore.StructuredQuery,
  ...paths: string[]
) => {
  const endpoint = get_firestore_endpoint(project_id, paths, ':runQuery');
  const payload: RunQueryRequest = {
    structuredQuery: query,
  };

  const response = await safe_fetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });

  const data: RunQueryResponse | { error: Firestore.Status } = await response.json();
  throw_if_error<RunQueryResponse>(data);

  const documents = data.reduce<Firestore.CustomDocument<Fields>[]>((acc, { document }) => {
    if (!document) return acc;

    acc.push(extract_fields_from_document<Fields>(document));
    return acc;
  }, []);

  return documents;
};
