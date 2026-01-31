
import React, { useState } from 'react';
import { User } from '../types';

interface ProfileSetupProps {
  user: User;
  onComplete: (data: Partial<User>) => void;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ user, onComplete }) => {
  const [formData, setFormData] = useState({
    phoneNumber: '',
    college: '',
    registrationNumber: '',
    branch: '',
    section: '',
    year: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(formData);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-50">
      <div className="bg-indigo-900 p-10 text-white relative">
        <div className="absolute top-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mt-12"></div>
        <h2 className="text-3xl font-black mb-2 tracking-tight">Setup Your Profile</h2>
        <p className="text-indigo-200 font-medium">To join the UNEEDS network, please verify your campus identity.</p>
      </div>
      <form onSubmit={handleSubmit} className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-1">
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
          <input type="text" disabled className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border border-transparent text-gray-400 font-medium" value={user.fullName} />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email ID</label>
          <input type="text" disabled className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border border-transparent text-gray-400 font-medium" value={user.email} />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
          <input 
            required type="tel" 
            className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-uneeds-u outline-none transition text-gray-600 font-medium" 
            placeholder="+91 00000 00000"
            value={formData.phoneNumber}
            onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">College Name</label>
          <input 
            required type="text" 
            className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-uneeds-u outline-none transition text-gray-600 font-medium" 
            placeholder="e.g. VIT University"
            value={formData.college}
            onChange={e => setFormData({...formData, college: e.target.value})}
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Registration No.</label>
          <input 
            required type="text" 
            className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-uneeds-u outline-none transition text-gray-600 font-medium font-mono" 
            placeholder="e.g. 21BCE0001"
            value={formData.registrationNumber}
            onChange={e => setFormData({...formData, registrationNumber: e.target.value})}
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Branch</label>
          <input 
            required type="text" 
            className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-uneeds-u outline-none transition text-gray-600 font-medium" 
            placeholder="e.g. CSE"
            value={formData.branch}
            onChange={e => setFormData({...formData, branch: e.target.value})}
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Section</label>
          <input 
            required type="text" 
            className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-uneeds-u outline-none transition text-gray-600 font-medium" 
            placeholder="e.g. A"
            value={formData.section}
            onChange={e => setFormData({...formData, section: e.target.value})}
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Year</label>
          <select 
            required 
            className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-uneeds-u outline-none transition text-gray-600 font-medium appearance-none"
            value={formData.year}
            onChange={e => setFormData({...formData, year: e.target.value})}
          >
            <option value="">Select Year</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>
        </div>
        <div className="md:col-span-2 pt-6">
          <button type="submit" className="w-full py-5 bg-indigo-900 text-white rounded-2xl font-black text-lg hover:bg-indigo-800 shadow-2xl shadow-indigo-100 transition active:scale-95">
            Complete Profile
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSetup;
