import { beforeEach, describe, expect, it } from 'vitest';

import { clearFirestore, db } from '../tests/unit/helpers';
import { get } from './get';
import { set } from './set';

type Todo = { title: string; completed: boolean; priority?: number };

describe('set', () => {
  beforeEach(clearFirestore);

  it('creates a document with a known id when it does not exist', async () => {
    const doc = await set<Todo>(db, 'todos', 'my-id', { title: 'New todo', completed: false });

    expect(doc.id).toBe('my-id');
    expect(doc.fields.title).toBe('New todo');
    expect(doc.fields.completed).toBe(false);
  });

  it('overwrites an existing document by default', async () => {
    await set<Todo>(db, 'todos', 'overwrite-id', {
      title: 'Original',
      completed: false,
      priority: 5,
    });

    await set<{ title: string }>(db, 'todos', 'overwrite-id', { title: 'Overwritten' });

    const doc = await get<{ title: string; completed?: boolean; priority?: number }>(
      db,
      'todos',
      'overwrite-id'
    );

    expect(doc.fields.title).toBe('Overwritten');
    // Fields absent from the second set call are removed on a full overwrite
    expect(doc.fields.completed).toBeUndefined();
    expect(doc.fields.priority).toBeUndefined();
  });

  it('merges into an existing document when merge: true', async () => {
    await set<Todo>(db, 'todos', 'merge-id', { title: 'Keep me', completed: false, priority: 3 });

    await set<Pick<Todo, 'completed'>>(
      db,
      'todos',
      'merge-id',
      { completed: true },
      { merge: true }
    );

    const doc = await get<Todo>(db, 'todos', 'merge-id');
    expect(doc.fields.title).toBe('Keep me'); // preserved
    expect(doc.fields.priority).toBe(3); // preserved
    expect(doc.fields.completed).toBe(true); // merged
  });

  it('creates a document when merge: true and doc does not yet exist', async () => {
    const doc = await set<Todo>(
      db,
      'todos',
      'new-merge-id',
      { title: 'Brand new', completed: false },
      { merge: true }
    );

    expect(doc.id).toBe('new-merge-id');
    expect(doc.fields.title).toBe('Brand new');
  });

  it('returns createTime and updateTime', async () => {
    const doc = await set(db, 'items', 'ts-id', { x: 1 });
    expect(doc.createTime).toBeTruthy();
    expect(doc.updateTime).toBeTruthy();
  });
});
