import axios from 'axios';

// Detect production domain dynamically so requests always target the real backend
// even if VITE_API_URL was not set in Vercel build environment.
const isProductionDomain =
  typeof window !== 'undefined' && window.location.hostname.includes('akbarshoh-dev.uz');

const defaultProdApiUrl = isProductionDomain ? 'https://qonnect-api.akbarshoh-dev.uz' : '';

const apiBase = import.meta.env.VITE_API_URL || defaultProdApiUrl;

const baseURL = apiBase ? `${apiBase}/api` : '/api';

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to landing if unauthorized
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
