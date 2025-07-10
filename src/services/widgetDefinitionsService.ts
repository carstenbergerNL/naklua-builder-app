import { WidgetDefinition } from '../models/WidgetDefinition';
import { getData } from './apiClient';

const BASE_ENDPOINT = '/WidgetDefinitions';

export const getWidgetDefinitions = async (
    encodedCredential?: string
): Promise<WidgetDefinition[]> => {
    const url = `${BASE_ENDPOINT}`;
    return await getData(url, {}, encodedCredential);
};

export const getWidgetDefinitionByType = async (
    widgetType: string,
    encodedCredential?: string
): Promise<WidgetDefinition> => {
    
    const url = `${BASE_ENDPOINT}/type/${widgetType}`;
    console.log('getWidgetDefinitionByType', url);
    return await getData(url, {}, encodedCredential);
};