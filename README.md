# Fireworkers

Work in progress.

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
import * as Firestore from './index';

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

#### options.client_email

Type: `string`

The `client_email` defined in the `serviceAccountKey.json`.

#### options.claims

Type: `Record<string, string | number | boolean>` | `undefined`

The `client_email` defined in the `serviceAccountKey.json`.

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

### get(db, collection, documentId)

Gets a single document.

#### db

Type: `DB`

The DB instance.

#### collection

Type: `string`

The collection ID.

#### document

Type: `string`

The document ID.

```typescript
const todo = await Firestore.get(db, 'todos', 'aDyjLiTViX1G7HyF74Ax');
```

### create(db, collection, documentId)

Creates a new document.

#### db

Type: `DB`

The DB instance.

#### collection

Type: `string`

The collection ID.

#### fields

Type: `Record<string, any>`

The document fields.

```typescript
const newTodo = await Firestore.create(db, 'todos', {
  title: 'Win the lottery',
  completed: false,
});
```

### update(db, collection, documentId)

Updates or inserts a document.

#### db

Type: `DB`

The DB instance.

#### collection

Type: `string`

The collection ID.

#### document

Type: `string`

The document ID.

#### fields

Type: `Record<string, any>`

The fields to update.

```typescript
const updatedTodo = await Firestore.update(db, 'todos', 'aDyjLiTViX1G7HyF74Ax', {
  completed: false,
});
```

### remove(db, collection, documentId)

Removes a document.

#### db

Type: `DB`

The DB instance.

#### collection

Type: `string`

The collection ID.

#### document

Type: `string`

The document ID.

```typescript
const todo = await Firestore.remove(db, 'todos', 'aDyjLiTViX1G7HyF74Ax');
```

### query(db, collection, documentId)

Runs a query.

#### db

Type: `DB`

The DB instance.

#### query

Type: `StructuredQuery`

A [StructuredQuery](StructuredQuery) object.

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
