import { WidgetInstance } from '../models/WidgetInstance';
import { getData } from './apiClient';

const BASE_ENDPOINT = '/Widgets';

export const getWidgetsByPageId = async (
  id: string,
  encodedCredential?: string
): Promise<WidgetInstance[]> => {
  const url = `${BASE_ENDPOINT}/page/${id}`;

  return await getData(url, {}, encodedCredential);
};
