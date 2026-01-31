
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, DeliveryRequest, RequestStatus, UserRole } from '../types';

interface AdminDashboardProps {
  user: User;
  allUsers: User[];
  requests: DeliveryRequest[];
  onUpdateRequest: (req: DeliveryRequest) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, allUsers, requests, onUpdateRequest }) => {
  const [tab, setTab] = useState<'orders' | 'users' | 'disputes'>('orders');
  const [searchTerm, setSearchTerm] = useState('');

  const stats = {
    revenue: requests.filter(r => r.status === RequestStatus.COMPLETED).reduce((sum, r) => sum + (r.serviceCharge * 0.2), 0),
    active: requests.filter(r => r.status !== RequestStatus.COMPLETED && r.status !== RequestStatus.CANCELLED).length,
    disputed: requests.filter(r => r.status === RequestStatus.DISPUTED).length,
    totalUsers: allUsers.length
  };

  const handleResolveDispute = (req: DeliveryRequest, resolveType: 'complete' | 'refund') => {
    if (resolveType === 'complete') {
      onUpdateRequest({ ...req, status: RequestStatus.COMPLETED });
    } else {
      // Logic for refunding would involve wallet balance updates in a real app,
      // but here we just cancel the request.
      onUpdateRequest({ ...req, status: RequestStatus.CANCELLED });
    }
  };

  const filteredRequests = tab === 'disputes' 
    ? requests.filter(r => r.status === RequestStatus.DISPUTED)
    : requests;

  const filteredUsers = allUsers.filter(u => 
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900">Platform Command Center</h2>
          <p className="text-gray-500">Monitor campus logistics and resolve user queries</p>
        </div>
        <div className="flex gap-2 bg-gray-100 p-1.5 rounded-2xl">
          <button 
            onClick={() => setTab('orders')} 
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition ${tab === 'orders' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'}`}
          >
            All Orders
          </button>
          <button 
            onClick={() => setTab('disputes')} 
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition relative ${tab === 'disputes' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'}`}
          >
            Disputes 
            {stats.disputed > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] flex items-center justify-center rounded-full animate-pulse">
                {stats.disputed}
              </span>
            )}
          </button>
          <button 
            onClick={() => setTab('users')} 
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition ${tab === 'users' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'}`}
          >
            Users
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-indigo-600 p-6 rounded-3xl text-white shadow-xl shadow-indigo-100">
          <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest mb-1">Platform Revenue</p>
          <p className="text-3xl font-black">₹{user.walletBalance.toFixed(2)}</p>
          <div className="mt-4 pt-4 border-t border-indigo-500/50 flex justify-between items-center text-[10px]">
             <span className="opacity-70">Admin Earnings</span>
             <span className="font-bold bg-white/20 px-2 py-0.5 rounded">20% of Fee</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Active Jobs</p>
          <p className="text-3xl font-black text-gray-900">{stats.active}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Registered Users</p>
          <p className="text-3xl font-black text-emerald-600">{stats.totalUsers}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Open Disputes</p>
          <p className={`text-3xl font-black ${stats.disputed > 0 ? 'text-red-500' : 'text-gray-300'}`}>{stats.disputed}</p>
        </div>
      </div>

      {tab !== 'users' ? (
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-xl">{tab === 'disputes' ? 'Unresolved Disputes' : 'All Order History'}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/80 text-gray-400 text-[9px] font-black uppercase tracking-widest border-b">
                  <th className="px-8 py-5">Order ID</th>
                  <th className="px-8 py-5">Parties</th>
                  <th className="px-8 py-5">Amount</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRequests.map(req => (
                  <tr key={req.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-8 py-5 font-mono text-[10px] text-gray-400">#{req.id}</td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col gap-1">
                        <p className="text-xs font-bold text-gray-700">H: {req.hostelerName}</p>
                        <p className="text-[10px] text-gray-400">D: {req.dayScholarName || 'Unassigned'}</p>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-indigo-600">₹{req.totalAmount}</span>
                        <span className="text-[9px] text-gray-400">Fee: ₹{req.serviceCharge}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter ${
                        req.status === RequestStatus.DISPUTED ? 'bg-red-100 text-red-600' :
                        req.status === RequestStatus.COMPLETED ? 'bg-emerald-100 text-emerald-600' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right flex items-center justify-end gap-2">
                      {req.status === RequestStatus.DISPUTED && (
                        <>
                          <button 
                            onClick={() => handleResolveDispute(req, 'complete')}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white text-[9px] font-bold px-3 py-1.5 rounded-lg transition"
                          >
                            Resolve & Pay
                          </button>
                          <button 
                            onClick={() => handleResolveDispute(req, 'refund')}
                            className="bg-red-500 hover:bg-red-600 text-white text-[9px] font-bold px-3 py-1.5 rounded-lg transition"
                          >
                            Refund
                          </button>
                        </>
                      )}
                      <Link 
                        to={`/request/${req.id}`}
                        className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-xl transition"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b bg-gray-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h3 className="font-bold text-xl">User Directory</h3>
            <div className="relative w-full md:w-72">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:border-indigo-500 outline-none transition"
                placeholder="Search name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/80 text-gray-400 text-[9px] font-black uppercase tracking-widest border-b">
                  <th className="px-8 py-5">Full Name</th>
                  <th className="px-8 py-5">Role</th>
                  <th className="px-8 py-5">Wallet</th>
                  <th className="px-8 py-5 text-right">Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-10 text-center text-gray-400 italic">
                      No users found matching "{searchTerm}"
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50/30 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center font-bold text-indigo-600 text-xs">
                            {u.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-700">{u.fullName}</p>
                            <p className="text-[10px] text-gray-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          u.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-600' :
                          u.role === UserRole.HOSTELER ? 'bg-indigo-100 text-indigo-600' :
                          'bg-emerald-100 text-emerald-600'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-8 py-5 font-bold text-sm text-gray-700">₹{u.walletBalance.toFixed(2)}</td>
                      <td className="px-8 py-5 text-right">
                        <span className={`text-[10px] font-bold ${u.profileComplete ? 'text-emerald-500' : 'text-amber-500'}`}>
                          {u.profileComplete ? 'Verified' : 'Incomplete'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
