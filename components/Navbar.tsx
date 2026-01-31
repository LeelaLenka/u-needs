
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
        <Link to="/" className="flex items-center gap-3">
          <div className="flex flex-col items-center">
             <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-uneeds-u">U</span>
                <span className="text-3xl font-black text-uneeds-needs tracking-tighter">NEEDS</span>
             </div>
             <div className="bg-uneeds-serve px-4 py-0.5 rounded-full mt-[-4px]">
                <span className="text-[9px] font-black text-white tracking-widest">WE SERVE</span>
             </div>
          </div>
        </Link>

        <div className="flex items-center gap-6">
          {user ? (
            <>
              <div className="flex items-center gap-4">
                <Link to="/dashboard" className="text-gray-600 hover:text-indigo-600 font-semibold text-sm">Dashboard</Link>
                <Link to="/profile" className="text-gray-600 hover:text-indigo-600 font-semibold text-sm">Profile</Link>
              </div>
              <div className="flex items-center gap-3 pl-4 border-l">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-gray-800">{user.fullName}</p>
                  <p className="text-xs text-uneeds-u font-black uppercase tracking-tighter">{user.role}</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm font-semibold transition"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/auth" className="text-indigo-900 font-bold hover:underline">Sign In</Link>
              <Link to="/auth?mode=register" className="bg-indigo-900 text-white px-6 py-2 rounded-full font-bold hover:bg-indigo-800 transition shadow-md">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
