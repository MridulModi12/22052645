import React from 'react';
import { getRandomImage } from '../utils/imageUtils';

const PostCard = ({ post, showAuthor = true, isTrending = false }) => {
  const postDate = new Date(post.timestamp).toLocaleString();
  const commentColors = isTrending ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800';
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4 hover:shadow-lg transition-all">
      {showAuthor && (
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center">
            <img 
              src={getRandomImage(post.authorId, 50)} 
              alt={post.authorName} 
              className="w-10 h-10 rounded-full mr-3 object-cover"
            />
            <span className="font-medium text-gray-800">{post.authorName}</span>
          </div>
          <span className="text-sm text-gray-500">{postDate}</span>
        </div>
      )}
      
      <div className="p-4">
        <p className="text-gray-700 mb-3">{post.content}</p>
        
        {/* Random post image */}
        <img 
          src={getRandomImage(post.id, 500)} 
          alt="Post content" 
          className="w-full h-48 object-cover rounded-md mb-3"
        />
        
        <div className="flex justify-between items-center">
          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${commentColors}`}>
            {post.commentCount} comments
          </span>
          
          {isTrending && (
            <span className="inline-block bg-yellow-100 text-yellow-800 px-2.5 py-1 rounded-full text-xs font-medium">
              🔥 Trending
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostCard;
