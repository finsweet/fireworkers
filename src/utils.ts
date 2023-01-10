export const FIRESTORE_ENDPOINT = 'https://firestore.googleapis.com';

/**
 * @returns The firestore endpoint for a project ID.
 * @param project_id
 */
export const get_firestore_endpoint = (project_id: string) =>
  `${FIRESTORE_ENDPOINT}/v1/projects/${project_id}/databases/(default)/documents`;
