
import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center text-center max-w-4xl mx-auto py-12 px-4">
      <div className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wide text-indigo-600 uppercase bg-indigo-50 rounded-full">
        Campus Assistance Platform
      </div>
      <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
        Connecting <span className="text-indigo-600">Hostelers</span> with <span className="text-emerald-500">Day Scholars</span>
      </h1>
      <p className="text-xl text-gray-600 mb-10 max-w-2xl">
        Need medicines at midnight? Or food from your favorite local cafe? 
        Raise a ticket and let your fellow day scholars help you out while they earn a bit on their way back home.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-16">
        <Link to="/auth" className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all">
          Join the Network
        </Link>
        <button className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-bold text-lg hover:border-indigo-600 transition-all">
          How it Works
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-8 w-full">
        <div className="p-8 bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg>
          </div>
          <h3 className="text-xl font-bold mb-3 text-gray-800">Secure OTP Verification</h3>
          <p className="text-gray-500">Release payments only when you've received your item with our unique OTP system.</p>
        </div>
        <div className="p-8 bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </div>
          <h3 className="text-xl font-bold mb-3 text-gray-800">Live Location Tracking</h3>
          <p className="text-gray-500">Mutual visibility ensures transparency and smooth handovers between scholars.</p>
        </div>
        <div className="p-8 bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
          <h3 className="text-xl font-bold mb-3 text-gray-800">Fair Dispute Resolution</h3>
          <p className="text-gray-500">Dedicated admin module to monitor transactions and resolve any campus delivery issues.</p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
