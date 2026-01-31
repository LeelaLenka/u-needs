
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Transaction, DeliveryRequest, UserRole } from '../types';

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

  const [walletAmount, setWalletAmount] = useState<number>(0);
  const [isSaved, setIsSaved] = useState(false);

  const isAgent = user.role === UserRole.AGENT;
  const isHelper = user.role === UserRole.CAMPUS_HELPER;
  const isHosteler = user.role === UserRole.HOSTELER;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const userTransactions = transactions.filter(tx => tx.userId === user.id);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 px-4">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 font-black text-xs uppercase tracking-widest transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Return to Dashboard
        </button>
        <div className="text-right">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Identity Management</h2>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{user.role} Profile</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          {/* Financial Overview - Only for Hostelers and Helpers */}
          {!isAgent && (
            <div className="bg-indigo-900 rounded-[2.5rem] text-white p-10 shadow-2xl shadow-indigo-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
              <div className="relative z-10">
                <p className="text-indigo-300 text-[10px] font-black uppercase tracking-widest mb-2">Available Wallet Balance</p>
                <h3 className="text-5xl font-black mb-8 tracking-tighter">₹{user.walletBalance.toFixed(2)}</h3>
                
                <div className="space-y-4">
                  {isHelper && (
                    <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
                      <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-1">Total Lifetime Appreciation</p>
                      <p className="text-xl font-black">₹{(user.totalAppreciation || 0).toFixed(2)}</p>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t border-white/10">
                    <input 
                      type="number" 
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 outline-none text-white font-bold mb-3 placeholder:text-indigo-300"
                      placeholder="Enter Amount"
                      value={walletAmount || ''}
                      onChange={e => setWalletAmount(parseFloat(e.target.value) || 0)}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => {onUpdateWallet(walletAmount, 'add'); setWalletAmount(0);}} className="bg-emerald-500 text-white font-black py-3 rounded-xl text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition shadow-lg shadow-emerald-900/20">Add Funds</button>
                      <button onClick={() => {onUpdateWallet(walletAmount, 'withdraw'); setWalletAmount(0);}} className="bg-white text-indigo-900 font-black py-3 rounded-xl text-[10px] uppercase tracking-widest hover:bg-gray-100 transition shadow-lg shadow-black/10">Withdraw</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm flex flex-col items-center text-center">
             <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
               <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
             </div>
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Campus Assistance</p>
             <p className="text-indigo-900 font-black text-lg leading-tight">1800-UNEEDS-HELP</p>
             <p className="text-[9px] text-gray-400 mt-2 font-bold uppercase tracking-widest leading-relaxed">24/7 Peer Support Network</p>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          {/* Identity Form */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black tracking-tight">Personal Information</h3>
              {isSaved && <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest animate-bounce">Profile Updated</span>}
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {[
                 { id: 'fullName', label: 'Registered Full Name' },
                 { id: 'phoneNumber', label: 'Mobile Contact' },
                 { id: 'college', label: 'Institution' },
                 { id: 'registrationNumber', label: 'Roll / Reg Number' },
                 { id: 'branch', label: 'Academic Branch' },
                 { id: 'section', label: 'Section' },
                 { id: 'year', label: 'Year of Study' }
               ].map(field => (
                 <div key={field.id} className="space-y-1">
                   <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{field.label}</label>
                   <input 
                    name={field.id}
                    type="text" 
                    value={(formData as any)[field.id]}
                    onChange={handleChange}
                    placeholder={`Enter ${field.label}`}
                    className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-600 outline-none transition text-gray-800 font-bold" 
                   />
                 </div>
               ))}
               <div className="md:col-span-2 pt-6">
                 <button type="submit" className="w-full py-5 bg-indigo-900 text-white rounded-2xl font-black text-lg hover:bg-indigo-800 transition active:scale-95 shadow-xl shadow-indigo-100">
                   Save Identity Changes
                 </button>
               </div>
            </form>
          </div>

          {/* Transaction History - Hidden for Agents */}
          {!isAgent && userTransactions.length > 0 && (
            <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
              <div className="p-8 border-b bg-gray-50/30">
                <h3 className="text-xl font-black tracking-tight">Network Activity Log</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50/50">
                    <tr className="text-[9px] font-black text-gray-400 uppercase tracking-widest border-b">
                      <th className="px-8 py-4">Transaction Date</th>
                      <th className="px-8 py-4">Event Description</th>
                      <th className="px-8 py-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {userTransactions.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(tx => (
                      <tr key={tx.id} className="hover:bg-gray-50/30 transition-colors">
                        <td className="px-8 py-4 text-xs text-gray-400 font-medium">{new Date(tx.timestamp).toLocaleString()}</td>
                        <td className="px-8 py-4 text-sm font-bold text-gray-700">{tx.description}</td>
                        <td className={`px-8 py-4 text-right font-black ${
                          tx.type === 'deposit' || tx.type === 'appreciation' || tx.type === 'refund' ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {tx.type === 'deposit' || tx.type === 'appreciation' || tx.type === 'refund' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
