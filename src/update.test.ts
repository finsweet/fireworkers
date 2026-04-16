import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { clearFirestore, initDb } from '../tests/unit/helpers';
import { create } from './create';
import { get } from './get';
import type { DB } from './types';
import { update } from './update';

type Todo = { title: string; completed: boolean; priority?: number };

let db: DB;

describe('update', () => {
  beforeAll(async () => {
    db = await initDb();
  });
  beforeEach(clearFirestore);

  it('updates specified fields without overwriting others', async () => {
    const created = await create<Todo>(db, 'todos', {
      title: 'Original title',
      completed: false,
      priority: 1,
    });

    await update<Pick<Todo, 'completed'>>(db, 'todos', created.id, { completed: true });

    const doc = await get<Todo>(db, 'todos', created.id);
    expect(doc.fields.completed).toBe(true);
    expect(doc.fields.title).toBe('Original title'); // unchanged
    expect(doc.fields.priority).toBe(1); // unchanged
  });

  it('returns the updated document', async () => {
    const created = await create<Todo>(db, 'todos', { title: 'Before', completed: false });

    const updated = await update<Pick<Todo, 'title'>>(db, 'todos', created.id, {
      title: 'After',
    });

    expect(updated.fields.title).toBe('After');
  });

  it('updates a field to a different type', async () => {
    const created = await create(db, 'items', { value: 'hello' });

    await update(db, 'items', created.id, { value: 42 });

    const doc = await get<{ value: number }>(db, 'items', created.id);
    expect(doc.fields.value).toBe(42);
  });

  it('can update multiple fields at once', async () => {
    const created = await create<Todo>(db, 'todos', {
      title: 'A',
      completed: false,
      priority: 1,
    });

    await update<Todo>(db, 'todos', created.id, { title: 'B', completed: true, priority: 2 });

    const doc = await get<Todo>(db, 'todos', created.id);
    expect(doc.fields.title).toBe('B');
    expect(doc.fields.completed).toBe(true);
    expect(doc.fields.priority).toBe(2);
  });

  it('throws when the document does not exist', async () => {
    await expect(update(db, 'todos', 'does-not-exist', { completed: true })).rejects.toThrow();
  });
});
