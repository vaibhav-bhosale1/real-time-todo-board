import axios from 'axios';

// Create a custom Axios instance
const api = axios.create({
  baseURL: 'https://real-time-todo-board.onrender.com', // Use proxy setting in package.json for development
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token to headers
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

// Response interceptor to handle token expiration/invalidity
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If a 401 Unauthorized response is received, and it's not the login/register route itself
    if (error.response && error.response.status === 401 && !error.config.url.includes('/users/')) {
      console.warn('Unauthorized access detected or token expired. Clearing token and redirecting to login.');
      localStorage.removeItem('token');
      // Force a full page reload to clear all state and redirect,
      // as `Maps` from `react-router-dom` might not be available here.
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;