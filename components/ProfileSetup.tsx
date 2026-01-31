
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
    <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-indigo-100">
      <div className="bg-indigo-600 p-8 text-white">
        <h2 className="text-2xl font-bold mb-2">Complete Your Profile</h2>
        <p className="text-indigo-100">To start using YOU NEEDS, please provide your campus details first.</p>
      </div>
      <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
          <input type="text" disabled className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-500" value={user.fullName} />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Email ID</label>
          <input type="text" disabled className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-500" value={user.email} />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
          <input 
            required type="tel" 
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none" 
            placeholder="+91 00000 00000"
            value={formData.phoneNumber}
            onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">College Name</label>
          <input 
            required type="text" 
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none" 
            placeholder="e.g. VIT University"
            value={formData.college}
            onChange={e => setFormData({...formData, college: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Registration Number</label>
          <input 
            required type="text" 
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none" 
            placeholder="e.g. 21BCE0001"
            value={formData.registrationNumber}
            onChange={e => setFormData({...formData, registrationNumber: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Branch</label>
          <input 
            required type="text" 
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none" 
            placeholder="e.g. CSE"
            value={formData.branch}
            onChange={e => setFormData({...formData, branch: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Section</label>
          <input 
            required type="text" 
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none" 
            placeholder="e.g. A"
            value={formData.section}
            onChange={e => setFormData({...formData, section: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Year</label>
          <select 
            required 
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none"
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
        <div className="md:col-span-2 pt-4">
          <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition">
            Save Profile & Continue
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSetup;
