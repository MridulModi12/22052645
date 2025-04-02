import React from 'react';
import { getRandomImage } from '../utils/imageUtils';

const UserCard = ({ user, index }) => {
  // Generate colors for user card styling
  const colors = ['bg-blue-500', 'bg-green-500', 'bg-red-500', 'bg-purple-500', 'bg-orange-500'];
  const badgeColors = ['bg-blue-100 text-blue-800', 'bg-green-100 text-green-800', 
                     'bg-red-100 text-red-800', 'bg-purple-100 text-purple-800', 
                     'bg-orange-100 text-orange-800'];
  
  const colorIndex = index % colors.length;
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4 hover:shadow-lg transition-all">
      <div className="p-4 md:p-5 flex items-center">
        <div className="text-2xl font-bold text-gray-400 mr-4">#{index + 1}</div>
        <div className="relative mr-4">
          <img 
            src={getRandomImage(user.userId, 100)} 
            alt={user.name} 
            className="w-14 h-14 rounded-full object-cover"
          />
          <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full ${colors[colorIndex]} 
                         flex items-center justify-center text-white text-xs font-bold`}>
            {user.name.charAt(0).toUpperCase()}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{user.name}</h3>
          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${badgeColors[colorIndex]}`}>
            {user.postCount} posts
          </span>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
