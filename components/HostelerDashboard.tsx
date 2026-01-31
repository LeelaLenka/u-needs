
import React, { useState } from 'react';
import { User, DeliveryRequest, RequestStatus, ItemEntry } from '../types';
import RequestCard from './RequestCard';
import ProfileSetup from './ProfileSetup';

interface HostelerDashboardProps {
  user: User;
  requests: DeliveryRequest[];
  onAddRequest: (req: DeliveryRequest) => boolean;
  onUpdateProfile: (data: Partial<User>) => void;
}

const HostelerDashboard: React.FC<HostelerDashboardProps> = ({ user, requests, onAddRequest, onUpdateProfile }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [numItems, setNumItems] = useState<number>(1);
  const [itemsList, setItemsList] = useState<ItemEntry[]>([{ name: '', quantity: 1, estimatedPrice: 0 }]);
  const [description, setDescription] = useState('');
  const [tip, setTip] = useState<number>(0);
  const [error, setError] = useState('');

  if (!user.profileComplete) {
    return <ProfileSetup user={user} onComplete={onUpdateProfile} />;
  }

  const myRequests = requests.filter(r => r.hostelerId === user.id);
  const baseAmount = itemsList.reduce((sum, itm) => sum + (itm.estimatedPrice * itm.quantity), 0);
  const serviceCharge = Math.ceil(baseAmount * 0.1);
  const totalAmount = baseAmount + serviceCharge + tip;

  const handleNumItemsChange = (n: number) => {
    const val = Math.max(1, Math.min(10, n));
    setNumItems(val);
    const newList = [...itemsList];
    if (val > newList.length) {
      for (let i = newList.length; i < val; i++) {
        newList.push({ name: '', quantity: 1, estimatedPrice: 0 });
      }
    } else {
      newList.splice(val);
    }
    setItemsList(newList);
  };

  const updateItem = (index: number, field: keyof ItemEntry, value: any) => {
    const newList = [...itemsList];
    newList[index] = { ...newList[index], [field]: value };
    setItemsList(newList);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (user.walletBalance < totalAmount) {
      setError(`Insufficient balance. Please add at least ₹${(totalAmount - user.walletBalance).toFixed(2)} to your wallet.`);
      return;
    }

    const newRequest: DeliveryRequest = {
      id: 'req-' + Math.random().toString(36).substr(2, 9),
      hostelerId: user.id,
      hostelerName: user.fullName,
      items: itemsList,
      description,
      baseAmount,
      serviceCharge,
      tip,
      totalAmount,
      status: RequestStatus.OPEN,
      otp: Math.floor(1000 + Math.random() * 9000).toString(),
      createdAt: new Date().toISOString(),
      location: { lat: 17.4483, lng: 78.3915, address: 'Hostel A, Main Gate' } 
    };
    
    const success = onAddRequest(newRequest);
    if (success) {
      setIsModalOpen(false);
      resetForm();
    } else {
      setError('Transaction failed. Please try again.');
    }
  };

  const resetForm = () => {
    setNumItems(1);
    setItemsList([{ name: '', quantity: 1, estimatedPrice: 0 }]);
    setDescription('');
    setTip(0);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Hosteler Dashboard</h2>
          <p className="text-gray-500 font-medium">Manage your campus requests on UNEEDS</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white border-2 border-indigo-50 px-5 py-2.5 rounded-2xl text-sm font-black shadow-sm">
            <span className="text-gray-400 mr-2 uppercase tracking-tighter">Wallet:</span>
            <span className="text-indigo-900">₹{user.walletBalance.toFixed(2)}</span>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-900 text-white px-8 py-3.5 rounded-2xl font-black flex items-center gap-2 hover:bg-indigo-800 transition shadow-xl shadow-indigo-100 active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            Raise New Ticket
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2rem] border border-gray-50 shadow-sm group">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Active Requests</p>
          <p className="text-4xl font-black text-indigo-900 tracking-tighter">{myRequests.filter(r => r.status !== RequestStatus.COMPLETED).length}</p>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-gray-50 shadow-sm group">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Total Spent</p>
          <p className="text-4xl font-black text-gray-900 tracking-tighter">₹{myRequests.reduce((sum, r) => sum + r.totalAmount, 0)}</p>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-gray-50 shadow-sm group">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">In Escrow</p>
          <p className="text-4xl font-black text-orange-500 tracking-tighter">₹{myRequests.filter(r => r.status !== RequestStatus.COMPLETED && r.status !== RequestStatus.CANCELLED).reduce((sum, r) => sum + r.totalAmount, 0)}</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-50 shadow-sm overflow-hidden">
        <div className="p-8 border-b bg-gray-50/50">
          <h3 className="font-black text-2xl tracking-tight">My Active Logistics</h3>
        </div>
        <div className="p-8">
          {myRequests.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                 <svg className="w-8 h-8 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              </div>
              <p className="text-gray-400 font-bold italic">You haven't raised any delivery tickets yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myRequests.map(req => (
                <RequestCard key={req.id} request={req} role={user.role} />
              ))}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl my-auto animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b flex justify-between items-center bg-indigo-900 text-white rounded-t-[2.5rem] sticky top-0">
              <h3 className="text-2xl font-black tracking-tight">New Delivery Ticket</h3>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/10 p-3 rounded-2xl transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-8 max-h-[70vh] overflow-y-auto">
              {error && (
                <div className="bg-red-50 text-red-600 p-5 rounded-2xl text-xs font-black border border-red-100 uppercase tracking-widest">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Unique items count?</label>
                <input 
                  type="number" 
                  min="1" max="10"
                  className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-uneeds-u outline-none transition text-gray-600 font-medium"
                  value={numItems}
                  onChange={e => handleNumItemsChange(parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-4">
                {itemsList.map((itm, idx) => (
                  <div key={idx} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1 space-y-1">
                      <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest">Item {idx + 1}</label>
                      <input 
                        required type="text" placeholder="Item Name"
                        className="w-full px-4 py-2.5 rounded-xl border border-transparent focus:border-uneeds-u bg-white text-sm font-medium outline-none transition"
                        value={itm.name}
                        onChange={e => updateItem(idx, 'name', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest">Qty</label>
                      <input 
                        required type="number" min="1"
                        className="w-full px-4 py-2.5 rounded-xl border border-transparent focus:border-uneeds-u bg-white text-sm font-medium outline-none transition"
                        value={itm.quantity}
                        onChange={e => updateItem(idx, 'quantity', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest">Est. Price</label>
                      <input 
                        required type="number" min="0"
                        className="w-full px-4 py-2.5 rounded-xl border border-transparent focus:border-uneeds-u bg-white text-sm font-medium outline-none transition"
                        value={itm.estimatedPrice}
                        onChange={e => updateItem(idx, 'estimatedPrice', parseFloat(e.target.value))}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Delivery Tip (₹)</label>
                <input 
                  type="number" 
                  min="0"
                  className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-uneeds-u outline-none transition text-gray-600 font-medium"
                  value={tip}
                  onChange={e => setTip(parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Instructions</label>
                <textarea 
                  rows={2}
                  placeholder="Mention delivery specifics or landmark..."
                  className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-uneeds-u outline-none transition text-gray-600 font-medium"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>

              <div className="bg-indigo-50/50 p-8 rounded-[2rem] border border-indigo-100 space-y-4">
                <div className="flex justify-between text-sm font-bold text-indigo-900">
                  <span className="opacity-60">Estimated Base Cost</span>
                  <span>₹{baseAmount}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-indigo-900">
                  <span className="opacity-60">Service Charge (10%)</span>
                  <span>₹{serviceCharge}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-indigo-900">
                  <span className="opacity-60">Incentive Tip</span>
                  <span>₹{tip}</span>
                </div>
                <div className="flex justify-between text-xl font-black text-indigo-900 pt-4 border-t border-indigo-200">
                  <span>Grand Total</span>
                  <span>₹{totalAmount}</span>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-5 bg-indigo-900 text-white rounded-2xl font-black text-lg hover:bg-indigo-800 transition shadow-2xl shadow-indigo-100 active:scale-95"
              >
                Release to Escrow (₹{totalAmount})
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HostelerDashboard;
