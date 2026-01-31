
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
    <div className="max-w-md mx-auto bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-50 mt-10">
      <div className="bg-indigo-900 p-10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
        <h2 className="text-4xl font-black mb-2 tracking-tight">{mode === 'login' ? 'Welcome' : 'Join UNEEDS'}</h2>
        <p className="text-indigo-200 text-sm font-medium">{mode === 'login' ? 'Sign in to your campus account' : 'Start your journey with campus assistance'}</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-10 space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold border border-red-100 animate-pulse">
            {error}
          </div>
        )}

        {mode === 'register' && (
          <>
            <div className="space-y-1">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">User Name</label>
              <input 
                required
                type="text" 
                className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-uneeds-u outline-none transition text-gray-600 font-medium"
                placeholder="e.g. john_doe"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
              <input 
                required
                type="text" 
                className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-uneeds-u outline-none transition text-gray-600 font-medium"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          </>
        )}

        <div className="space-y-1">
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">College Email</label>
          <input 
            required
            type="email" 
            className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-uneeds-u outline-none transition text-gray-600 font-medium"
            placeholder="yourname@college.edu.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
          <input 
            required
            type="password" 
            className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-uneeds-u outline-none transition text-gray-600 font-medium"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {mode === 'register' && (
          <>
            <div className="space-y-1">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Confirm Password</label>
              <input 
                required
                type="password" 
                className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-uneeds-u outline-none transition text-gray-600 font-medium"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">I am a...</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole(UserRole.HOSTELER)}
                  className={`py-3.5 rounded-2xl border-2 font-black text-[10px] uppercase tracking-tighter transition ${role === UserRole.HOSTELER ? 'bg-indigo-50 border-indigo-900 text-indigo-900 shadow-sm' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'}`}
                >
                  Hosteler
                </button>
                <button
                  type="button"
                  onClick={() => setRole(UserRole.DAY_SCHOLAR)}
                  className={`py-3.5 rounded-2xl border-2 font-black text-[10px] uppercase tracking-tighter transition ${role === UserRole.DAY_SCHOLAR ? 'bg-indigo-50 border-indigo-900 text-indigo-900 shadow-sm' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'}`}
                >
                  Scholar
                </button>
              </div>
            </div>
          </>
        )}

        <button 
          type="submit"
          className="w-full mt-4 py-4.5 bg-indigo-900 text-white rounded-2xl font-black text-lg hover:bg-indigo-800 transition shadow-xl shadow-indigo-100 active:scale-95"
        >
          {mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>

        <div className="text-center pt-2">
          <button 
            type="button"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-gray-400 text-sm hover:text-uneeds-u font-bold transition"
          >
            {mode === 'login' ? "New here? Join UNEEDS" : "Back to sign in"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AuthPage;
