import axios from 'axios';

// API configuration
const API_BASE_URL = 'http://localhost:3000'; // Your backend API
const AUTH_TOKEN = 'xyz';

// Create axios instance with common config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${AUTH_TOKEN}`
  }
});

// API service methods
export const fetchTopUsers = async () => {
  try {
    const response = await api.get('/top-users');
    return response.data.topUsers || [];
  } catch (error) {
    console.error('Error fetching top users:', error);
    throw error;
  }
};

export const fetchPosts = async (type = 'latest') => {
  try {
    const response = await api.get(`/posts?type=${type}`);
    return response.data.posts || [];
  } catch (error) {
    console.error(`Error fetching ${type} posts:`, error);
    throw error;
  }
};

export default api;
