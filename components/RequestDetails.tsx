
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, DeliveryRequest, RequestStatus, UserRole, ChatMessage } from '../types';
import ChatComponent from './ChatComponent';

interface RequestDetailsProps {
  user: User;
  allUsers: User[];
  requests: DeliveryRequest[];
  messages: ChatMessage[];
  onUpdateRequest: (req: DeliveryRequest) => void;
  onSendMessage: (msg: ChatMessage) => void;
}

const RequestDetails: React.FC<RequestDetailsProps> = ({ user, allUsers, requests, messages, onUpdateRequest, onSendMessage }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const request = requests.find(r => r.id === id);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [error, setError] = useState('');

  if (!request) return <div className="text-center py-20">Request not found</div>;

  const handleStatusChange = (newStatus: RequestStatus) => {
    onUpdateRequest({ ...request, status: newStatus });
  };

  const verifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredOtp === request.otp) {
      handleStatusChange(RequestStatus.COMPLETED);
      setEnteredOtp('');
      setError('');
    } else {
      setError('Invalid OTP. Please check with the hosteler.');
    }
  };

  const isInvolved = user.id === request.hostelerId || user.id === request.dayScholarId || user.role === UserRole.ADMIN;
  const showChat = isInvolved && request.status !== RequestStatus.OPEN;

  // Find users for phone numbers
  const hostelerUser = allUsers.find(u => u.id === request.hostelerId);
  const dayScholarUser = allUsers.find(u => u.id === request.dayScholarId);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <button 
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 font-medium mb-4 transition"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Back to Dashboard
      </button>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm">
            <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
              <div>
                <h2 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">Order Details</h2>
                <div className="flex items-center gap-2 text-gray-500">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    request.status === RequestStatus.COMPLETED ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-50 text-indigo-700'
                  }`}>
                    {request.status.replace('_', ' ')}
                  </span>
                  <span className="font-mono text-xs">ID: {request.id}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-indigo-600 block">₹{request.totalAmount}</span>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Escrow Hold</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Item Name</th>
                      <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Qty</th>
                      <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Est. Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {request.items.map((itm, i) => (
                      <tr key={i} className="hover:bg-gray-50/30 transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-gray-700">{itm.name}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-500">{itm.quantity}</td>
                        <td className="px-6 py-4 text-sm font-black text-gray-900 text-right">₹{itm.estimatedPrice * itm.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Delivery Instructions</h4>
                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-sm text-gray-600 leading-relaxed font-medium">{request.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Base Total</p>
                   <p className="text-sm font-black text-gray-900">₹{request.baseAmount}</p>
                 </div>
                 <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">UNEEDS Fee</p>
                   <p className="text-sm font-black text-gray-900">₹{request.serviceCharge}</p>
                 </div>
                 <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Scholar Tip</p>
                   <p className="text-sm font-black text-indigo-600">₹{request.tip}</p>
                 </div>
                 <div className="p-4 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100">
                   <p className="text-[9px] font-black text-indigo-200 uppercase tracking-widest mb-1">Grand Total</p>
                   <p className="text-sm font-black text-white">₹{request.totalAmount}</p>
                 </div>
              </div>
            </div>
          </div>

          {showChat && (
            <ChatComponent 
              user={user} 
              requestId={request.id} 
              otp={request.otp} // Passing OTP as session salt
              messages={messages} 
              onSendMessage={onSendMessage} 
            />
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Contact Directory</h3>
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center font-black text-indigo-600 text-lg">
                  {request.hostelerName.charAt(0)}
                </div>
                <div className="flex-grow">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-black text-gray-800">{request.hostelerName}</p>
                    <span className="text-[8px] font-black uppercase text-indigo-400 bg-indigo-50 px-1.5 py-0.5 rounded">Hosteler</span>
                  </div>
                  {(request.status !== RequestStatus.OPEN && isInvolved) && (
                    <p className="text-xs font-bold text-gray-500 mt-0.5">{hostelerUser?.phoneNumber || '+91 XXXXX XXXXX'}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {request.dayScholarName ? (
                  <>
                    <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center font-black text-emerald-600 text-lg">
                      {request.dayScholarName.charAt(0)}
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-black text-gray-800">{request.dayScholarName}</p>
                        <span className="text-[8px] font-black uppercase text-emerald-400 bg-emerald-50 px-1.5 py-0.5 rounded">Scholar</span>
                      </div>
                      {isInvolved && (
                        <p className="text-xs font-bold text-gray-500 mt-0.5">{dayScholarUser?.phoneNumber || '+91 XXXXX XXXXX'}</p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-4 w-full">
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center font-black text-gray-300">?</div>
                    <p className="text-xs font-bold text-gray-400 italic">Waiting for connection...</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {user.role === UserRole.HOSTELER && request.status !== RequestStatus.COMPLETED && (
            <div className="bg-indigo-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700"></div>
              <h3 className="text-lg font-black mb-1 tracking-tight">Delivery Verification</h3>
              <p className="text-indigo-300 text-[10px] font-bold uppercase tracking-widest mb-6">Security OTP Protocol</p>
              
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl py-10 text-center border border-white/10">
                <span className="text-5xl font-mono font-black tracking-[0.4em] pl-[0.4em]">{request.otp}</span>
              </div>
              <p className="text-[9px] text-indigo-400 mt-6 text-center font-black uppercase tracking-widest leading-relaxed">
                Release this code only after verifying <br/> the item's condition and quantity.
              </p>
            </div>
          )}

          {user.role === UserRole.DAY_SCHOLAR && request.status === RequestStatus.ACCEPTED && (
             <button 
              onClick={() => handleStatusChange(RequestStatus.DELIVERED)}
              className="w-full py-5 bg-indigo-900 text-white rounded-[2rem] font-black text-lg hover:bg-indigo-800 transition shadow-xl shadow-indigo-100 active:scale-95"
            >
              Confirm Pick-up & Arrived
            </button>
          )}

          {user.role === UserRole.DAY_SCHOLAR && request.status === RequestStatus.DELIVERED && (
            <div className="bg-white rounded-[2.5rem] p-8 border-2 border-indigo-600 shadow-xl">
              <h3 className="text-xl font-black mb-2 tracking-tight">Handover Complete</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-6">Enter Hosteler's OTP</p>
              <form onSubmit={verifyOtp} className="space-y-6">
                <input 
                  type="text" maxLength={4}
                  className="w-full px-5 py-5 rounded-2xl bg-gray-50 border border-transparent outline-none focus:bg-white focus:border-indigo-600 text-center text-4xl font-mono font-black"
                  value={enteredOtp}
                  onChange={e => setEnteredOtp(e.target.value)}
                  placeholder="0000"
                />
                {error && <p className="text-red-500 text-[10px] font-black uppercase text-center">{error}</p>}
                <button type="submit" className="w-full py-5 bg-emerald-500 text-white rounded-[2rem] font-black text-lg hover:bg-emerald-600 transition shadow-xl shadow-emerald-100 active:scale-95">
                  Authorize Release
                </button>
              </form>
            </div>
          )}

          <div className="p-6 bg-rose-50 rounded-[2rem] border border-rose-100 flex flex-col gap-3">
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-rose-200 rounded-xl flex items-center justify-center text-rose-600">
                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
               </div>
               <h4 className="text-rose-900 font-black text-xs uppercase tracking-widest">Help & Mediation</h4>
             </div>
             <p className="text-rose-700 text-[10px] font-medium leading-relaxed">
               Facing misbehavior, wrong items, or pricing disputes? Raising a dispute alerts our 24/7 admin team.
             </p>
             <button 
               onClick={() => handleStatusChange(RequestStatus.DISPUTED)}
               className="text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:underline self-start"
             >
               Raise Official Dispute
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetails;
