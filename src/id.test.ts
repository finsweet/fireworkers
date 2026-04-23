import { describe, expect, it } from 'vitest';

import { generateFirestoreId } from './id';

describe('generateFirestoreId', () => {
  it('returns a 20-character string', () => {
    const id = generateFirestoreId();
    expect(id).toHaveLength(20);
  });

  it('only uses characters from [A-Za-z0-9]', () => {
    for (let i = 0; i < 100; i++) {
      expect(generateFirestoreId()).toMatch(/^[A-Za-z0-9]{20}$/);
    }
  });

  it('produces unique IDs across many invocations', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 10_000; i++) {
      ids.add(generateFirestoreId());
    }
    expect(ids.size).toBe(10_000);
  });
});
