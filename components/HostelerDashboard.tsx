
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
          <h2 className="text-3xl font-extrabold text-gray-900">Hosteler Dashboard</h2>
          <p className="text-gray-500">Manage your campus requests</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white border px-4 py-2 rounded-xl text-sm font-bold">
            <span className="text-gray-400 mr-2">Wallet:</span>
            <span className="text-indigo-600">₹{user.walletBalance.toFixed(2)}</span>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            Raise New Ticket
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm font-semibold text-gray-500 mb-1">Active Requests</p>
          <p className="text-2xl font-bold text-indigo-600">{myRequests.filter(r => r.status !== RequestStatus.COMPLETED).length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm font-semibold text-gray-500 mb-1">Total Spent</p>
          <p className="text-2xl font-bold text-gray-900">₹{myRequests.reduce((sum, r) => sum + r.totalAmount, 0)}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm font-semibold text-gray-500 mb-1">In Escrow</p>
          <p className="text-2xl font-bold text-amber-600">₹{myRequests.filter(r => r.status !== RequestStatus.COMPLETED && r.status !== RequestStatus.CANCELLED).reduce((sum, r) => sum + r.totalAmount, 0)}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b bg-gray-50/50">
          <h3 className="font-bold text-xl">My Requests</h3>
        </div>
        <div className="p-6">
          {myRequests.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 font-medium italic">You haven't raised any tickets yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myRequests.map(req => (
                <RequestCard key={req.id} request={req} role={user.role} />
              ))}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl my-auto">
            <div className="p-6 border-b flex justify-between items-center bg-indigo-600 text-white rounded-t-3xl sticky top-0">
              <h3 className="text-xl font-bold">Raise New Delivery Ticket</h3>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-indigo-500 p-2 rounded-lg transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Number of unique items?</label>
                <input 
                  type="number" 
                  min="1" max="10"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-indigo-500 transition"
                  value={numItems}
                  onChange={e => handleNumItemsChange(parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-4">
                {itemsList.map((itm, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-1">
                      <label className="block text-xs font-bold text-gray-500 mb-1">Item {idx + 1}</label>
                      <input 
                        required type="text" placeholder="Item Name"
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                        value={itm.name}
                        onChange={e => updateItem(idx, 'name', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Qty</label>
                      <input 
                        required type="number" min="1"
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                        value={itm.quantity}
                        onChange={e => updateItem(idx, 'quantity', parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Est. Price/Unit</label>
                      <input 
                        required type="number" min="0"
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                        value={itm.estimatedPrice}
                        onChange={e => updateItem(idx, 'estimatedPrice', parseFloat(e.target.value))}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tip for Day Scholar (₹)</label>
                <input 
                  type="number" 
                  min="0"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-indigo-500"
                  value={tip}
                  onChange={e => setTip(parseFloat(e.target.value) || 0)}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Instructions / Notes</label>
                <textarea 
                  rows={2}
                  placeholder="Extra info for the day scholar..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-indigo-500"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>

              <div className="bg-indigo-50 p-6 rounded-2xl space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Items Total</span>
                  <span className="font-bold">₹{baseAmount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Platform Fee (10%)</span>
                  <span>₹{serviceCharge}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tip</span>
                  <span>₹{tip}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-indigo-100">
                  <span>Total Amount</span>
                  <span className="font-bold text-indigo-900 text-lg">₹{totalAmount}</span>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition"
              >
                Confirm & Pay (₹{totalAmount})
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HostelerDashboard;
