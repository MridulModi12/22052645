const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');

const app = express();
const cache = new NodeCache();

// API configuration
const BASE_URL = 'http://20.244.56.144/evaluation-service';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQzNjA3NDQ3LCJpYXQiOjE3NDM2MDcxNDcsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjVkNzE1NjRkLTgzMDktNDJmYy1hODEzLTg1MjM3NWYxY2JmNyIsInN1YiI6IjIyMDUyNjQ1QGtpaXQuYWMuaW4ifSwiZW1haWwiOiIyMjA1MjY0NUBraWl0LmFjLmluIiwibmFtZSI6Im1yaWR1bCBtb2RpIiwicm9sbE5vIjoiMjIwNTI2NDUiLCJhY2Nlc3NDb2RlIjoibndwd3JaIiwiY2xpZW50SUQiOiI1ZDcxNTY0ZC04MzA5LTQyZmMtYTgxMy04NTIzNzVmMWNiZjciLCJjbGllbnRTZWNyZXQiOiJKRVRSSnJYTlV3QWNTV2hkIn0.e4lU9VzdDg1G539NA1zUL-HfeKrvds6h8RVTU2qD_EQ';
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

// Function to fetch all posts with their comment counts
async function fetchAllPostsWithComments() {
  try {
    // Fetch all users first to get their posts
    const usersData = await fetchWithAuth(`${BASE_URL}/users`);
    const users = usersData.users || {};
    
    let allPosts = [];
    
    // For each user, get their posts
    for (const [userId, userName] of Object.entries(users)) {
      const postsData = await fetchWithAuth(`${BASE_URL}/users/${userId}/posts`);
      if (postsData.posts && postsData.posts.length > 0) {
        // Add user info to each post
        const userPosts = postsData.posts.map(post => ({
          ...post,
          authorId: userId,
          authorName: userName
        }));
        allPosts = [...allPosts, ...userPosts];
      }
    }
    
    // Get comment counts for each post
    const postsWithComments = await Promise.all(allPosts.map(async (post) => {
      try {
        const commentsData = await fetchWithAuth(`${BASE_URL}/posts/${post.id}/comments`);
        return {
          ...post,
          comments: commentsData.comments || [],
          commentCount: commentsData.comments ? commentsData.comments.length : 0
        };
      } catch (error) {
        console.error(`Error fetching comments for post ${post.id}:`, error.message);
        return { ...post, comments: [], commentCount: 0 };
      }
    }));
    
    return postsWithComments;
  } catch (error) {
    console.error('Error fetching posts with comments:', error.message);
    throw error;
  }
}

// Function to refresh the cache
async function refreshCache() {
  try {
    console.log('Refreshing cache...');
    
    // Refresh user stats cache
    const userStats = await fetchAllUserPostCounts();
    cache.set('allUserStats', userStats, CACHE_TTL);
    cache.set('topUsers', userStats.slice(0, 5), CACHE_TTL);
    
    // Refresh posts cache
    const allPosts = await fetchAllPostsWithComments();
    
    // Cache all posts
    cache.set('allPosts', allPosts, CACHE_TTL);
    
    // Cache latest posts (sorted by timestamp descending)
    const latestPosts = [...allPosts].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5);
    cache.set('latestPosts', latestPosts, CACHE_TTL);
    
    // Find posts with maximum comments
    const maxCommentCount = Math.max(...allPosts.map(post => post.commentCount));
    const popularPosts = allPosts.filter(post => post.commentCount === maxCommentCount);
    cache.set('popularPosts', popularPosts, CACHE_TTL);
    
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

// GET endpoint for posts (latest or popular)
app.get('/posts', async (req, res) => {
  try {
    const type = req.query.type || 'latest';
    
    if (type !== 'latest' && type !== 'popular') {
      return res.status(400).json({ error: 'Invalid type parameter. Accepted values: latest, popular' });
    }
    
    let posts;
    let lastUpdated = cache.get('lastUpdated');
    
    if (type === 'latest') {
      posts = cache.get('latestPosts');
      
      if (!posts) {
        console.log('Cache miss for latest posts. Fetching fresh data...');
        const allPosts = await fetchAllPostsWithComments();
        posts = [...allPosts].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5);
        
        cache.set('latestPosts', posts, CACHE_TTL);
        cache.set('allPosts', allPosts, CACHE_TTL);
        lastUpdated = Date.now();
        cache.set('lastUpdated', lastUpdated);
      }
      
      return res.json({
        posts,
        type: 'latest',
        timestamp: new Date(lastUpdated).toISOString()
      });
    } else {
      // Popular posts (those with maximum comments)
      posts = cache.get('popularPosts');
      
      if (!posts) {
        console.log('Cache miss for popular posts. Fetching fresh data...');
        const allPosts = await fetchAllPostsWithComments();
        
        const maxCommentCount = Math.max(...allPosts.map(post => post.commentCount));
        posts = allPosts.filter(post => post.commentCount === maxCommentCount);
        
        cache.set('popularPosts', posts, CACHE_TTL);
        cache.set('allPosts', allPosts, CACHE_TTL);
        lastUpdated = Date.now();
        cache.set('lastUpdated', lastUpdated);
      }
      
      return res.json({
        posts,
        type: 'popular',
        maxCommentCount: posts.length > 0 ? posts[0].commentCount : 0,
        timestamp: new Date(lastUpdated).toISOString()
      });
    }
  } catch (error) {
    console.error('Error getting posts:', error);
    res.status(500).json({ error: 'Failed to retrieve posts' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await initializeCache();
});
