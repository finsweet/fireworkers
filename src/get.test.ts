import { beforeEach, describe, expect, it } from 'vitest';

import { clearFirestore, db } from '../tests/unit/helpers';
import { create } from './create';
import { get } from './get';

type Todo = { title: string; completed: boolean };

describe('get', () => {
  beforeEach(clearFirestore);

  it('retrieves an existing document by id', async () => {
    const created = await create<Todo>(db, 'todos', { title: 'Buy milk', completed: false });

    const doc = await get<Todo>(db, 'todos', created.id);

    expect(doc.id).toBe(created.id);
    expect(doc.fields.title).toBe('Buy milk');
    expect(doc.fields.completed).toBe(false);
  });

  it('returns createTime and updateTime metadata', async () => {
    const created = await create<Todo>(db, 'todos', { title: 'With timestamps', completed: false });

    const doc = await get<Todo>(db, 'todos', created.id);

    expect(doc.createTime).toBeTruthy();
    expect(doc.updateTime).toBeTruthy();
  });

  it('accepts a single slash-separated path string', async () => {
    const created = await create<Todo>(db, 'todos', { title: 'Single path', completed: true });

    const doc = await get<Todo>(db, `todos/${created.id}`);

    expect(doc.id).toBe(created.id);
    expect(doc.fields.title).toBe('Single path');
  });

  it('retrieves a document from a nested collection', async () => {
    const parent = await create<Todo>(db, 'todos', { title: 'Parent', completed: false });
    const child = await create<{ label: string }>(db, 'todos', parent.id, 'tasks', {
      label: 'Subtask',
    });

    const doc = await get<{ label: string }>(db, 'todos', parent.id, 'tasks', child.id);

    expect(doc.id).toBe(child.id);
    expect(doc.fields.label).toBe('Subtask');
  });

  it('throws when the document does not exist', async () => {
    await expect(get(db, 'todos', 'does-not-exist')).rejects.toThrow();
  });
});
