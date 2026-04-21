---
'fireworkers': minor
---

Add `FirestoreError` with a stable `code` field (compatible with the Firebase Web SDK's `FirestoreErrorCode`) so callers can branch on a kebab-cased code instead of regex-matching `.message`. Also exposes `status` (canonical status string, e.g. `'NOT_FOUND'`) and `httpCode` (HTTP status) for debugging. Network failures wrap into `FirestoreError` with `code: 'unavailable'`. Non-breaking — `FirestoreError` extends `Error` and `err.message` still equals the REST response's `error.message`.
