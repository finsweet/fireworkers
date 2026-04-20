---
'fireworkers': minor
---

fix: coerce `integerValue` fields to JS `number` when reading documents.

Firestore's REST API serializes `integerValue` as a string to preserve int64 precision. Previously, fireworkers returned the raw string; it now coerces to `number` to match the Firebase Admin SDK.

**BREAKING for consumers relying on `integerValue` fields being returned as strings.** This only affects data written by other clients (Admin SDK, console, other languages) — fireworkers writes all numbers as `doubleValue`, so round-trips within fireworkers were never affected. Values beyond `Number.MAX_SAFE_INTEGER` (2^53 − 1) will lose precision; if you need full int64 support, read the raw document via the REST API directly.
