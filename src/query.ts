/* eslint-disable @typescript-eslint/no-explicit-any */
import { FIRESTORE_ENDPOINT } from './constants';
import { extract_fields_from_document } from './fields';
import type * as Firestore from './types';

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
 * @param firestore
 * @param query
 */
export const query = async <Fields extends Record<string, any>>(
  { jwt, project_id }: Firestore.DB,
  query: Firestore.StructuredQuery
) => {
  const payload: RunQueryRequest = {
    structuredQuery: query,
  };

  const response = await fetch(
    `${FIRESTORE_ENDPOINT}/v1/projects/${project_id}/databases/(default)/documents:runQuery`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    }
  );

  const data: RunQueryResponse = await response.json();

  const documents = data.reduce<Firestore.CustomDocument<Fields>[]>((acc, { document }) => {
    if (!document) return acc;

    acc.push(extract_fields_from_document<Fields>(document));
    return acc;
  }, []);

  return documents;
};
