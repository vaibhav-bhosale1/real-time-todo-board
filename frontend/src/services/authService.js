import api from './api'; // Our configured axios instance

export const registerUser = async (username, email, password) => {
  try {
    const response = await api.post('/api/users/register', { username, email, password });
    return response.data;
  } catch (error) {
    throw error; // Re-throw to be handled by the component
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await api.post('/api/users/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  // If you had Socket.IO connected globally or in a top-level component,
  // you might want to emit a disconnect event or explicitly disconnect it here.
  console.log('User logged out.');
};

export const getCurrentUser = () => {
  // In a real app, you might decode the JWT or have a /api/users/me endpoint
  // For now, we'll just check for token presence
  return localStorage.getItem('token') ? true : false;
};