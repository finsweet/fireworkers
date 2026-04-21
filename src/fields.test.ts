import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { clearFirestore, initDb, TEST_PROJECT_ID } from '../tests/unit/helpers';
import { extract_fields_from_document } from './fields';
import { get } from './get';
import type { DB, Document } from './types';

const EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST ?? '127.0.0.1:8080';

/**
 * Writes a raw Firestore document to the emulator, bypassing fireworkers so
 * we can produce an `integerValue` field (fireworkers always writes numbers
 * as `doubleValue`).
 */
const writeRawDocument = async (
  collection: string,
  documentId: string,
  fields: Document['fields']
): Promise<void> => {
  const url = `http://${EMULATOR_HOST}/v1/projects/${TEST_PROJECT_ID}/databases/(default)/documents/${collection}?documentId=${documentId}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields }),
  });

  if (!response.ok) {
    throw new Error(`Failed to seed document: ${response.status} ${await response.text()}`);
  }
};

describe('extract_fields_from_document', () => {
  it('coerces integerValue strings to JS numbers', () => {
    const document: Document = {
      name: 'projects/test/databases/(default)/documents/todos/abc',
      fields: {
        updatedTimestamp: { integerValue: '1730404244' },
      },
    };

    const extracted = extract_fields_from_document<{ updatedTimestamp: number }>(document);

    expect(extracted.fields.updatedTimestamp).toBe(1730404244);
    expect(typeof extracted.fields.updatedTimestamp).toBe('number');
  });

  it('maps each primitive type to the correct JS type', () => {
    const document: Document = {
      name: 'projects/test/databases/(default)/documents/mix/doc',
      fields: {
        int: { integerValue: '42' },
        double: { doubleValue: 3.14 },
        str: { stringValue: 'hello' },
        bool: { booleanValue: true },
        missing: { nullValue: 'NULL_VALUE' },
      },
    };

    const extracted = extract_fields_from_document<{
      int: number;
      double: number;
      str: string;
      bool: boolean;
      missing: null;
    }>(document);

    expect(extracted.fields.int).toBe(42);
    expect(typeof extracted.fields.int).toBe('number');
    expect(extracted.fields.double).toBe(3.14);
    expect(extracted.fields.str).toBe('hello');
    expect(extracted.fields.bool).toBe(true);
    expect(extracted.fields.missing).toBeNull();
  });

  it('coerces integerValue nested inside arrayValue and mapValue', () => {
    const document: Document = {
      name: 'projects/test/databases/(default)/documents/nested/doc',
      fields: {
        list: {
          arrayValue: {
            values: [{ integerValue: '1' }, { integerValue: '2' }],
          },
        },
        meta: {
          mapValue: {
            fields: {
              count: { integerValue: '99' },
            },
          },
        },
      },
    };

    const extracted = extract_fields_from_document<{
      list: number[];
      meta: { count: number };
    }>(document);

    expect(extracted.fields.list).toEqual([1, 2]);
    expect(typeof extracted.fields.list[0]).toBe('number');
    expect(extracted.fields.meta.count).toBe(99);
    expect(typeof extracted.fields.meta.count).toBe('number');
  });
});

describe('get with primitive sentinels seeded via raw REST (emulator)', () => {
  let db: DB;

  beforeAll(async () => {
    db = await initDb();
  });
  beforeEach(clearFirestore);

  it('returns integerValue fields as JS numbers and nullValue fields as null', async () => {
    await writeRawDocument('todos', 'seeded', {
      updatedTimestamp: { integerValue: '1730404244' },
      count: { integerValue: '42' },
      title: { stringValue: 'seeded externally' },
      missing: { nullValue: 'NULL_VALUE' },
    });

    const doc = await get<{
      updatedTimestamp: number;
      count: number;
      title: string;
      missing: null;
    }>(db, 'todos', 'seeded');

    expect(doc.fields.updatedTimestamp).toBe(1730404244);
    expect(typeof doc.fields.updatedTimestamp).toBe('number');
    expect(doc.fields.count).toBe(42);
    expect(typeof doc.fields.count).toBe('number');
    expect(doc.fields.title).toBe('seeded externally');
    expect(doc.fields.missing).toBeNull();
  });
});
