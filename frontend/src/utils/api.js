import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Your backend API base URL
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

// Response interceptor to handle token expiration (optional but good practice)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid, clear it and redirect to login
      localStorage.removeItem('token');
      // window.location.href = '/login'; // Or use navigate from react-router-dom if accessible
      console.warn('Token expired or invalid. Redirecting to login.');
    }
    return Promise.reject(error);
  }
);

export const logout = () => {
  localStorage.removeItem('token');
  // You might want to also disconnect Socket.IO here if it's initialized globally
  console.log('Logged out.');
};

export default api;