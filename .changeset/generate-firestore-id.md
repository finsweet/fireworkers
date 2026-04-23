---
'fireworkers': minor
---

Add `generateDocumentId()`, a utility that returns a random 20-character `[A-Za-z0-9]` ID in the same format Firestore uses for auto-generated document IDs. Useful when you need to know a document's ID before writing it (e.g. to reference it from sibling writes in a `batch`). Ported from `@firebase/firestore`'s `AutoId.newId()` — uses `crypto.getRandomValues` with rejection sampling to avoid modulo bias.
