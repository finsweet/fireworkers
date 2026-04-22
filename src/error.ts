import type { Status } from './types';

/**
 * String error codes mirroring the Firebase Web SDK's `FirestoreErrorCode`.
 * The 16 canonical status codes, kebab-cased.
 *
 * Reference: {@link https://firebase.google.com/docs/reference/js/firestore_.firestoreerror#firestoreerrorcode}
 */
export type FirestoreErrorCode =
  | 'cancelled'
  | 'unknown'
  | 'invalid-argument'
  | 'deadline-exceeded'
  | 'not-found'
  | 'already-exists'
  | 'permission-denied'
  | 'resource-exhausted'
  | 'failed-precondition'
  | 'aborted'
  | 'out-of-range'
  | 'unimplemented'
  | 'internal'
  | 'unavailable'
  | 'data-loss'
  | 'unauthenticated';

const STATUS_TO_CODE: Record<string, FirestoreErrorCode> = {
  CANCELLED: 'cancelled',
  UNKNOWN: 'unknown',
  INVALID_ARGUMENT: 'invalid-argument',
  DEADLINE_EXCEEDED: 'deadline-exceeded',
  NOT_FOUND: 'not-found',
  ALREADY_EXISTS: 'already-exists',
  PERMISSION_DENIED: 'permission-denied',
  RESOURCE_EXHAUSTED: 'resource-exhausted',
  FAILED_PRECONDITION: 'failed-precondition',
  ABORTED: 'aborted',
  OUT_OF_RANGE: 'out-of-range',
  UNIMPLEMENTED: 'unimplemented',
  INTERNAL: 'internal',
  UNAVAILABLE: 'unavailable',
  DATA_LOSS: 'data-loss',
  UNAUTHENTICATED: 'unauthenticated',
};

/**
 * Maps a canonical Firestore status string (e.g. `'NOT_FOUND'`) to the
 * kebab-cased error code. Unrecognized values fall back to `'unknown'`.
 */
export const status_to_code = (status: string): FirestoreErrorCode =>
  STATUS_TO_CODE[status] ?? 'unknown';

/**
 * Error thrown by every `fireworkers` operation when Firestore rejects a
 * request or the network request fails. Shape mirrors the Firebase Web SDK's
 * `FirestoreError` so callers can branch on `err.code`.
 */
export class FirestoreError extends Error {
  readonly code: FirestoreErrorCode;
  readonly httpCode?: number;
  readonly status?: string;

  constructor({
    code,
    message,
    httpCode,
    status,
  }: {
    code: FirestoreErrorCode;
    message: string;
    httpCode?: number;
    status?: string;
  }) {
    super(message);
    this.name = 'FirestoreError';
    this.code = code;
    this.httpCode = httpCode;
    this.status = status;
  }
}

const is_error_response = (data: unknown): data is { error: Status } =>
  data !== null &&
  typeof data === 'object' &&
  'error' in data &&
  typeof (data as { error: unknown }).error === 'object' &&
  (data as { error: unknown }).error !== null;

/**
 * Inspects a parsed REST response body and throws a `FirestoreError` if it
 * contains an `error` object. Otherwise narrows `data` to the success shape.
 */
export function throw_if_error<T>(data: T | { error: Status }): asserts data is T {
  if (!is_error_response(data)) return;

  const { code: httpCode, message, status } = data.error;

  throw new FirestoreError({
    code: typeof status === 'string' ? status_to_code(status) : 'unknown',
    httpCode,
    status,
    message: message ?? 'Unknown Firestore error',
  });
}

/**
 * `fetch` wrapper that converts network-level rejections (e.g. DNS failure,
 * connection reset) into a `FirestoreError` with code `'unavailable'` so
 * consumers have a single error type to catch.
 */
export const safe_fetch = async (
  input: URL | RequestInfo,
  init?: RequestInit
): Promise<Response> => {
  try {
    return await fetch(input, init);
  } catch (err) {
    throw new FirestoreError({
      code: 'unavailable',
      message: err instanceof Error ? err.message : 'Network request failed',
    });
  }
};
