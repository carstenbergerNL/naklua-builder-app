import axios from 'axios';

const baseUrl = process.env.REACT_APP_API_URL;

const wpClient = axios.create({
    baseURL: baseUrl,
    headers: {
        'Content-Type': 'application/json'
    }
});

wpClient.interceptors.request.use(
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
        const response = await wpClient.get(endpoint, {
            params,
            headers: { ...withAuthHeader(encodedCredential) }
        });
        return response.data;
    } catch (error) {
        console.error('Error with GET request:', error);
        throw error;
    }
};

export default wpClient;