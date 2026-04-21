import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { clearFirestore, initDb } from '../tests/unit/helpers';
import { create } from './create';
import { FirestoreError, status_to_code } from './error';
import { get } from './get';
import { remove } from './remove';
import type { DB } from './types';
import { update } from './update';

let db: DB;

describe('FirestoreError', () => {
  beforeAll(async () => {
    db = await initDb();
  });
  beforeEach(clearFirestore);

  it('throws a FirestoreError with code "not-found" when getting a missing document', async () => {
    let caught: unknown;
    try {
      await get(db, 'todos', 'does-not-exist');
    } catch (err) {
      caught = err;
    }

    expect(caught).toBeInstanceOf(FirestoreError);
    expect(caught).toBeInstanceOf(Error);
    const err = caught as FirestoreError;
    expect(err.code).toBe('not-found');
    expect(err.status).toBe('NOT_FOUND');
    expect(err.name).toBe('FirestoreError');
    expect(err.message).toMatch(/./);
  });

  it('throws a FirestoreError with code "not-found" when updating a missing document', async () => {
    let caught: unknown;
    try {
      await update(db, 'todos', 'does-not-exist', { completed: true });
    } catch (err) {
      caught = err;
    }

    expect(caught).toBeInstanceOf(FirestoreError);
    const err = caught as FirestoreError;
    expect(err.code).toBe('not-found');
  });

  it('throws a FirestoreError for unauthenticated/permission-denied requests', async () => {
    const bad_db: DB = { project_id: db.project_id, jwt: 'not-a-valid-jwt' };

    let caught: unknown;
    try {
      await create(bad_db, 'todos', { title: 'x', completed: false });
    } catch (err) {
      caught = err;
    }

    expect(caught).toBeInstanceOf(FirestoreError);
    const err = caught as FirestoreError;
    // Emulator may surface bad-auth as any of these depending on why it rejects
    // (missing/malformed/expired token vs. rule violation).
    expect(['unauthenticated', 'permission-denied', 'invalid-argument']).toContain(err.code);
  });

  it('throws a FirestoreError when remove is called with an invalid JWT', async () => {
    const bad_db: DB = { project_id: db.project_id, jwt: 'not-a-valid-jwt' };

    let caught: unknown;
    try {
      await remove(bad_db, 'todos', 'any-id');
    } catch (err) {
      caught = err;
    }

    expect(caught).toBeInstanceOf(FirestoreError);
    const err = caught as FirestoreError;
    expect(['unauthenticated', 'permission-denied', 'invalid-argument']).toContain(err.code);
  });

  it('preserves the original REST error message', async () => {
    let caught: FirestoreError | undefined;
    try {
      await get(db, 'todos', 'does-not-exist');
    } catch (err) {
      caught = err as FirestoreError;
    }

    expect(caught?.message.length).toBeGreaterThan(0);
  });
});

describe('status_to_code', () => {
  it('maps known canonical status strings to kebab-case codes', () => {
    expect(status_to_code('NOT_FOUND')).toBe('not-found');
    expect(status_to_code('PERMISSION_DENIED')).toBe('permission-denied');
    expect(status_to_code('FAILED_PRECONDITION')).toBe('failed-precondition');
    expect(status_to_code('UNAUTHENTICATED')).toBe('unauthenticated');
  });

  it('falls back to "unknown" for unrecognized status strings', () => {
    expect(status_to_code('NOT_A_REAL_STATUS')).toBe('unknown');
    expect(status_to_code('')).toBe('unknown');
  });
});
