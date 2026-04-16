import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { clearFirestore, initDb } from '../tests/unit/helpers';
import { batch } from './batch';
import { get } from './get';
import type { DB } from './types';

type Todo = { title: string; completed: boolean };

let db: DB;

describe('batch', () => {
  beforeAll(async () => {
    db = await initDb();
  });
  beforeEach(clearFirestore);

  it('commits a set operation and the document becomes retrievable', async () => {
    const b = batch(db);
    b.set(['todos', 'batch-set'], { title: 'From batch', completed: false });

    const response = await b.commit();

    expect(response.commitTime).toBeTruthy();
    const doc = await get<Todo>(db, 'todos', 'batch-set');
    expect(doc.fields.title).toBe('From batch');
    expect(doc.fields.completed).toBe(false);
  });

  it('commits an update operation without overwriting other fields', async () => {
    // Seed the document
    const seed = batch(db);
    seed.set(['todos', 'batch-update'], { title: 'Original', completed: false });
    await seed.commit();

    // Update only `completed`
    const b = batch(db);
    b.update(['todos', 'batch-update'], { completed: true });
    await b.commit();

    const doc = await get<Todo>(db, 'todos', 'batch-update');
    expect(doc.fields.completed).toBe(true);
    expect(doc.fields.title).toBe('Original'); // untouched
  });

  it('commits a delete operation and the document is gone', async () => {
    const seed = batch(db);
    seed.set(['todos', 'batch-delete'], { title: 'Delete me', completed: false });
    await seed.commit();

    const b = batch(db);
    b.delete(['todos', 'batch-delete']);
    await b.commit();

    await expect(get(db, 'todos', 'batch-delete')).rejects.toThrow();
  });

  it('commits multiple operations atomically', async () => {
    const b = batch(db);
    b.set(['todos', 'multi-1'], { title: 'First', completed: false });
    b.set(['todos', 'multi-2'], { title: 'Second', completed: true });

    const response = await b.commit();

    expect(response.writeResults).toHaveLength(2);

    const doc1 = await get<Todo>(db, 'todos', 'multi-1');
    const doc2 = await get<Todo>(db, 'todos', 'multi-2');
    expect(doc1.fields.title).toBe('First');
    expect(doc2.fields.title).toBe('Second');
  });

  it('merges fields when set is called with merge: true', async () => {
    const seed = batch(db);
    seed.set(['todos', 'merge-id'], { title: 'Keep me', completed: false });
    await seed.commit();

    const b = batch(db);
    b.set(['todos', 'merge-id'], { completed: true }, { merge: true });
    await b.commit();

    const doc = await get<Todo>(db, 'todos', 'merge-id');
    expect(doc.fields.title).toBe('Keep me'); // preserved via merge
    expect(doc.fields.completed).toBe(true);
  });

  it('returns a CommitResponse with writeResults array', async () => {
    const b = batch(db);
    b.set(['todos', 'resp-id'], { title: 'Result test', completed: false });

    const response = await b.commit();

    expect(Array.isArray(response.writeResults)).toBe(true);
    expect(response.commitTime).toBeTruthy();
  });

  it('commits an empty batch without error', async () => {
    const b = batch(db);
    const response = await b.commit();
    // An empty commit is valid — Firestore returns an empty writeResults
    expect(response).toBeDefined();
  });

  it('throws when updating a document that does not exist', async () => {
    const b = batch(db);
    b.update(['todos', 'ghost-id'], { completed: true });

    await expect(b.commit()).rejects.toThrow();
  });

  it('throws when using the batch after commit', async () => {
    const b = batch(db);
    b.set(['todos', 'once'], { title: 'Once', completed: false });
    await b.commit();

    expect(() => b.set(['todos', 'twice'], { title: 'Twice', completed: false })).toThrow(
      'A write batch can no longer be used after commit() has been called.'
    );
    expect(() => b.update(['todos', 'once'], { completed: true })).toThrow();
    expect(() => b.delete(['todos', 'once'])).toThrow();
    await expect(b.commit()).rejects.toThrow();
  });

  it('does not write to Firestore before commit is called', async () => {
    const seed = batch(db);
    seed.set(['todos', 'pre-commit'], { title: 'Original', completed: false });
    await seed.commit();

    const b = batch(db);
    b.update(['todos', 'pre-commit'], { completed: true });

    // Before commit: document should still have original values
    const before = await get<Todo>(db, 'todos', 'pre-commit');
    expect(before.fields.completed).toBe(false);
    expect(before.fields.title).toBe('Original');

    await b.commit();

    // After commit: document should reflect the update
    const after = await get<Todo>(db, 'todos', 'pre-commit');
    expect(after.fields.completed).toBe(true);
  });
});
