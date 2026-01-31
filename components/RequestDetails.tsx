
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
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [rating, setRating] = useState(0);

  if (!request) return <div className="text-center py-20">Request not found</div>;

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput === request.otp) {
      onUpdateRequest({ ...request, status: RequestStatus.COMPLETED });
      setOtpError(false);
    } else {
      setOtpError(true);
      setTimeout(() => setOtpError(false), 2000);
    }
  };

  const handleStatusChange = (newStatus: RequestStatus) => {
    onUpdateRequest({ ...request, status: newStatus });
  };

  const handleRate = (r: number) => {
    setRating(r);
    onUpdateRequest({ ...request, rating: r });
  };

  const isHelper = user.id === request.campusHelperId;
  const isHosteler = user.id === request.hostelerId;
  const isAgentOrAdmin = user.role === UserRole.AGENT || user.role === UserRole.ADMIN;
  const isInvolved = isHosteler || isHelper || isAgentOrAdmin;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 px-4">
      <div className="flex justify-between items-center mb-8">
        <button onClick={() => navigate('/dashboard')} className="text-gray-400 font-black text-[10px] uppercase tracking-widest hover:text-indigo-600 transition">Back to Command Center</button>
        <div className="flex items-center gap-2 text-rose-600 bg-rose-50 px-4 py-2 rounded-xl border border-rose-100">
           <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
           <span className="text-[10px] font-black uppercase tracking-widest">Support: 1800-UNEEDS</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Main Logistics Ticket Card */}
          <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div>
                <h2 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">Logistic Ticket</h2>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    request.status === RequestStatus.COMPLETED ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-50 text-indigo-700'
                  }`}>
                    {request.status.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">ID: {request.id}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-indigo-600">₹{request.totalAmount}</span>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Escrow Payment Locked</p>
              </div>
            </div>

            <div className="space-y-8 relative z-10">
              <div className="border border-gray-100 rounded-3xl overflow-hidden bg-gray-50/50">
                <table className="w-full text-left">
                  <thead className="bg-gray-100/50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Item</th>
                      <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Qty</th>
                      <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {request.items.map((itm, i) => (
                      <tr key={i} className="hover:bg-white transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-gray-700">{itm.name}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-500">{itm.quantity}</td>
                        <td className="px-6 py-4 text-sm font-black text-gray-900 text-right">₹{itm.estimatedPrice * itm.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {request.status !== RequestStatus.COMPLETED && request.status !== RequestStatus.CANCELLED && (
                <div className="flex flex-wrap gap-2 pt-4">
                  {isHelper && request.status === RequestStatus.ACCEPTED && (
                    <button onClick={() => handleStatusChange(RequestStatus.PICKED_UP)} className="px-6 py-3 bg-indigo-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-800 transition shadow-lg shadow-indigo-100">Pick Up Items</button>
                  )}
                  {isHelper && request.status === RequestStatus.PICKED_UP && (
                    <button onClick={() => handleStatusChange(RequestStatus.DELIVERED)} className="px-6 py-3 bg-indigo-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-800 transition shadow-lg shadow-indigo-100">Mark as Arrived</button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Chat Component */}
          {isInvolved && request.status !== RequestStatus.OPEN && (
            <ChatComponent 
              user={user} 
              requestId={request.id} 
              otp={request.otp} 
              messages={messages} 
              onSendMessage={onSendMessage} 
            />
          )}
        </div>

        <div className="space-y-6">
          {/* Completion OTP Field for Campus Helper */}
          {isHelper && (request.status === RequestStatus.DELIVERED || request.status === RequestStatus.PICKED_UP) && (
            <div className="bg-emerald-50 rounded-[2.5rem] p-8 border-2 border-emerald-500 shadow-xl shadow-emerald-100 animate-in zoom-in-95 duration-500">
              <h3 className="text-xl font-black text-emerald-900 mb-2 tracking-tight">Verify Delivery</h3>
              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mb-6">Enter OTP from User or Agent</p>
              
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <input 
                  type="text" 
                  maxLength={4}
                  placeholder="0000"
                  className={`w-full text-center py-5 rounded-2xl bg-white border-2 font-mono text-3xl font-black tracking-[0.5em] focus:ring-4 transition-all outline-none ${
                    otpError ? 'border-rose-500 ring-rose-50 text-rose-500 animate-shake' : 'border-emerald-100 focus:border-emerald-500 ring-emerald-50 text-emerald-900'
                  }`}
                  value={otpInput}
                  onChange={e => setOtpInput(e.target.value.replace(/\D/g, ''))}
                />
                <button 
                  type="submit"
                  disabled={otpInput.length !== 4}
                  className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition disabled:opacity-20"
                >
                  Verify & Get Paid
                </button>
              </form>
            </div>
          )}

          {/* Network Identities Card */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Network Entities</h3>
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center font-black text-indigo-600">{request.hostelerName[0]}</div>
                <div>
                  <p className="text-sm font-black text-gray-800">{request.hostelerName}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Hosteler</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center font-black text-emerald-600">{request.campusHelperName ? request.campusHelperName[0] : '?'}</div>
                <div>
                  <p className="text-sm font-black text-gray-800">{request.campusHelperName || 'Connecting...'}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Campus Helper</p>
                </div>
              </div>
            </div>
          </div>

          {/* OTP Section for Agent/Hosteler */}
          {(isHosteler || isAgentOrAdmin) && (
            <div className="bg-indigo-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-100">
               <h3 className="text-lg font-black mb-1 tracking-tight">Security Handshake</h3>
               <p className="text-indigo-300 text-[10px] font-bold uppercase tracking-widest mb-6">Mediated Exchange</p>
               <div className="bg-white/10 rounded-2xl p-6 text-center border border-white/10">
                 <p className="text-[10px] font-bold text-indigo-200 uppercase mb-2">Secret Verification OTP</p>
                 <span className="text-4xl font-mono font-black tracking-[0.2em]">{request.otp}</span>
               </div>
               <p className="text-[9px] text-indigo-400 mt-6 text-center font-black uppercase tracking-widest leading-relaxed">
                 {isHosteler ? "Share this with the Helper or Agent only when items are received." : "Provide this OTP to the Helper to complete the delivery."}
               </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestDetails;
