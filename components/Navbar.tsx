
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, UserRole } from '../types';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">Y</span>
          </div>
          <span className="font-bold text-xl tracking-tight text-indigo-900">YOU NEEDS</span>
        </Link>

        <div className="flex items-center gap-6">
          {user ? (
            <>
              <div className="flex items-center gap-4">
                <Link to="/dashboard" className="text-gray-600 hover:text-indigo-600 font-medium text-sm">Dashboard</Link>
                <Link to="/profile" className="text-gray-600 hover:text-indigo-600 font-medium text-sm">Profile</Link>
              </div>
              <div className="flex items-center gap-3 pl-4 border-l">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold">{user.fullName}</p>
                  <p className="text-xs text-indigo-600 font-bold">{user.role}</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm font-medium transition"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/auth" className="text-indigo-600 font-semibold hover:underline">Sign In</Link>
              <Link to="/auth?mode=register" className="bg-indigo-600 text-white px-6 py-2 rounded-full font-medium hover:bg-indigo-700 transition">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
