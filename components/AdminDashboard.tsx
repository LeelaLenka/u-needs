
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, DeliveryRequest, RequestStatus, UserRole, AdminAlert, Transaction, TransactionType } from '../types';

interface AdminDashboardProps {
  user: User;
  allUsers: User[];
  requests: DeliveryRequest[];
  transactions: Transaction[];
  onUpdateRequest: (req: DeliveryRequest) => void;
  onUpdateUser: (updatedUser: User) => void;
  addTransaction: (userId: string, type: TransactionType, amount: number, description: string) => void;
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
  onUpdateUser,
  addTransaction,
  alerts,
  onClearAlerts,
  onDismissAlert
}) => {
  const [tab, setTab] = useState<'orders' | 'users' | 'disputes'>('orders');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [balanceAdjustment, setBalanceAdjustment] = useState<string>('');

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

  const handleAdjustBalance = (type: 'add' | 'subtract') => {
    if (!selectedUser) return;
    const amount = parseFloat(balanceAdjustment);
    if (isNaN(amount) || amount <= 0) return;

    const change = type === 'add' ? amount : -amount;
    const updatedUser = { ...selectedUser, walletBalance: Math.max(0, selectedUser.walletBalance + change) };
    
    onUpdateUser(updatedUser);
    addTransaction(selectedUser.id, type === 'add' ? 'deposit' : 'withdrawal', amount, `Admin adjustment: ${type}`);
    setSelectedUser(updatedUser);
    setBalanceAdjustment('');
  };

  const handleRoleChange = (newRole: UserRole) => {
    if (!selectedUser) return;
    const updatedUser = { ...selectedUser, role: newRole };
    onUpdateUser(updatedUser);
    setSelectedUser(updatedUser);
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
      case 'appreciation': return { bg: 'bg-indigo-50', text: 'text-indigo-700' };
      case 'withdrawal': return { bg: 'bg-rose-50', text: 'text-rose-700' };
      case 'payment': return { bg: 'bg-amber-50', text: 'text-amber-700' };
      case 'refund': return { bg: 'bg-blue-50', text: 'text-blue-700' };
      default: return { bg: 'bg-gray-50', text: 'text-gray-700' };
    }
  };

  return (
    <div className="space-y-8 relative">
      {/* Enhanced User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-5xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="p-8 border-b bg-gray-50/50 flex justify-between items-center">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-indigo-900 rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-indigo-100">
                  {selectedUser.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-3xl font-black text-gray-900 tracking-tight">{selectedUser.fullName}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <select 
                      value={selectedUser.role} 
                      onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                      className="px-3 py-1 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-indigo-600 focus:border-indigo-500 outline-none"
                    >
                      {Object.values(UserRole).map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                    <span className="text-xs text-gray-400 font-medium">{selectedUser.email}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedUser(null)}
                className="p-4 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition shadow-sm"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content - Two Column Layout */}
            <div className="flex-grow overflow-hidden flex flex-col lg:flex-row bg-white">
              {/* Sidebar - Profile and Quick Actions */}
              <div className="lg:w-80 border-r border-gray-100 p-8 space-y-8 overflow-y-auto bg-gray-50/30">
                <section className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Financial Management</h4>
                  <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Current Balance</p>
                      <p className="text-2xl font-black text-indigo-900">₹{selectedUser.walletBalance.toFixed(2)}</p>
                    </div>
                    <div className="space-y-2 pt-4 border-t border-gray-50">
                      <input 
                        type="number" 
                        placeholder="Amount (₹)"
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-500 text-sm font-bold outline-none transition"
                        value={balanceAdjustment}
                        onChange={(e) => setBalanceAdjustment(e.target.value)}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => handleAdjustBalance('add')}
                          className="py-2.5 bg-emerald-500 text-white text-[10px] font-black uppercase rounded-xl hover:bg-emerald-600 transition"
                        >
                          Add
                        </button>
                        <button 
                          onClick={() => handleAdjustBalance('subtract')}
                          className="py-2.5 bg-rose-500 text-white text-[10px] font-black uppercase rounded-xl hover:bg-rose-600 transition"
                        >
                          Deduct
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Academic Identity</h4>
                  <div className="grid grid-cols-1 gap-4">
                    {[
                      { label: 'College', value: selectedUser.college },
                      { label: 'Reg. No', value: selectedUser.registrationNumber },
                      { label: 'Branch', value: selectedUser.branch },
                      { label: 'Section/Year', value: `${selectedUser.section || 'N/A'} - Year ${selectedUser.year || 'N/A'}` },
                      { label: 'Phone', value: selectedUser.phoneNumber },
                    ].map(item => (
                      <div key={item.label} className="bg-white px-5 py-3 rounded-2xl border border-gray-100">
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{item.label}</p>
                        <p className="text-xs font-bold text-gray-700 truncate">{item.value || 'N/A'}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Main Area - Logs */}
              <div className="flex-grow p-8 space-y-10 overflow-y-auto">
                <section className="space-y-4">
                  <h4 className="font-black text-gray-900 tracking-tight flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3-3v8a3 3 0 003 3z" />
                    </svg>
                    Recent Transactions
                  </h4>
                  <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
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
                          <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-400 italic">No transactions found.</td></tr>
                        ) : (
                          transactions.filter(tx => tx.userId === selectedUser.id)
                            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                            .map(tx => {
                              const style = getTxTypeStyles(tx.type);
                              return (
                                <tr key={tx.id} className="hover:bg-gray-50/50">
                                  <td className="px-6 py-4 text-[11px] text-gray-500 whitespace-nowrap">{new Date(tx.timestamp).toLocaleDateString()}</td>
                                  <td className="px-6 py-4">
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${style.bg} ${style.text}`}>
                                      {tx.type}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-gray-700 font-medium truncate max-w-[200px]">{tx.description}</td>
                                  <td className="px-6 py-4 text-right font-black text-gray-900">₹{tx.amount.toFixed(2)}</td>
                                </tr>
                              );
                            })
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="space-y-4">
                  <h4 className="font-black text-gray-900 tracking-tight flex items-center gap-2">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Campus Logistics History
                  </h4>
                  <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                          <th className="px-6 py-4">Order ID</th>
                          <th className="px-6 py-4">Role</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {requests.filter(r => r.hostelerId === selectedUser.id || r.campusHelperId === selectedUser.id).length === 0 ? (
                          <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-400 italic">No orders found.</td></tr>
                        ) : (
                          requests.filter(r => r.hostelerId === selectedUser.id || r.campusHelperId === selectedUser.id)
                            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                            .map(req => {
                              const isHosteler = req.hostelerId === selectedUser.id;
                              return (
                                <tr key={req.id} className="hover:bg-gray-50/50">
                                  <td className="px-6 py-4 font-mono text-[10px] text-gray-400 whitespace-nowrap">#{req.id}</td>
                                  <td className="px-6 py-4">
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${isHosteler ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                      {isHosteler ? 'Requested' : 'Fulfilled'}
                                    </span>
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
                </section>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-8 border-t bg-gray-50/50 flex justify-end gap-3">
               <button 
                 onClick={() => setSelectedUser(null)}
                 className="px-8 py-3 bg-indigo-900 text-white font-black rounded-2xl hover:bg-indigo-800 transition shadow-xl shadow-indigo-100"
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
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Platform Command Center</h2>
          <p className="text-gray-500 font-medium">Monitor campus logistics and manage verified identities</p>
        </div>
        <div className="flex gap-2 bg-gray-100 p-1.5 rounded-2xl shadow-inner">
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
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[8px] flex items-center justify-center rounded-full animate-pulse">
                {stats.disputed}
              </span>
            )}
          </button>
          <button 
            onClick={() => setTab('users')} 
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition ${tab === 'users' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'}`}
          >
            Users Directory
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-indigo-900 p-8 rounded-[2rem] text-white shadow-2xl shadow-indigo-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
          <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1 relative z-10">Total Platform Rev</p>
          <p className="text-4xl font-black relative z-10 tracking-tighter">₹{stats.revenue.toFixed(2)}</p>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Active Jobs</p>
          <p className="text-4xl font-black text-indigo-900 tracking-tighter">{stats.active}</p>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Network Users</p>
          <p className="text-4xl font-black text-emerald-600 tracking-tighter">{stats.totalUsers}</p>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Open Disputes</p>
          <p className={`text-4xl font-black tracking-tighter ${stats.disputed > 0 ? 'text-rose-500' : 'text-gray-200'}`}>{stats.disputed}</p>
        </div>
      </div>

      {tab !== 'users' ? (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in duration-500">
          <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
            <h3 className="font-black text-2xl tracking-tight">{tab === 'disputes' ? 'Active Disputes' : 'Order Command Log'}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/80 text-gray-400 text-[9px] font-black uppercase tracking-widest border-b">
                  <th className="px-8 py-5">Order ID</th>
                  <th className="px-8 py-5">Participants</th>
                  <th className="px-8 py-5">Amount</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRequests.length === 0 ? (
                  <tr><td colSpan={5} className="px-8 py-20 text-center text-gray-400 italic">No tickets found in this segment.</td></tr>
                ) : (
                  filteredRequests.map(req => (
                    <tr key={req.id} className="hover:bg-gray-50/30 transition-colors group">
                      <td className="px-8 py-5 font-mono text-[10px] text-gray-400">#{req.id}</td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col gap-1">
                          <p className="text-xs font-bold text-gray-800 tracking-tight">H: {req.hostelerName}</p>
                          <p className="text-[10px] text-indigo-400 font-black uppercase tracking-tighter">S: {req.campusHelperName || 'PENDING'}</p>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-indigo-900 tracking-tighter">₹{req.totalAmount}</span>
                          <span className="text-[9px] text-gray-400 font-bold">Inc. ₹{req.serviceCharge} fee</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${getStatusBadgeStyles(req.status)}`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right flex items-center justify-end gap-2">
                        {req.status === RequestStatus.DISPUTED && (
                          <>
                            <button 
                              onClick={() => handleResolveDispute(req, 'complete')}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition shadow-lg shadow-emerald-100"
                            >
                              Pay Helper
                            </button>
                            <button 
                              onClick={() => handleResolveDispute(req, 'refund')}
                              className="bg-rose-500 hover:bg-rose-600 text-white text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition shadow-lg shadow-rose-100"
                            >
                              Refund Hosteler
                            </button>
                          </>
                        )}
                        <Link 
                          to={`/request/${req.id}`}
                          className="p-3 bg-white border border-gray-100 text-indigo-600 rounded-2xl hover:bg-indigo-50 transition shadow-sm"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in duration-500">
          <div className="p-8 border-b bg-gray-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <h3 className="font-black text-2xl tracking-tight">Identity Directory</h3>
            <div className="relative w-full md:w-96">
              <span className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                className="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-[1.5rem] text-sm font-medium focus:border-indigo-500 outline-none transition shadow-sm"
                placeholder="Search by identity or college email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/80 text-gray-400 text-[9px] font-black uppercase tracking-widest border-b">
                  <th className="px-8 py-5">Full Identity</th>
                  <th className="px-8 py-5">Network Role</th>
                  <th className="px-8 py-5">Wallet Balance</th>
                  <th className="px-8 py-5 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center text-gray-400 italic">
                      No identities matching "{searchTerm}" found in database.
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
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-[1rem] bg-indigo-900 flex items-center justify-center font-black text-white text-sm group-hover:scale-110 transition shadow-lg shadow-indigo-100">
                            {u.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-base font-black text-gray-900 tracking-tight">{u.fullName}</p>
                            <p className="text-[10px] text-gray-400 font-bold font-mono">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          u.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-600' :
                          u.role === UserRole.AGENT ? 'bg-indigo-950 text-indigo-300' :
                          u.role === UserRole.HOSTELER ? 'bg-indigo-50 text-indigo-600' :
                          'bg-emerald-50 text-emerald-600'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <span className="font-black text-indigo-900 tracking-tighter">₹{u.walletBalance.toFixed(2)}</span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex flex-col items-end">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${u.profileComplete ? 'text-emerald-500' : 'text-amber-500'}`}>
                            {u.profileComplete ? 'Verified Profile' : 'Incomplete'}
                          </span>
                          <span className="text-[9px] text-gray-300 font-bold uppercase mt-1">Click to Manage</span>
                        </div>
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
