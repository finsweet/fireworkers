import { describe, expect, it } from 'vitest';

import { generateDocumentId } from './id';

describe('generateDocumentId', () => {
  it('returns a 20-character string', () => {
    const id = generateDocumentId();
    expect(id).toHaveLength(20);
  });

  it('only uses characters from [A-Za-z0-9]', () => {
    for (let i = 0; i < 100; i++) {
      expect(generateDocumentId()).toMatch(/^[A-Za-z0-9]{20}$/);
    }
  });
});
