import axios from 'axios';

// API configuration
const API_BASE_URL = 'http://localhost:3000'; // Your backend API
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQzNjA5ODgzLCJpYXQiOjE3NDM2MDk1ODMsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjVkNzE1NjRkLTgzMDktNDJmYy1hODEzLTg1MjM3NWYxY2JmNyIsInN1YiI6IjIyMDUyNjQ1QGtpaXQuYWMuaW4ifSwiZW1haWwiOiIyMjA1MjY0NUBraWl0LmFjLmluIiwibmFtZSI6Im1yaWR1bCBtb2RpIiwicm9sbE5vIjoiMjIwNTI2NDUiLCJhY2Nlc3NDb2RlIjoibndwd3JaIiwiY2xpZW50SUQiOiI1ZDcxNTY0ZC04MzA5LTQyZmMtYTgxMy04NTIzNzVmMWNiZjciLCJjbGllbnRTZWNyZXQiOiJKRVRSSnJYTlV3QWNTV2hkIn0.Y3o0CifWVQnqA-5w7oubFPC_2MWiNXghINPmouwB5eA';

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
    const response = await api.get('/users');
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
