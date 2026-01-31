
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, NotificationPreferences, Transaction, DeliveryRequest, RequestStatus, UserRole } from '../types';

interface ProfilePageProps {
  user: User;
  transactions: Transaction[];
  requests: DeliveryRequest[];
  onUpdate: (data: Partial<User>) => void;
  onUpdateWallet: (amount: number, type: 'add' | 'withdraw') => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, transactions, requests, onUpdate, onUpdateWallet }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: user.fullName || '',
    phoneNumber: user.phoneNumber || '',
    college: user.college || '',
    registrationNumber: user.registrationNumber || '',
    branch: user.branch || '',
    section: user.section || '',
    year: user.year || ''
  });

  const [notifs, setNotifs] = useState<NotificationPreferences>(user.notificationPreferences || {
    newOrders: true,
    messages: true,
    statusUpdates: true,
    emailAlerts: false
  });

  const [walletAmount, setWalletAmount] = useState<number>(0);
  const [isSaved, setIsSaved] = useState(false);
  const [historyTab, setHistoryTab] = useState<'all' | 'hosteler' | 'scholar'>('all');

  // Filter transactions for this user
  const userTransactions = transactions.filter(tx => tx.userId === user.id);

  // Filter requests for order history
  const sentRequests = requests.filter(r => r.hostelerId === user.id);
  const fulfilledJobs = requests.filter(r => r.dayScholarId === user.id);

  const getFilteredRequests = () => {
    switch (historyTab) {
      case 'hosteler': return sentRequests;
      case 'scholar': return fulfilledJobs;
      default: return [...sentRequests, ...fulfilledJobs];
    }
  };

  const sortedHistory = getFilteredRequests().sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      ...formData,
      notificationPreferences: notifs
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleNotif = (key: keyof NotificationPreferences) => {
    setNotifs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleWalletAction = (type: 'add' | 'withdraw') => {
    if (walletAmount <= 0) return;
    onUpdateWallet(walletAmount, type);
    setWalletAmount(0);
  };

  const getTxTypeStyles = (type: string) => {
    switch(type) {
      case 'deposit': return { bg: 'bg-emerald-50', text: 'text-emerald-700', iconColor: 'text-emerald-500', sign: '+' };
      case 'earning': return { bg: 'bg-indigo-50', text: 'text-indigo-700', iconColor: 'text-indigo-500', sign: '+' };
      case 'withdrawal': return { bg: 'bg-rose-50', text: 'text-rose-700', iconColor: 'text-rose-500', sign: '-' };
      case 'payment': return { bg: 'bg-amber-50', text: 'text-amber-700', iconColor: 'text-amber-500', sign: '-' };
      default: return { bg: 'bg-gray-50', text: 'text-gray-700', iconColor: 'text-gray-500', sign: '' };
    }
  };

  const getStatusBadgeStyles = (status: RequestStatus) => {
    switch(status) {
      case RequestStatus.COMPLETED: return 'bg-emerald-100 text-emerald-700';
      case RequestStatus.CANCELLED: return 'bg-gray-100 text-gray-500';
      case RequestStatus.DISPUTED: return 'bg-red-100 text-red-700';
      case RequestStatus.OPEN: return 'bg-indigo-100 text-indigo-700';
      default: return 'bg-amber-100 text-amber-700';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 px-4 sm:px-0">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 font-medium transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </button>
        <h2 className="text-2xl font-extrabold text-gray-900">Account Settings</h2>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Wallet & Notifications */}
        <div className="lg:col-span-1 space-y-6">
          {/* Wallet Card */}
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden group">
            <div className="bg-indigo-600 p-8 text-white relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
              <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-1 relative z-10">Current Balance</p>
              <h3 className="text-4xl font-black relative z-10">₹{user.walletBalance.toFixed(2)}</h3>
            </div>
            
            <div className="p-8 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Quick Top-up / Withdrawal</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">₹</span>
                  <input 
                    type="number"
                    value={walletAmount || ''}
                    onChange={(e) => setWalletAmount(parseFloat(e.target.value) || 0)}
                    className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:border-indigo-500 transition text-gray-700 font-bold"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => handleWalletAction('add')}
                  className="bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 transition active:scale-95 shadow-lg shadow-indigo-100"
                >
                  Deposit
                </button>
                <button 
                  onClick={() => handleWalletAction('withdraw')}
                  className="bg-white text-gray-700 font-bold py-3.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition active:scale-95"
                >
                  Withdraw
                </button>
              </div>
            </div>
          </div>

          {/* Transaction History Card */}
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b bg-gray-50/50 flex justify-between items-center">
              <h4 className="font-bold text-gray-800">Recent Transactions</h4>
              <span className="text-[10px] font-bold text-gray-400 uppercase">{userTransactions.length} Total</span>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {userTransactions.length === 0 ? (
                <div className="p-10 text-center text-gray-400 text-sm italic">
                  No transaction history yet.
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {userTransactions.map(tx => {
                    const style = getTxTypeStyles(tx.type);
                    return (
                      <div key={tx.id} className="p-4 hover:bg-gray-50/50 transition-colors flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full ${style.bg} flex items-center justify-center flex-shrink-0`}>
                          <svg className={`w-5 h-5 ${style.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {tx.type === 'deposit' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />}
                            {tx.type === 'withdrawal' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />}
                            {tx.type === 'earning' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
                            {tx.type === 'payment' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />}
                          </svg>
                        </div>
                        <div className="flex-grow min-w-0">
                          <p className="text-xs font-bold text-gray-800 truncate">{tx.description}</p>
                          <p className="text-[10px] text-gray-400">{new Date(tx.timestamp).toLocaleDateString()} • {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <div className={`text-right font-black text-sm ${style.text}`}>
                          {style.sign}₹{tx.amount.toFixed(2)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Profile Form & Order History */}
        <div className="lg:col-span-2 space-y-8">
          {/* Profile Form Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 border-b flex items-center gap-6 bg-gray-50/50">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl font-bold">
                {user.fullName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-gray-900">{user.fullName}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${user.role === UserRole.HOSTELER ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    {user.role}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {isSaved && (
                <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl border border-emerald-100 flex items-center gap-3 animate-bounce">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-bold">Account and notification changes saved!</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">Full Name</label>
                  <input 
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none transition"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">Phone Number</label>
                  <input 
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none transition"
                    placeholder="+91 XXXXX XXXXX"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">College Name</label>
                  <input 
                    type="text"
                    name="college"
                    value={formData.college}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none transition"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">Registration Number</label>
                  <input 
                    type="text"
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none transition font-mono"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">Branch</label>
                  <input 
                    type="text"
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none transition"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">Section</label>
                  <input 
                    type="text"
                    name="section"
                    value={formData.section}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none transition"
                    required
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 flex justify-end">
                <button 
                  type="submit"
                  className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition active:scale-95"
                >
                  Save All Changes
                </button>
              </div>
            </form>
          </div>

          {/* Categorized Order History Section */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 border-b bg-gray-50/50">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                  <h3 className="font-bold text-xl">Order History</h3>
                  <p className="text-xs text-gray-500">Record of your campus delivery interactions</p>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-xl">
                  <button 
                    onClick={() => setHistoryTab('all')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition ${historyTab === 'all' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'}`}
                  >
                    All
                  </button>
                  <button 
                    onClick={() => setHistoryTab('hosteler')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition ${historyTab === 'hosteler' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'}`}
                  >
                    Requests ({sentRequests.length})
                  </button>
                  <button 
                    onClick={() => setHistoryTab('scholar')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition ${historyTab === 'scholar' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'}`}
                  >
                    Jobs ({fulfilledJobs.length})
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              {sortedHistory.length === 0 ? (
                <div className="p-16 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-gray-400 font-medium italic">No orders found in this category.</p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/80 text-gray-400 text-[9px] font-black uppercase tracking-widest border-b">
                      <th className="px-8 py-5">Date & ID</th>
                      <th className="px-8 py-5">Role</th>
                      <th className="px-8 py-5">Items</th>
                      <th className="px-8 py-5 text-right">Amount</th>
                      <th className="px-8 py-5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {sortedHistory.map(req => {
                      const isHosteler = req.hostelerId === user.id;
                      return (
                        <tr 
                          key={req.id} 
                          className="hover:bg-indigo-50/30 transition-colors group cursor-pointer" 
                          onClick={() => navigate(`/request/${req.id}`)}
                        >
                          <td className="px-8 py-5">
                            <div>
                              <p className="text-xs font-bold text-gray-800">{new Date(req.createdAt).toLocaleDateString()}</p>
                              <p className="text-[10px] text-gray-400 font-mono">#{req.id}</p>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${isHosteler ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                              {isHosteler ? 'Hosteler' : 'Scholar'}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <p className="text-xs text-gray-700 truncate max-w-[150px] font-medium">
                              {req.items[0]?.name}{req.items.length > 1 ? ` +${req.items.length - 1}` : ''}
                            </p>
                          </td>
                          <td className="px-8 py-5 text-right font-black text-sm text-gray-800">₹{req.totalAmount}</td>
                          <td className="px-8 py-5 text-center">
                            <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter shadow-sm ${getStatusBadgeStyles(req.status)}`}>
                              {req.status.replace('_', ' ')}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
