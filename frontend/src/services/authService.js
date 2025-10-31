import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { API_BASE_URL, API_ENDPOINTS } from '../../config/api';

const authService = {
  // Login
  login: async (username, password) => {
    try {
      console.log('Attempting login to:', `${API_BASE_URL}${API_ENDPOINTS.TOKEN}`);
      
      const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.TOKEN}`, {
        username,
        password,
      });
      
      console.log('Login response received:', response.status);
      
      const { access, refresh } = response.data;
      
      // Store tokens
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      
      // Decode token to get user_id
      const decoded = jwtDecode(access);
      const userId = decoded.user_id;
      
      console.log('Fetching user profile for ID:', userId);
      
      // Fetch full user details from API
      const userResponse = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.USER_DETAIL(userId)}`, {
        headers: { Authorization: `Bearer ${access}` }
      });
      
      console.log('User profile received:', userResponse.data.username);
      
      const user = {
        user_id: userResponse.data.user_id,
        username: userResponse.data.username,
        full_name: userResponse.data.full_name,
        email: userResponse.data.email,
        role: userResponse.data.role,
      };
      localStorage.setItem('user', JSON.stringify(user));
      
      return user;
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw error;
    }
  },

  // Register
  register: async (userData) => {
    const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.USERS}`, userData);
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch (e) {
      console.warn('Failed to parse user from localStorage', e);
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return false;
    
    try {
      const decoded = jwtDecode(token);
      // Check if token is expired
      return decoded.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  },

  // Check if user is admin
  isAdmin: () => {
    const user = authService.getCurrentUser();
    return user?.role === 'admin';
  },
};

export default authService;
