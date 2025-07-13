import { WidgetDefinition } from '../models/WidgetDefinition';
import { getData, postData, putData, deleteData } from './apiClient';

const BASE_ENDPOINT = '/WidgetDefinitions';

/**
 * Service for fetching widget definitions from the backend API.
 */
export const getWidgetDefinitions = async (
    encodedCredential?: string
): Promise<WidgetDefinition[]> => {
    const url = `${BASE_ENDPOINT}`;
    return await getData(url, {}, encodedCredential);
};

/**
 * Fetch a widget definition by widget type.
 * @param widgetType - The widget type (e.g., 'Heading')
 * @param encodedCredential - Optional base64-encoded credentials for auth
 * @returns Promise<WidgetDefinition>
 */
export const getWidgetDefinitionByType = async (
    widgetType: string,
    encodedCredential?: string
): Promise<WidgetDefinition> => {
    
    const url = `${BASE_ENDPOINT}/type/${widgetType}`;
    console.log('getWidgetDefinitionByType', url);
    return await getData(url, {}, encodedCredential);
};

/**
 * Create a new widget definition.
 * @param widgetDef - The widget definition to create
 * @returns Promise<WidgetDefinition>
 */
export const createWidgetDefinition = async (
    widgetDef: WidgetDefinition,
    encodedCredential?: string
): Promise<WidgetDefinition> => {
    const url = `${BASE_ENDPOINT}`;
    return await postData(url, widgetDef, encodedCredential);
};

/**
 * Update an existing widget definition.
 * @param widgetType - The widget type (unique key)
 * @param widgetDef - The updated widget definition
 * @returns Promise<WidgetDefinition>
 */
export const updateWidgetDefinition = async (
    widgetType: string,
    widgetDef: WidgetDefinition,
    encodedCredential?: string
): Promise<WidgetDefinition> => {
    const url = `${BASE_ENDPOINT}/type/${widgetType}`;
    return await putData(url, widgetDef, encodedCredential);
};

/**
 * Delete a widget definition by widget type.
 * @param widgetType - The widget type (unique key)
 * @returns Promise<void>
 */
export const deleteWidgetDefinition = async (
    widgetType: string,
    encodedCredential?: string
): Promise<void> => {
    const url = `${BASE_ENDPOINT}/type/${widgetType}`;
    await deleteData(url, encodedCredential);
};