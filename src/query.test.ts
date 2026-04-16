import { beforeEach, describe, expect, it } from 'vitest';

import { clearFirestore, db } from '../tests/unit/helpers';
import { create } from './create';
import { query } from './query';

type Todo = { title: string; completed: boolean; owner: string };

describe('query', () => {
  beforeEach(clearFirestore);

  it('returns documents matching a field filter', async () => {
    await create<Todo>(db, 'todos', { title: 'A', completed: false, owner: 'alice' });
    await create<Todo>(db, 'todos', { title: 'B', completed: true, owner: 'bob' });
    await create<Todo>(db, 'todos', { title: 'C', completed: false, owner: 'alice' });

    const results = await query<Todo>(db, {
      from: [{ collectionId: 'todos' }],
      where: {
        fieldFilter: {
          field: { fieldPath: 'owner' },
          op: 'EQUAL',
          value: { stringValue: 'alice' },
        },
      },
    });

    expect(results).toHaveLength(2);
    expect(results.every((d) => d.fields.owner === 'alice')).toBe(true);
  });

  it('returns an empty array when no documents match', async () => {
    await create<Todo>(db, 'todos', { title: 'A', completed: false, owner: 'alice' });

    const results = await query<Todo>(db, {
      from: [{ collectionId: 'todos' }],
      where: {
        fieldFilter: {
          field: { fieldPath: 'owner' },
          op: 'EQUAL',
          value: { stringValue: 'nobody' },
        },
      },
    });

    expect(results).toHaveLength(0);
  });

  it('respects the limit parameter', async () => {
    await create<Todo>(db, 'todos', { title: 'A', completed: false, owner: 'alice' });
    await create<Todo>(db, 'todos', { title: 'B', completed: false, owner: 'alice' });
    await create<Todo>(db, 'todos', { title: 'C', completed: false, owner: 'alice' });

    const results = await query<Todo>(db, {
      from: [{ collectionId: 'todos' }],
      limit: 2,
    });

    expect(results).toHaveLength(2);
  });

  it('filters by boolean field', async () => {
    await create<Todo>(db, 'todos', { title: 'Done', completed: true, owner: 'alice' });
    await create<Todo>(db, 'todos', { title: 'Pending', completed: false, owner: 'alice' });

    const results = await query<Todo>(db, {
      from: [{ collectionId: 'todos' }],
      where: {
        fieldFilter: {
          field: { fieldPath: 'completed' },
          op: 'EQUAL',
          value: { booleanValue: true },
        },
      },
    });

    expect(results).toHaveLength(1);
    expect(results[0]?.fields.title).toBe('Done');
  });

  it('returns documents with id and metadata on each result', async () => {
    await create<Todo>(db, 'todos', { title: 'X', completed: false, owner: 'alice' });

    const results = await query<Todo>(db, {
      from: [{ collectionId: 'todos' }],
    });

    expect(results[0]?.id).toBeTruthy();
    expect(results[0]?.createTime).toBeTruthy();
    expect(results[0]?.updateTime).toBeTruthy();
  });

  it('supports a composite AND filter', async () => {
    await create<Todo>(db, 'todos', { title: 'Done by alice', completed: true, owner: 'alice' });
    await create<Todo>(db, 'todos', {
      title: 'Pending by alice',
      completed: false,
      owner: 'alice',
    });
    await create<Todo>(db, 'todos', { title: 'Done by bob', completed: true, owner: 'bob' });

    const results = await query<Todo>(db, {
      from: [{ collectionId: 'todos' }],
      where: {
        compositeFilter: {
          op: 'AND',
          filters: [
            {
              fieldFilter: {
                field: { fieldPath: 'owner' },
                op: 'EQUAL',
                value: { stringValue: 'alice' },
              },
            },
            {
              fieldFilter: {
                field: { fieldPath: 'completed' },
                op: 'EQUAL',
                value: { booleanValue: true },
              },
            },
          ],
        },
      },
    });

    expect(results).toHaveLength(1);
    expect(results[0]?.fields.title).toBe('Done by alice');
  });
});
