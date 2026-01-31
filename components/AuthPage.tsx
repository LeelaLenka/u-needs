
import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { User, UserRole } from '../types';

interface AuthPageProps {
  onLogin: (user: User) => void;
  allUsers: User[];
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin, allUsers }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [role, setRole] = useState<UserRole>(UserRole.HOSTELER);
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    const collegePattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(edu|edu\.in|ac\.in)$/;
    return collegePattern.test(email);
  };

  const validatePassword = (pass: string) => {
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;
    return strongRegex.test(pass);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Admin login shortcut
    if (email === 'admin@campus.edu' && password === 'Admin@123') {
       onLogin({
        id: 'admin-1',
        userName: 'admin',
        fullName: 'System Administrator',
        email: 'admin@campus.edu',
        role: UserRole.ADMIN,
        profileComplete: true,
        walletBalance: 0,
        totalEarnings: 0
      });
      navigate('/dashboard');
      return;
    }

    if (mode === 'register') {
      if (!validateEmail(email)) {
        setError('Please use a valid college email address ending in .edu, .edu.in, or .ac.in');
        return;
      }
      if (!validatePassword(password)) {
        setError('Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      
      const existing = allUsers.find(u => u.email === email);
      if (existing) {
        setError('User already exists. Please sign in instead.');
        return;
      }

      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        userName,
        fullName,
        email,
        role,
        profileComplete: false,
        walletBalance: 0,
        totalEarnings: 0
      };
      onLogin(newUser);
      navigate('/dashboard');
    } else {
      const existingUser = allUsers.find(u => u.email === email);
      if (!existingUser) {
        setError('No account found with this email. Please register.');
        return;
      }
      onLogin(existingUser);
      navigate('/dashboard');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
      <div className="bg-indigo-600 p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
        <p className="text-indigo-100">{mode === 'login' ? 'Sign in to access your campus dashboard' : 'Join your campus delivery community today'}</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-8 space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        {mode === 'register' && (
          <>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">User Name</label>
              <input 
                required
                type="text" 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none transition"
                placeholder="e.g. john_doe"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
              <input 
                required
                type="text" 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none transition"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">College Email</label>
          <input 
            required
            type="email" 
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none transition"
            placeholder="yourname@college.edu.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
          <input 
            required
            type="password" 
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none transition"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {mode === 'register' && (
          <>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Confirm Password</label>
              <input 
                required
                type="password" 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none transition"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Choose your role</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRole(UserRole.HOSTELER)}
                  className={`py-3 rounded-xl border font-bold text-[11px] uppercase transition ${role === UserRole.HOSTELER ? 'bg-indigo-50 border-indigo-600 text-indigo-600' : 'bg-white border-gray-200 text-gray-500'}`}
                >
                  Hosteler
                </button>
                <button
                  type="button"
                  onClick={() => setRole(UserRole.DAY_SCHOLAR)}
                  className={`py-3 rounded-xl border font-bold text-[11px] uppercase transition ${role === UserRole.DAY_SCHOLAR ? 'bg-indigo-50 border-indigo-600 text-indigo-600' : 'bg-white border-gray-200 text-gray-500'}`}
                >
                  Scholar
                </button>
                <button
                  type="button"
                  onClick={() => setRole(UserRole.ADMIN)}
                  className={`py-3 rounded-xl border font-bold text-[11px] uppercase transition ${role === UserRole.ADMIN ? 'bg-indigo-50 border-indigo-600 text-indigo-600' : 'bg-white border-gray-200 text-gray-500'}`}
                >
                  Admin
                </button>
              </div>
            </div>
          </>
        )}

        <button 
          type="submit"
          className="w-full mt-4 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
        >
          {mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>

        <div className="text-center pt-2">
          <button 
            type="button"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-gray-500 text-sm hover:text-indigo-600 font-medium"
          >
            {mode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AuthPage;
