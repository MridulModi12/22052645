import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-gray-800 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="text-xl font-bold">Social Media Analytics</div>
          
          {/* Desktop menu */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-6">
              <NavLink 
                to="/feed" 
                className={({ isActive }) => isActive 
                  ? "text-blue-400 font-medium" 
                  : "text-gray-300 hover:text-white transition-colors"
                }
              >
                Feed
              </NavLink>
              <NavLink 
                to="/top-users" 
                className={({ isActive }) => isActive 
                  ? "text-blue-400 font-medium" 
                  : "text-gray-300 hover:text-white transition-colors"
                }
              >
                Top Users
              </NavLink>
              <NavLink 
                to="/trending" 
                className={({ isActive }) => isActive 
                  ? "text-blue-400 font-medium" 
                  : "text-gray-300 hover:text-white transition-colors"
                }
              >
                Trending Posts
              </NavLink>
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-3">
              <NavLink 
                to="/feed" 
                className={({ isActive }) => isActive 
                  ? "text-blue-400 font-medium" 
                  : "text-gray-300 hover:text-white transition-colors"
                }
                onClick={() => setIsOpen(false)}
              >
                Feed
              </NavLink>
              <NavLink 
                to="/top-users" 
                className={({ isActive }) => isActive 
                  ? "text-blue-400 font-medium" 
                  : "text-gray-300 hover:text-white transition-colors"
                }
                onClick={() => setIsOpen(false)}
              >
                Top Users
              </NavLink>
              <NavLink 
                to="/trending" 
                className={({ isActive }) => isActive 
                  ? "text-blue-400 font-medium" 
                  : "text-gray-300 hover:text-white transition-colors"
                }
                onClick={() => setIsOpen(false)}
              >
                Trending Posts
              </NavLink>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
