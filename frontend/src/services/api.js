import axios from 'axios';

// Dynamically resolve the backend base URL to avoid loopback or hostname mismatch connection refusal issues.
const getBaseURL = () => {
  if (typeof window === 'undefined') {
    return import.meta.env.VITE_API_URL || 'https://bellwin-erp-project.onrender.com/api';
  }
  const { hostname, protocol } = window.location;
  const isLocal =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('172.') ||
    hostname.startsWith('10.');

  if (isLocal) {
    return `${protocol}//${hostname}:5000/api`;
  }
  return import.meta.env.VITE_API_URL || 'https://bellwin-erp-project.onrender.com/api';
};

// Dynamically resolve uploaded asset paths to the active backend host.
export const getAssetUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;

  if (typeof window !== 'undefined') {
    const { hostname, protocol } = window.location;
    const isLocal =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('172.') ||
      hostname.startsWith('10.');

    if (isLocal) {
      return `${protocol}//${hostname}:5000/${path}`;
    }
  }
  return `https://bellwin-erp-project.onrender.com/${path}`;
};

const api = axios.create({
  baseURL: getBaseURL(),
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle 401 & 403 globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status } = error.response;
      // Do not trigger logout redirect if the 401 came from the login request itself
      if (status === 401 && !error.config.url.includes('/auth/login')) {
        // Unauthorized - Token expired or invalid
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/'; // Redirect to login
      }
    }
    return Promise.reject(error);
  }
);

export default api;
