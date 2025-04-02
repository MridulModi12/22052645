import React, { useState, useEffect } from 'react';
import UserCard from '../components/UserCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { fetchTopUsers } from '../services/api';

const TopUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getTopUsers = async () => {
      try {
        setLoading(true);
        const data = await fetchTopUsers();
        setUsers(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching top users:', err);
        setError('Failed to load top users. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    getTopUsers();
    
    // Set up polling for real-time updates
    const interval = setInterval(getTopUsers, 60000); // Refresh every minute
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading top users..." />;
  }

  if (error) {
    return <div className="bg-red-100 text-red-700 p-4 rounded-md">{error}</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Top Users</h1>
        <p className="text-gray-600">Users with the highest number of posts</p>
      </div>
      
      {users.length > 0 ? (
        <div>
          {users.map((user, index) => (
            <UserCard key={user.userId} user={user} index={index} />
          ))}
        </div>
      ) : (
        <div className="bg-blue-100 text-blue-700 p-4 rounded-md">
          No users found
        </div>
      )}
    </div>
  );
};

export default TopUsers;
