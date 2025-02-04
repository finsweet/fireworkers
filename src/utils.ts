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

  const endpoint = new URL(FIRESTORE_ENDPOINT);
  endpoint.pathname = path;
  return endpoint;
};
