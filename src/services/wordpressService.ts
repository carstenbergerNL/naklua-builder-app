import { getData } from './apiClient';

const BASE_ENDPOINT = '';

export const getBlogList = async (
  id: string,
  encodedCredential?: string
): Promise<any[]> => {
  const url = `${BASE_ENDPOINT}/App/${id}`;
  return await getData(url, {}, encodedCredential);
};

export const getBlogPost = async (
  id: string,
  encodedCredential?: string
): Promise<any> => {
  const url = `${BASE_ENDPOINT}/App/${id}`;
  return await getData(url, {}, encodedCredential);
};