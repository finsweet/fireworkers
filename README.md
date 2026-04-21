# Fireworkers [![npm](https://img.shields.io/npm/v/fireworkers)](https://www.npmjs.com/package/fireworkers)

Work in progress, expect bugs and missing features.

A library to use [Cloud Firestore](https://firebase.google.com/docs/firestore) inside [Cloudflare Workers](https://workers.cloudflare.com/).

## Install

```bash
npm install fireworkers
# OR
yarn add fireworkers
# OR
pnpm add fireworkers
```

## Usage

```typescript
import * as Firestore from 'fireworkers';

const db = await Firestore.init({
  uid: 'user1234',
  project_id: 'my-project',
  client_email: 'abc-123@a-b-c-123.iam.gserviceaccount.com',
  private_key: '-----BEGIN PRIVATE KEY-----...',
  private_key_id: 'OdxPtETQKf1o2YvMTTLBzsJ3OYdiPcx7NlFE2ZAk',
  claims: {
    premium_account: true,
  },
});

const todo = await Firestore.get(db, 'todos', 'aDyjLiTViX1G7HyF74Ax');
```

## API

### init(options)

Returns a DB instance. Requires a [service account](https://firebase.google.com/docs/auth/admin/create-custom-tokens#using_a_service_account_json_file).

#### options.uid

Type: `string`

The unique identifier of the signed-in user, between 1-36 characters long.

#### options.project_id

Type: `string`

The `project_id` defined in the `serviceAccountKey.json`.

#### options.client_email

Type: `string`

The `client_email` defined in the `serviceAccountKey.json`.

#### options.private_key

Type: `string`

The `private_key` defined in the `serviceAccountKey.json`.

#### options.private_key_id

Type: `string`

The `private_key_id` defined in the `serviceAccountKey.json`.

#### (Optional) options.claims

Type: `Record<string, string | number | boolean>` | `undefined`

Optional custom claims to include in the [Security Rules](https://firebase.google.com/docs/firestore/security/get-started) `auth / request.auth` variables.

```typescript
const db = await Firestore.init({
  uid: 'user1234',
  project_id: 'my-project',
  client_email: 'abc-123@a-b-c-123.iam.gserviceaccount.com',
  private_key: '-----BEGIN PRIVATE KEY-----...',
  private_key_id: 'OdxPtETQKf1o2YvMTTLBzsJ3OYdiPcx7NlFE2ZAk',
  claims: {
    premium_account: true,
  },
});
```

---

### get(db, ...document_path)

Gets a single document.

#### db

Type: `DB`

The DB instance.

#### document_path

Type: `string`

The document path, usually defined as `{collection_id}/{document_id}`.

Allows nested documents like `{collection_id}/{document_id}/{nested_collection_id}/{nested_document_id}`.

It can either be defined using a single string like:

```typescript
const todo = await Firestore.get(db, 'todos/aDyjLiTViX1G7HyF74Ax');
```

Or multiple params like:

```typescript
const todo = await Firestore.get(db, 'todos', 'aDyjLiTViX1G7HyF74Ax');
```

---

### create(db, ...collection_path, fields)

Creates a new document.

#### db

Type: `DB`

The DB instance.

#### collection_path

Type: `string`

The collection path, usually defined as `{collection_id}`.

Allows nested collections like `{collection_id}/{document_id}/{nested_collection_id}`.

Nested collections can either be defined using a single string like `todo/aDyjLiTViX1G7HyF74Ax/tasks` or by passing multiple params like `'todo', 'aDyjLiTViX1G7HyF74Ax', 'tasks'`.

#### fields

Type: `Record<string, any>`

The document fields.

```typescript
const newTodo = await Firestore.create(db, 'todos', {
  title: 'Win the lottery',
  completed: false,
});
```

---

### update(db, ...document_path, fields)

Updates fields in a document. The update will fail if applied to a document that does not exist.

Implements the same functionality as Firestore's [updateDoc](https://firebase.google.com/docs/reference/js/firestore_.md#updatedoc).

#### db

Type: `DB`

The DB instance.

#### document_path

Type: `string`

The document path, defined like in [get](#document_path).

#### fields

Type: `Record<string, any>`

The fields to update.

```typescript
const updatedTodo = await Firestore.update(db, 'todos', 'aDyjLiTViX1G7HyF74Ax', {
  completed: false,
});
```

---

### set(db, ...document_path, fields, options?)

Writes to a document. If the document does not yet exist, it will be created. If you provide `merge`, the provided data can be merged into an existing document.

Implements the same functionality as Firestore's [setDoc](https://firebase.google.com/docs/reference/js/firestore_.md#setdoc_2).

#### db

Type: `DB`

The DB instance.

#### document_path

Type: `string`

The document path, defined like in [get](#document_path).

#### fields

Type: `Record<string, any>`

The fields to update.

#### (Optional) options.merge

Type: `boolean`

If set to `true`, the provided data will be merged into an existing document instead of overwriting.

```typescript
const updatedTodo = await Firestore.set(
  db,
  'todos',
  'aDyjLiTViX1G7HyF74Ax',
  { completed: false },
  { merge: true }
);
```

---

### remove(db, ...document_path)

Removes a document.

#### db

Type: `DB`

The DB instance.

#### document_path

Type: `string`

The document path, defined like in [get](#document_path).

```typescript
const todo = await Firestore.remove(db, 'todos', 'aDyjLiTViX1G7HyF74Ax');
```

---

### query(db, query)

Runs a query.

#### db

Type: `DB`

The DB instance.

#### query

Type: `StructuredQuery`

A [StructuredQuery](https://firebase.google.com/docs/firestore/reference/rest/v1/StructuredQuery) object.

```typescript
const todos = await Firestore.query(db, {
  from: [{ collectionId: 'todos' }],

  where: {
    fieldFilter: {
      field: {
        fieldPath: 'owner',
      },
      op: 'EQUAL',
      value: {
        stringValue: 'user1234',
      },
    },
  },
});
```

### batch(db)

Creates a write batch, used for performing multiple writes as a single atomic unit.

Implements the same functionality as Firestore's [writeBatch](https://firebase.google.com/docs/reference/js/firestore_.md#writebatch).

#### db

Type: `DB`

The DB instance.

#### batch.set(paths, fields, options?)

Adds a set operation to the batch. If the document does not yet exist, it will be created. If you provide `merge: true`, the provided fields will be merged into the existing document.

- `paths` — Type: `string[]` — The path segments to the document (e.g. `['todos', 'my-id']`).
- `fields` — Type: `Record<string, any>` — The fields to write.
- `options.merge` — Type: `boolean` (optional) — If `true`, merges into an existing document.

#### batch.update(paths, fields)

Adds an update operation to the batch. The document must already exist.

- `paths` — Type: `string[]` — The path segments to the document.
- `fields` — Type: `Record<string, any>` — The fields to update.

#### batch.delete(paths)

Adds a delete operation to the batch.

- `paths` — Type: `string[]` — The path segments to the document.

#### batch.commit()

Commits all of the writes in this write batch as a single atomic unit. Returns a `CommitResponse` with `writeResults` and `commitTime`.

A batch can only be committed once. After `commit()` is called, any further calls to `set`, `update`, `delete`, or `commit` will throw an error.

```typescript
const b = Firestore.batch(db);

b.set(['todos', 'todo-1'], { title: 'First', completed: false });
b.set(['todos', 'todo-2'], { title: 'Second', completed: true });
b.update(['todos', 'existing-id'], { completed: true });
b.delete(['todos', 'old-id']);

const response = await b.commit();
```

---

## Error handling

All operations reject with a `FirestoreError` when Firestore returns an error response or the network request fails. `FirestoreError` extends the built-in `Error`, so existing `try/catch` and `.message` checks keep working — but you can now branch on a stable string `code` instead of parsing the message.

```typescript
import * as Firestore from 'fireworkers';

try {
  await Firestore.get(db, 'todos', 'missing-id');
} catch (err) {
  if (err instanceof Firestore.FirestoreError) {
    if (err.code === 'not-found') {
      // handle missing document
    } else if (err.code === 'permission-denied') {
      // surface auth failure
    }
  }
  throw err;
}
```

### Fields

- `code` — `FirestoreErrorCode` (kebab-cased string, see list below)
- `message` — the original `error.message` from the Firestore REST response
- `status` — the original canonical status string (e.g. `'NOT_FOUND'`), when present
- `httpCode` — the original numeric HTTP status code from the REST response, when present
- `name` — always `'FirestoreError'`

Network-level failures (DNS, connection reset, etc.) surface as `FirestoreError` with `code: 'unavailable'`.

### FirestoreErrorCode values

The 16 canonical status codes, kebab-cased — same set the Firebase Web SDK uses:

`cancelled`, `unknown`, `invalid-argument`, `deadline-exceeded`, `not-found`, `already-exists`, `permission-denied`, `resource-exhausted`, `failed-precondition`, `aborted`, `out-of-range`, `unimplemented`, `internal`, `unavailable`, `data-loss`, `unauthenticated`.

---

## Testing

Unit tests run against the [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite) using [Vitest](https://vitest.dev/).

### Prerequisites

- [Java](https://www.java.com/) (required by the Firebase Emulator)
- [Firebase CLI](https://firebase.google.com/docs/cli) (installed as a dev dependency)

### Running tests

Run the full test suite (starts the emulator automatically):

```bash
pnpm test:unit
```

Run tests in watch mode (requires the emulator to be running separately):

```bash
# Terminal 1 — start the emulator
pnpm emulators

# Terminal 2 — run tests in watch mode
pnpm test:unit:watch
```

## TypeScript

This library has first-class TypeScript support.

To define a document interface, you can pass a generic like so:

```typescript
type Todo = {
  title: string;
  completed: boolean;
};

const todo = await Firestore.get<Todo>(db, 'todos', 'aDyjLiTViX1G7HyF74Ax');
```
