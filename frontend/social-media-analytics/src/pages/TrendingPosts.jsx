import React, { useState, useEffect } from 'react';
import PostCard from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { fetchPosts } from '../services/api';

const TrendingPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getTrendingPosts = async () => {
      try {
        setLoading(true);
        const data = await fetchPosts('popular');
        setPosts(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching trending posts:', err);
        setError('Failed to load trending posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    getTrendingPosts();
    
    // Set up polling for real-time updates
    const interval = setInterval(getTrendingPosts, 60000); // Refresh every minute
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading trending posts..." />;
  }

  if (error) {
    return <div className="bg-red-100 text-red-700 p-4 rounded-md">{error}</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Trending Posts</h1>
        <p className="text-gray-600">
          {posts.length > 0 
            ? `Posts with ${posts[0].commentCount} comments (most on the platform)`
            : 'Posts with the most comments'}
        </p>
      </div>
      
      {posts.length > 0 ? (
        <div>
          {posts.map(post => (
            <PostCard key={post.id} post={post} isTrending={true} />
          ))}
        </div>
      ) : (
        <div className="bg-blue-100 text-blue-700 p-4 rounded-md">
          No trending posts found
        </div>
      )}
    </div>
  );
};

export default TrendingPosts;
