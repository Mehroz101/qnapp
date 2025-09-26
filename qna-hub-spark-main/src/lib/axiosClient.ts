import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL + '/api';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Add interceptors for request/response
axiosClient.interceptors.request.use(
  (config) => {
    // You can add auth headers or logging here
    return config;
  },
  (error) => Promise.reject(new Error(error?.message || String(error)))
);

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Global error handling (e.g., show toast, redirect, etc.)
    return Promise.reject(new Error(error?.message || String(error)))
  }
);

export default axiosClient;
