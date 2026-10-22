import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

const primaryUrl = import.meta.env.VITE_API_BASE_URL_PRIORITAS;
const secondaryUrl = import.meta.env.VITE_API_BASE_URL_SECOND;
const defaultUrl = import.meta.env.VITE_API_BASE_URL || '/api';

const activeBaseURL = primaryUrl || secondaryUrl || defaultUrl;

const axios_instance = axios.create({
  baseURL: activeBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let hasSwitchedToSecondary = false;

axios_instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axios_instance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as (InternalAxiosRequestConfig & { _retriedSecondary?: boolean }) | undefined;

    // If request to primary API completely failed due to network error and secondary API exists, auto retry with secondary
    if (
      !hasSwitchedToSecondary &&
      secondaryUrl &&
      config &&
      !config._retriedSecondary &&
      (!error.response || error.code === 'ERR_NETWORK')
    ) {
      config._retriedSecondary = true;
      hasSwitchedToSecondary = true;
      axios_instance.defaults.baseURL = secondaryUrl;
      config.baseURL = secondaryUrl;
      return axios_instance.request(config);
    }

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