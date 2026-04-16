import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { clearFirestore, initDb } from '../tests/unit/helpers';
import { create } from './create';
import { get } from './get';
import { remove } from './remove';
import type { DB } from './types';

let db: DB;

describe('remove', () => {
  beforeAll(async () => {
    db = await initDb();
  });
  beforeEach(clearFirestore);

  it('removes an existing document and returns true', async () => {
    const created = await create(db, 'todos', { title: 'To be removed' });

    const result = await remove(db, 'todos', created.id);

    expect(result).toBe(true);
  });

  it('makes the document unretrievable after removal', async () => {
    const created = await create(db, 'todos', { title: 'Will be gone' });

    await remove(db, 'todos', created.id);

    await expect(get(db, 'todos', created.id)).rejects.toThrow();
  });

  it('returns true even for a non-existent document', async () => {
    // Firestore DELETE is a no-op for missing documents — it still responds 200
    const result = await remove(db, 'todos', 'does-not-exist');
    expect(result).toBe(true);
  });

  it('removes a document from a nested collection', async () => {
    const parent = await create(db, 'todos', { title: 'Parent' });
    const child = await create(db, 'todos', parent.id, 'tasks', { label: 'Child task' });

    const result = await remove(db, 'todos', parent.id, 'tasks', child.id);

    expect(result).toBe(true);
    await expect(get(db, 'todos', parent.id, 'tasks', child.id)).rejects.toThrow();
  });
});
