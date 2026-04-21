---
'fireworkers': minor
---

fix: coerce `integerValue` and `nullValue` fields to native JS types when reading documents.

Firestore's REST API serializes `integerValue` as a string (to preserve int64 precision) and `nullValue` as the sentinel string `'NULL_VALUE'`. Previously, fireworkers returned these raw values; it now coerces them to `number` and `null` respectively, to match the Firebase Admin SDK.

**BREAKING for consumers relying on the previous raw values:**

- `integerValue` fields are no longer returned as strings. Values beyond `Number.MAX_SAFE_INTEGER` (2^53 − 1) will lose precision; if you need full int64 support, read the raw document via the REST API directly. This only affects data written by other clients (Admin SDK, console, other languages) — fireworkers writes all numbers as `doubleValue`, so round-trips within fireworkers were never affected.
- `nullValue` fields are no longer returned as the string `'NULL_VALUE'` — they return actual `null`. Any code checking `=== 'NULL_VALUE'` or relying on truthiness (the sentinel string is truthy, `null` is not) must be updated. The exported `PrimitiveMappedValue` / `MappedValue` types reflect this change.
