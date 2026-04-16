import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { clearFirestore, initDb } from '../tests/unit/helpers';
import { create } from './create';
import type { DB } from './types';

let db: DB;

describe('create', () => {
  beforeAll(async () => {
    db = await initDb();
  });
  beforeEach(clearFirestore);

  it('returns the created document with a generated id', async () => {
    const doc = await create(db, 'todos', { title: 'New todo', completed: false });

    expect(doc.id).toBeTruthy();
    expect(doc.fields.title).toBe('New todo');
    expect(doc.fields.completed).toBe(false);
  });

  it('stores and returns a string field', async () => {
    const doc = await create(db, 'items', { name: 'Widget' });
    expect(doc.fields.name).toBe('Widget');
  });

  it('stores and returns a number field', async () => {
    const doc = await create(db, 'items', { count: 7 });
    expect(doc.fields.count).toBe(7);
  });

  it('stores and returns a boolean field', async () => {
    const doc = await create(db, 'items', { active: true });
    expect(doc.fields.active).toBe(true);
  });

  it('stores and returns an array field', async () => {
    const doc = await create(db, 'items', { tags: ['a', 'b', 'c'] });
    expect(doc.fields.tags).toEqual(['a', 'b', 'c']);
  });

  it('stores and returns a nested map field', async () => {
    const doc = await create(db, 'items', { meta: { color: 'red', size: 10 } });
    expect(doc.fields.meta).toEqual({ color: 'red', size: 10 });
  });

  it('returns createTime and updateTime', async () => {
    const doc = await create(db, 'items', { x: 1 });
    expect(doc.createTime).toBeTruthy();
    expect(doc.updateTime).toBeTruthy();
  });

  it('creates a document in a nested collection', async () => {
    const parent = await create(db, 'todos', { title: 'Parent' });
    const child = await create(db, 'todos', parent.id, 'tasks', { label: 'Subtask' });

    expect(child.id).toBeTruthy();
    expect(child.id).not.toBe(parent.id);
    expect(child.fields.label).toBe('Subtask');
  });

  it('creates two documents with distinct auto-generated ids', async () => {
    const a = await create(db, 'items', { n: 1 });
    const b = await create(db, 'items', { n: 2 });
    expect(a.id).not.toBe(b.id);
  });
});
