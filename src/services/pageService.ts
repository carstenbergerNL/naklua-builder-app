import { Page } from '../models/Page';
import { getData } from './apiClient';

const BASE_ENDPOINT = '/Pages';

/**
 * Service for fetching pages from the backend API.
 * Pages may now have a parentId for hierarchy.
 */
export const getPages = async (
  id: string,
  encodedCredential?: string
): Promise<Page[]> => {
  const url = `${BASE_ENDPOINT}/App/${id}`;
  return await getData(url, {}, encodedCredential);
};