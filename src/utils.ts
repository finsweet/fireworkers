export const FIRESTORE_ENDPOINT = 'https://firestore.googleapis.com';

/**
 * @returns The firestore endpoint for a project ID.
 * @param project_id
 * @param paths
 * @param suffix
 */
export const get_firestore_endpoint = (
  project_id: string,
  paths: string[] = [],
  suffix = ''
): URL => {
  const allPaths = ['v1', 'projects', project_id, 'databases', '(default)', 'documents', ...paths];
  const path = allPaths.join('/') + suffix;

  // Support the Firebase Emulator Suite via the FIRESTORE_EMULATOR_HOST env var.
  // Accessed via globalThis to remain compatible with runtimes that lack `process` (e.g. Cloudflare Workers).
  const proc = (globalThis as Record<string, unknown>)['process'] as
    | { env?: Record<string, string | undefined> }
    | undefined;
  const emulator_host = proc?.env?.FIRESTORE_EMULATOR_HOST;
  const base = emulator_host ? `http://${emulator_host}` : FIRESTORE_ENDPOINT;

  const endpoint = new URL(base);

  // We assign the pathname after instantiating the URL to ensure any hashes are encoded as part of the patname.
  // This is done to support use cases where users have hashes in their document IDs.
  endpoint.pathname = path;

  return endpoint;
};
