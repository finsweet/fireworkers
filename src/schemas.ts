import { boolean, date, define, is, number, object, string } from 'superstruct';

const TIMESTAMP_REGEX =
  /^([0-9]+)-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])[Tt]([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9]|60)(\.[0-9]+)?(([Zz])|([+|-]([01][0-9]|2[0-3]):[0-5][0-9]))$/;

const date_schema = date();
export const string_schema = string();
export const boolean_schema = boolean();
export const number_schema = number();
export const object_schema = object();
export const geo_point_schema = object({
  latitude: number(),
  longitude: number(),
});

/**
 * Custom superstruct type.
 * Defines a RFC3339 timestamp string.
 */
export const timestamp_schema = define<string>('timestamp', (value) => {
  if (!is(value, string_schema)) return false;

  return TIMESTAMP_REGEX.test(value) && is(new Date(value), date_schema);
});
