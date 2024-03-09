export type DB = {
  project_id: string;
  jwt: string;
};

export type GetResponse = Document | { error: Status };

export interface Document {
  name?: string;
  fields?: ApiClientObjectMap<Value>;
  createTime?: Timestamp;
  updateTime?: Timestamp;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CustomDocument<T extends Record<string, any>> = Pick<
  Document,
  'createTime' | 'updateTime'
> & {
  id: string;
} & {
  fields: T;
};

export interface Value {
  nullValue?: ValueNullValue;
  booleanValue?: boolean;
  integerValue?: string | number;
  doubleValue?: string | number;
  timestampValue?: Timestamp;
  stringValue?: string;
  bytesValue?: string | Uint8Array;
  referenceValue?: string;
  geoPointValue?: LatLng;
  arrayValue?: ArrayValue;
  mapValue?: MapValue;
}

export interface StructuredQuery {
  select?: Projection;
  from?: CollectionSelector[];
  where?: Filter;
  orderBy?: Order[];
  startAt?: Cursor;
  endAt?: Cursor;
  offset?: number;
  limit?: number | { value: number };
}

interface Projection {
  fields?: FieldReference[];
}

interface FieldReference {
  fieldPath?: string;
}

interface CollectionSelector {
  collectionId?: string;
  allDescendants?: boolean;
}

interface Filter {
  compositeFilter?: CompositeFilter;
  fieldFilter?: FieldFilter;
  unaryFilter?: UnaryFilter;
}

interface CompositeFilter {
  op?: CompositeFilterOp;
  filters?: Filter[];
}

type CompositeFilterOp = 'OPERATOR_UNSPECIFIED' | 'AND' | 'OR';

interface FieldFilter {
  field?: FieldReference;
  op?: FieldFilterOp;
  value?: Value;
}

type FieldFilterOp =
  | 'OPERATOR_UNSPECIFIED'
  | 'LESS_THAN'
  | 'LESS_THAN_OR_EQUAL'
  | 'GREATER_THAN'
  | 'GREATER_THAN_OR_EQUAL'
  | 'EQUAL'
  | 'NOT_EQUAL'
  | 'ARRAY_CONTAINS'
  | 'IN'
  | 'ARRAY_CONTAINS_ANY'
  | 'NOT_IN';

type ValueNullValue = 'NULL_VALUE';

export type Timestamp = string | { seconds?: string | number; nanos?: number };

interface LatLng {
  latitude?: number;
  longitude?: number;
}

interface ArrayValue {
  values?: Value[];
}

interface MapValue {
  fields?: ApiClientObjectMap<Value>;
}

interface ApiClientObjectMap<T> {
  [k: string]: T;
}

interface Order {
  field?: FieldReference;
  direction?: OrderDirection;
}

type OrderDirection = 'DIRECTION_UNSPECIFIED' | 'ASCENDING' | 'DESCENDING';

interface Cursor {
  values?: Value[];
  before?: boolean;
}

interface UnaryFilter {
  op?: UnaryFilterOp;
  field?: FieldReference;
}

type UnaryFilterOp = 'OPERATOR_UNSPECIFIED' | 'IS_NAN' | 'IS_NULL' | 'IS_NOT_NAN' | 'IS_NOT_NULL';

export interface TransactionOptions {
  readOnly?: ReadOnly;
  readWrite?: ReadWrite;
}

interface ReadOnly {
  readTime?: string;
}

interface ReadWrite {
  retryTransaction?: string;
}

interface Status {
  code?: number;
  message?: string;
  status?: string;
}
