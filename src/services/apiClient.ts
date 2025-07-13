import axios from 'axios';

const baseUrl = process.env.REACT_APP_API_URL;

const apiClient = axios.create({
    baseURL: baseUrl,
    headers: {
        'Content-Type': 'application/json'
    }
});

apiClient.interceptors.request.use(
    (config) => {
        const encodedCredentials = sessionStorage.getItem("authCredentials");

        if (encodedCredentials && !config.headers.Authorization) {
            config.headers.Authorization = `Basic ${encodedCredentials}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

/**
 * Helper to add Authorization header if credentials are provided.
 */
const withAuthHeader = (encodedCredential?: string) => {
    return encodedCredential ? { Authorization: `Basic ${encodedCredential}` } : {};
};

/**
 * Perform a GET request.
 * @param endpoint - API endpoint
 * @param params - Query parameters
 * @param encodedCredential - Optional base64-encoded credentials for auth
 * @returns Promise<any>
 */
export const getData = async (endpoint: string, params = {}, encodedCredential?: string) => {
    try {
        const response = await apiClient.get(endpoint, {
            params,
            headers: { ...withAuthHeader(encodedCredential) }
        });
        return response.data;
    } catch (error) {
        console.error('Error with GET request:', error);
        throw error;
    }
};

/**
 * Perform a POST request.
 * @param endpoint - API endpoint
 * @param data - Request body
 * @param encodedCredential - Optional base64-encoded credentials for auth
 * @returns Promise<any>
 */
export const postData = async (endpoint: string, data: any, encodedCredential?: string) => {
    try {
        const response = await apiClient.post(endpoint, data, {
            headers: { ...withAuthHeader(encodedCredential) }
        });
        return response.data;
    } catch (error) {
        console.error('Error with POST request:', error);
        throw error;
    }
};

/**
 * Perform a PUT request.
 * @param endpoint - API endpoint
 * @param data - Request body
 * @param encodedCredential - Optional base64-encoded credentials for auth
 * @returns Promise<any>
 */
export const putData = async (endpoint: string, data: any, encodedCredential?: string) => {
    try {
        const response = await apiClient.put(endpoint, data, {
            headers: { ...withAuthHeader(encodedCredential) }
        });
        return response.data;
    } catch (error) {
        console.error('Error with PUT request:', error);
        throw error;
    }
};

/**
 * Perform a DELETE request.
 * @param endpoint - API endpoint
 * @param encodedCredential - Optional base64-encoded credentials for auth
 * @returns Promise<any>
 */
export const deleteData = async (endpoint: string, encodedCredential?: string) => {
    try {
        const response = await apiClient.delete(endpoint, {
            headers: { ...withAuthHeader(encodedCredential) }
        });
        return response.data;
    } catch (error) {
        console.error('Error with DELETE request:', error);
        throw error;
    }
};

/**
 * Perform a PATCH request.
 * @param endpoint - API endpoint
 * @param data - Request body
 * @param encodedCredential - Optional base64-encoded credentials for auth
 * @returns Promise<any>
 */
export const patchData = async (endpoint: string, data: any, encodedCredential?: string) => {
    try {
        const response = await apiClient.patch(endpoint, data, {
            headers: { ...withAuthHeader(encodedCredential) }
        });
        return response.data;
    } catch (error) {
        console.error('Error with PATCH request:', error);
        throw error;
    }
};

/**
 * Perform a HEAD request.
 * @param endpoint - API endpoint
 * @param params - Query parameters
 * @param encodedCredential - Optional base64-encoded credentials for auth
 * @returns Promise<any>
 */
export const headData = async (endpoint: string, params = {}, encodedCredential?: string) => {
    try {
        const response = await apiClient.head(endpoint, {
            params,
            headers: { ...withAuthHeader(encodedCredential) }
        });
        return response.headers;
    } catch (error) {
        console.error('Error with HEAD request:', error);
        throw error;
    }
};

/**
 * Perform an OPTIONS request.
 * @param endpoint - API endpoint
 * @param params - Query parameters
 * @param encodedCredential - Optional base64-encoded credentials for auth
 * @returns Promise<any>
 */
export const optionsData = async (endpoint: string, params = {}, encodedCredential?: string) => {
    try {
        const response = await apiClient.options(endpoint, {
            params,
            headers: { ...withAuthHeader(encodedCredential) }
        });
        return response;
    } catch (error) {
        console.error('Error with OPTIONS request:', error);
        throw error;
    }
};

/**
 * Perform a TRACE request.
 * @param endpoint - API endpoint
 * @param params - Query parameters
 * @param encodedCredential - Optional base64-encoded credentials for auth
 * @returns Promise<any>
 */
export const traceRequest = async (endpoint: string, params = {}, encodedCredential?: string) => {
    try {
        const response = await apiClient.request({
            method: 'TRACE',
            url: endpoint,
            params,
            headers: { ...withAuthHeader(encodedCredential) }
        });
        return response.data;
    } catch (error) {
        console.error('Error with TRACE request:', error);
        throw error;
    }
};

/**
 * Perform a CONNECT request.
 * @param endpoint - API endpoint
 * @param params - Query parameters
 * @param encodedCredential - Optional base64-encoded credentials for auth
 * @returns Promise<any>
 */
export const connectRequest = async (endpoint: string, params = {}, encodedCredential?: string) => {
    try {
        const response = await apiClient.request({
            method: 'CONNECT',
            url: endpoint,
            params,
            headers: { ...withAuthHeader(encodedCredential) }
        });
        return response.data;
    } catch (error) {
        console.error('Error with CONNECT request:', error);
        throw error;
    }
};

/**
 * Fetch local JSON data (for static assets or mocks).
 * @param jsonPath - Path to the local JSON file
 * @returns Promise<any>
 */
export const getLocalJsonData = async (jsonPath: string) => {
    const response = await fetch(jsonPath);
    if (!response.ok) {
        throw new Error(`Unable to fetch local JSON from ${jsonPath}`);
    }
    const data = await response.json();
    return data;
};

export default apiClient;