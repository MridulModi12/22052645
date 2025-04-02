const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');

const app = express();
const cache = new NodeCache();

// API configuration
const BASE_URL = 'http://20.244.56.144/evaluation-service';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQzNjA1NDk0LCJpYXQiOjE3NDM2MDUxOTQsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjVkNzE1NjRkLTgzMDktNDJmYy1hODEzLTg1MjM3NWYxY2JmNyIsInN1YiI6IjIyMDUyNjQ1QGtpaXQuYWMuaW4ifSwiZW1haWwiOiIyMjA1MjY0NUBraWl0LmFjLmluIiwibmFtZSI6Im1yaWR1bCBtb2RpIiwicm9sbE5vIjoiMjIwNTI2NDUiLCJhY2Nlc3NDb2RlIjoibndwd3JaIiwiY2xpZW50SUQiOiI1ZDcxNTY0ZC04MzA5LTQyZmMtYTgxMy04NTIzNzVmMWNiZjciLCJjbGllbnRTZWNyZXQiOiJKRVRSSnJYTlV3QWNTV2hkIn0.OlhYlF7ngvDa6fMj9XAI88kON5gKDv2FCBTBuKFHZ60';
const CACHE_TTL = 300; // 5 minutes
const REFRESH_INTERVAL = 60000; // 1 minute

// Helper function for authenticated API requests
async function fetchWithAuth(url) {
  try {
    const response = await axios.get(url, {
      headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error.message);
    throw error;
  }
}

// Function to fetch all users and their post counts
async function fetchAllUserPostCounts() {
  // Fetch all users
  const usersData = await fetchWithAuth(`${BASE_URL}/users`);
  const users = usersData.users || {};
  
  // Fetch post counts for each user concurrently
  const userPromises = Object.entries(users).map(async ([userId, userName]) => {
    try {
      const postsData = await fetchWithAuth(`${BASE_URL}/users/${userId}/posts`);
      return {
        userId,
        name: userName,
        postCount: postsData.posts ? postsData.posts.length : 0
      };
    } catch (error) {
      console.error(`Error fetching posts for user ${userId}:`, error.message);
      return { userId, name: userName, postCount: 0 };
    }
  });
  
  // Wait for all requests to complete
  const userStats = await Promise.all(userPromises);
  
  // Sort by post count in descending order
  userStats.sort((a, b) => b.postCount - a.postCount);
  
  return userStats;
}

// Function to refresh the cache
async function refreshCache() {
  try {
    console.log('Refreshing cache...');
    const userStats = await fetchAllUserPostCounts();
    
    // Store all user stats and the top 5 separately
    cache.set('allUserStats', userStats, CACHE_TTL);
    cache.set('topUsers', userStats.slice(0, 5), CACHE_TTL);
    cache.set('lastUpdated', Date.now());
    
    console.log(`Cache refreshed successfully at ${new Date().toISOString()}`);
  } catch (error) {
    console.error('Failed to refresh cache:', error.message);
  }
}

// Initialize cache and set up background refresh
async function initializeCache() {
  try {
    await refreshCache();
    setInterval(refreshCache, REFRESH_INTERVAL);
  } catch (error) {
    console.error('Failed to initialize cache:', error.message);
    setTimeout(initializeCache, 10000);
  }
}

// GET endpoint for top 5 users with highest post counts
app.get('/users', async (req, res) => {
  try {
    // Check if we have cached data
    let topUsers = cache.get('topUsers');
    let lastUpdated = cache.get('lastUpdated');
    
    // If no cached data, fetch fresh data
    if (!topUsers) {
      console.log('Cache miss. Fetching fresh data...');
      const userStats = await fetchAllUserPostCounts();
      topUsers = userStats.slice(0, 5);
      lastUpdated = Date.now();
      
      // Update cache
      cache.set('allUserStats', userStats, CACHE_TTL);
      cache.set('topUsers', topUsers, CACHE_TTL);
      cache.set('lastUpdated', lastUpdated);
    }
    
    // Return just the top 5 users
    res.json({
      topUsers,
      timestamp: new Date(lastUpdated).toISOString()
    });
  } catch (error) {
    console.error('Error getting top users:', error);
    res.status(500).json({ error: 'Failed to retrieve top users' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await initializeCache();
});
