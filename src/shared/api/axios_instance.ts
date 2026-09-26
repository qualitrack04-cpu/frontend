import axios from 'axios';
import type{ AxiosError } from 'axios';

const axios_instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL_PRIORITAS || import.meta.env.VITE_API_BASE_URL_SECOND,
  headers: {
    'Content-Type': 'application/json',
  },
});

axios_instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axios_instance.interceptors.response.use(
  (response) => response,
  (error : AxiosError) => {
    const status = error.response?.status;
    const url = error.config?.url ?? '';

    const isAuthAttempt = 
      url.includes('/login') || url.includes('/forgot-password');

    if (status === 401 && !isAuthAttempt) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('fullName');

      if (window.location.pathname !== '/login'){
        window.location.href = '/login';
      }
    }

    return Promise.reject(error); 
  }
);

export default axios_instance;