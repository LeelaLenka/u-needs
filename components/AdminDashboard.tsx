
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, DeliveryRequest, RequestStatus, UserRole, AdminAlert, Transaction } from '../types';

interface AdminDashboardProps {
  user: User;
  allUsers: User[];
  requests: DeliveryRequest[];
  transactions: Transaction[];
  onUpdateRequest: (req: DeliveryRequest) => void;
  alerts: AdminAlert[];
  onClearAlerts: () => void;
  onDismissAlert: (id: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  user, 
  allUsers, 
  requests, 
  transactions,
  onUpdateRequest,
  alerts,
  onClearAlerts,
  onDismissAlert
}) => {
  const [tab, setTab] = useState<'orders' | 'users' | 'disputes'>('orders');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

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

  const getStatusBadgeStyles = (status: RequestStatus) => {
    switch(status) {
      case RequestStatus.COMPLETED: return 'bg-emerald-100 text-emerald-700';
      case RequestStatus.CANCELLED: return 'bg-gray-100 text-gray-500';
      case RequestStatus.DISPUTED: return 'bg-red-100 text-red-700';
      case RequestStatus.OPEN: return 'bg-indigo-100 text-indigo-700';
      default: return 'bg-amber-100 text-amber-700';
    }
  };

  const getTxTypeStyles = (type: string) => {
    switch(type) {
      case 'deposit': return { bg: 'bg-emerald-50', text: 'text-emerald-700' };
      case 'earning': return { bg: 'bg-indigo-50', text: 'text-indigo-700' };
      case 'withdrawal': return { bg: 'bg-rose-50', text: 'text-rose-700' };
      case 'payment': return { bg: 'bg-amber-50', text: 'text-amber-700' };
      case 'refund': return { bg: 'bg-blue-50', text: 'text-blue-700' };
      default: return { bg: 'bg-gray-50', text: 'text-gray-700' };
    }
  };

  return (
    <div className="space-y-8 relative">
      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="p-8 border-b bg-gray-50/50 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black">
                  {selectedUser.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900">{selectedUser.fullName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                      selectedUser.role === UserRole.HOSTELER ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'
                    }`}>
                      {selectedUser.role}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">{selectedUser.email}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedUser(null)}
                className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition shadow-sm"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-grow overflow-y-auto p-8 space-y-8 bg-white">
              <div className="grid md:grid-cols-3 gap-6">
                {/* Stats Summary */}
                <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4">Balance Info</p>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Wallet Balance</p>
                      <p className="text-2xl font-black text-indigo-600">₹{selectedUser.walletBalance.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Total Lifetime Earnings</p>
                      <p className="text-2xl font-black text-emerald-600">₹{(selectedUser.totalEarnings || 0).toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {/* Profile Details */}
                <div className="md:col-span-2 bg-gray-50 rounded-3xl p-6 border border-gray-100 grid grid-cols-2 gap-x-8 gap-y-4">
                  <p className="col-span-2 text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Academic Profile</p>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Phone</p>
                    <p className="text-sm font-bold text-gray-700">{selectedUser.phoneNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">College</p>
                    <p className="text-sm font-bold text-gray-700">{selectedUser.college || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Reg. No</p>
                    <p className="text-sm font-mono font-bold text-gray-700">{selectedUser.registrationNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Branch/Year</p>
                    <p className="text-sm font-bold text-gray-700">
                      {selectedUser.branch ? `${selectedUser.branch} - Year ${selectedUser.year}` : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Transactions Tab Section */}
              <div className="space-y-4">
                <h4 className="font-black text-gray-900 tracking-tight flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3-3v8a3 3 0 003 3z" />
                  </svg>
                  Financial Activity
                </h4>
                <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                          <th className="px-6 py-4">Date</th>
                          <th className="px-6 py-4">Type</th>
                          <th className="px-6 py-4">Description</th>
                          <th className="px-6 py-4 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {transactions.filter(tx => tx.userId === selectedUser.id).length === 0 ? (
                          <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-400 italic">No transactions recorded.</td></tr>
                        ) : (
                          transactions.filter(tx => tx.userId === selectedUser.id)
                            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                            .map(tx => {
                              const style = getTxTypeStyles(tx.type);
                              return (
                                <tr key={tx.id} className="hover:bg-gray-50/50">
                                  <td className="px-6 py-4 text-[11px] text-gray-500">{new Date(tx.timestamp).toLocaleDateString()}</td>
                                  <td className="px-6 py-4">
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${style.bg} ${style.text}`}>
                                      {tx.type}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-gray-700 font-medium">{tx.description}</td>
                                  <td className="px-6 py-4 text-right font-black text-gray-900">₹{tx.amount.toFixed(2)}</td>
                                </tr>
                              );
                            })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Order History Tab Section */}
              <div className="space-y-4">
                <h4 className="font-black text-gray-900 tracking-tight flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Campus Logistics History
                </h4>
                <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                          <th className="px-6 py-4">Order ID</th>
                          <th className="px-6 py-4">Role</th>
                          <th className="px-6 py-4">Items</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {requests.filter(r => r.hostelerId === selectedUser.id || r.dayScholarId === selectedUser.id).length === 0 ? (
                          <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400 italic">No orders found.</td></tr>
                        ) : (
                          requests.filter(r => r.hostelerId === selectedUser.id || r.dayScholarId === selectedUser.id)
                            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                            .map(req => {
                              const isHosteler = req.hostelerId === selectedUser.id;
                              return (
                                <tr key={req.id} className="hover:bg-gray-50/50">
                                  <td className="px-6 py-4 font-mono text-[10px] text-gray-400">#{req.id}</td>
                                  <td className="px-6 py-4">
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${isHosteler ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                      {isHosteler ? 'Requested' : 'Fulfilled'}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-gray-700 font-medium">
                                    {req.items[0]?.name}{req.items.length > 1 ? ` +${req.items.length - 1}` : ''}
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${getStatusBadgeStyles(req.status)}`}>
                                      {req.status}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-right font-black text-gray-900">₹{req.totalAmount}</td>
                                </tr>
                              );
                            })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-8 border-t bg-gray-50/50 flex justify-end gap-3">
               <button 
                 onClick={() => setSelectedUser(null)}
                 className="px-8 py-3 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
               >
                 Close Report
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl overflow-hidden shadow-sm animate-in slide-in-from-top duration-500">
          <div className="p-4 bg-amber-100 border-b border-amber-200 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h4 className="font-bold text-amber-800 text-sm">Dispute Alerts ({alerts.length})</h4>
            </div>
            <button 
              onClick={onClearAlerts}
              className="text-[10px] font-black uppercase tracking-widest text-amber-700 hover:text-amber-900 transition"
            >
              Clear All
            </button>
          </div>
          <div className="max-h-40 overflow-y-auto divide-y divide-amber-100">
            {alerts.map(alert => (
              <div key={alert.id} className="p-4 flex items-center justify-between gap-4 hover:bg-amber-100/50 transition">
                <div className="flex-grow">
                  <p className="text-xs text-amber-900">{alert.message}</p>
                  <p className="text-[10px] text-amber-600 mt-1">{new Date(alert.timestamp).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link 
                    to={`/request/${alert.requestId}`}
                    className="bg-amber-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-amber-700 transition"
                  >
                    Investigate
                  </Link>
                  <button 
                    onClick={() => onDismissAlert(alert.id)}
                    className="p-1.5 text-amber-400 hover:text-amber-600 transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
                    <tr 
                      key={u.id} 
                      className="hover:bg-indigo-50/30 transition-colors cursor-pointer group"
                      onClick={() => setSelectedUser(u)}
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center font-black text-indigo-600 text-xs group-hover:bg-white group-hover:shadow-sm transition">
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
                      <td className="px-8 py-5 font-black text-sm text-gray-700">₹{u.walletBalance.toFixed(2)}</td>
                      <td className="px-8 py-5 text-right">
                        <span className={`text-[10px] font-black uppercase tracking-tighter ${u.profileComplete ? 'text-emerald-500' : 'text-amber-500'}`}>
                          {u.profileComplete ? 'Verified' : 'Incomplete'}
                        </span>
                        <p className="text-[9px] text-gray-300 mt-1">Click to view details</p>
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
