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

const withAuthHeader = (encodedCredential?: string) => {
    return encodedCredential ? { Authorization: `Basic ${encodedCredential}` } : {};
};

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

export const getLocalJsonData = async (jsonPath: string) => {
    const response = await fetch(jsonPath);
    if (!response.ok) {
        throw new Error(`Unable to fetch local JSON from ${jsonPath}`);
    }
    const data = await response.json();
    return data;
};

export default apiClient;