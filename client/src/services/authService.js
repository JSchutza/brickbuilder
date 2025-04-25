import api from './api';

// Register user
export const register = async (userData) => {
  const response = await api.post('/users', userData);
  return response.data;
};

// Login user
export const login = async (userData) => {
  const response = await api.post('/users/login', userData);
  return response.data;
};

// Get current user profile
export const getCurrentUser = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

// Check if token is valid
export const checkAuthStatus = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    const response = await api.get('/users/profile');
    return response.data;
  } catch (error) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return null;
  }
}; 