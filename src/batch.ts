/* eslint-disable @typescript-eslint/no-explicit-any */
import { safe_fetch, throw_if_error } from './error';
import { create_document_from_fields } from './fields';
import type * as Firestore from './types';
import { get_firestore_endpoint } from './utils';

/**
 * Creates a write batch, used for performing multiple writes as a single atomic unit.
 * Similar to the SDK's [writeBatch](https://firebase.google.com/docs/reference/js/firestore_.md#writebatch).
 *
 * Reference: {@link https://firebase.google.com/docs/firestore/reference/rest/v1/projects.databases.documents/commit}
 *
 * @param firestore The DB instance.
 */
export const batch = ({ jwt, project_id }: Firestore.DB) => {
  const writes: Firestore.Write[] = [];
  let committed = false;
  let committing = false;

  const get_document_path = (...paths: string[]) =>
    `projects/${project_id}/databases/(default)/documents/${paths.join('/')}`;

  const assert_not_committed = () => {
    if (committed || committing)
      throw new Error('A write batch can no longer be used after commit() has been called.');
  };

  return {
    /**
     * Adds a set operation to the batch. If the document does not yet exist, it will be created.
     * If you provide `merge: true`, the provided fields will be merged into the existing document.
     *
     * @param paths The path segments to the document.
     * @param fields The fields to write.
     * @param options Optional settings (e.g., `{ merge: true }`).
     */
    set<Fields extends Record<string, any>>(
      paths: string[],
      fields: Fields,
      options?: { merge?: boolean }
    ) {
      assert_not_committed();
      const document = create_document_from_fields(fields);
      document.name = get_document_path(...paths);

      const write: Firestore.Write = { update: document };

      if (options?.merge) {
        write.updateMask = {
          fieldPaths: Object.keys(fields),
        };
      }

      writes.push(write);
    },

    /**
     * Adds an update operation to the batch. The document must already exist.
     *
     * @param paths The path segments to the document.
     * @param fields The fields to update.
     */
    update<Fields extends Record<string, any>>(paths: string[], fields: Fields) {
      assert_not_committed();
      const document = create_document_from_fields(fields);
      document.name = get_document_path(...paths);

      writes.push({
        update: document,
        updateMask: {
          fieldPaths: Object.keys(fields),
        },
        currentDocument: {
          exists: true,
        },
      });
    },

    /**
     * Adds a delete operation to the batch.
     *
     * @param paths The path segments to the document.
     */
    delete(paths: string[]) {
      assert_not_committed();
      writes.push({
        delete: get_document_path(...paths),
      });
    },

    /**
     * Commits all of the writes in this write batch as a single atomic unit.
     *
     * @returns The commit response containing write results and commit time.
     */
    async commit(): Promise<Firestore.CommitResponse> {
      assert_not_committed();
      committing = true;

      const endpoint = get_firestore_endpoint(project_id, [], ':commit');

      const body: Firestore.CommitRequest = { writes };

      try {
        const response = await safe_fetch(endpoint, {
          method: 'POST',
          body: JSON.stringify(body),
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        });

        const data = await response.json();

        throw_if_error<Firestore.CommitResponse>(data);

        committed = true;
        return data;
      } finally {
        committing = false;
      }
    },
  };
};
