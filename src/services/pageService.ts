import { Page } from '../models/Page';
import { getData, postData } from './apiClient';

const BASE_ENDPOINT = '/Pages';

export const getPages = async (
  id: string,
  encodedCredential?: string
): Promise<Page[]> => {
  const url = `${BASE_ENDPOINT}/App/${id}`;
  return await getData(url, {}, encodedCredential);
};