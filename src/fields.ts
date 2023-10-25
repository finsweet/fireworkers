import { is, validate } from 'superstruct';

import {
  boolean_schema,
  geo_point_schema,
  number_schema,
  object_schema,
  string_schema,
  timestamp_schema,
} from './schemas';
import type * as Firestore from './types';

/**
 * Types
 */
export type PrimitiveValues = Omit<Firestore.Value, 'mapValue' | 'arrayValue'>;
export type PrimitiveMappedValue = PrimitiveValues[keyof PrimitiveValues];
export type ArrayMappedValue = Array<PrimitiveMappedValue | ArrayMappedValue | MapMappedValue>;
export interface MapMappedValue {
  [key: string]: PrimitiveMappedValue | MapMappedValue | ArrayMappedValue;
}

export type MappedValue = PrimitiveMappedValue | ArrayMappedValue | MapMappedValue;

/**
 * Converts a field to a {@link Firestore.Value}
 * @param field_value
 * @returns
 */
const convert_field_to_value = (field_value: unknown): Firestore.Value => {
  // Array
  if (Array.isArray(field_value)) {
    return {
      arrayValue: {
        values: field_value.map(convert_field_to_value),
      },
    };
  }

  // GeoPoint
  const [, geo_point_value] = validate(field_value, geo_point_schema);
  if (geo_point_value) return { geoPointValue: geo_point_value };

  // Map
  if (is(field_value, object_schema)) {
    const entries = Object.entries(field_value).map(
      ([key, value]) => [key, convert_field_to_value(value)] as const
    );
    return {
      mapValue: {
        fields: Object.fromEntries(entries),
      },
    };
  }

  // Primitives
  if (is(field_value, timestamp_schema)) return { timestampValue: field_value };
  if (is(field_value, boolean_schema)) return { booleanValue: field_value };
  if (is(field_value, number_schema)) return { doubleValue: field_value };
  if (is(field_value, string_schema)) return { stringValue: field_value };
  return { nullValue: 'NULL_VALUE' };
};

/**
 * Creates a document from an object of fields.
 * @param fields
 */
export const create_document_from_fields = (fields: Record<string, unknown>) => {
  const entries = Object.entries(fields).map(
    ([key, value]) => [key, convert_field_to_value(value)] as const
  );
  const document: Firestore.Document = { fields: Object.fromEntries(entries) };

  return document;
};

/**
 * Maps all values to remove Firestore's metadata.
 * @param document The document to map.
 * @returns
 */
export const extract_fields_from_document = <DocumentFields extends Record<string, unknown>>(
  document: Firestore.Document
): Firestore.CustomDocument<DocumentFields> => {
  const { name, fields = {}, ...timestamps } = document;

  const entries = Object.entries(fields).map(
    ([key, value]) => [key, extract_value(value)] as const
  );
  const new_fields = Object.fromEntries(entries) as DocumentFields;

  const new_document: Firestore.CustomDocument<DocumentFields> = {
    ...timestamps,
    id: extract_id_from_name(name),
    fields: new_fields,
  };

  return new_document;
};

/**
 * Extracts the value from a Firestore's field.
 * @param value
 */
const extract_value = (value: Firestore.Value): MappedValue => {
  const { arrayValue, mapValue, ...primitiveValue } = value;

  if (arrayValue) return extract_array_value(arrayValue);
  if (mapValue) return extract_map_value(mapValue);

  return extract_primitive_value(primitiveValue);
};

/**
 * Extracts a primitive value from a field object.
 * @param primitiveValues
 */
const extract_primitive_value = (primitiveValues: PrimitiveValues) =>
  Object.values(primitiveValues)[0];

/**
 * Extracts an array field.
 * @param arrayValue
 */
const extract_array_value = ({ values = [] }: NonNullable<Firestore.Value['arrayValue']>) =>
  values.map(extract_value);

/**
 * Extracts a map field.
 * @param mapValue
 */
const extract_map_value = ({ fields = {} }: NonNullable<Firestore.Value['mapValue']>) => {
  const entries = Object.entries(fields).map(([key, value]) => [key, extract_value(value)]);
  return Object.fromEntries(entries);
};

/**
 * Extracts the ID from the Document name.
 * @param name The document name.
 */
const extract_id_from_name = (name = '') => name.match(/[^/]+$/)?.[0] || name;
