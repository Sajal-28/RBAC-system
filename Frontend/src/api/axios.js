import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Avoid redirect loops if we are already on login page
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        const message = error.response?.data?.message || 'Session expired';
        // Only redirect with error if it's explicitly about token failure, not just missing token
        if (message.includes('expired') || message.includes('invalidated')) {
          window.location.href = `/unauthorized?error=${encodeURIComponent(message)}`;
        }
      }
    }
    return Promise.reject(error);
  }
);

export default API;
