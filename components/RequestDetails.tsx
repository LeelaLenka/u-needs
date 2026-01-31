
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
        className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 font-medium mb-4"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Back to Dashboard
      </button>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Order Details</h2>
                <div className="flex items-center gap-2 text-gray-500">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase">{request.status}</span>
                  <span>ID: {request.id}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-indigo-600">₹{request.totalAmount}</span>
                <p className="text-sm text-gray-400">Total Escrow Amount</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="border rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Item</th>
                      <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Qty</th>
                      <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Price (Est.)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {request.items.map((itm, i) => (
                      <tr key={i}>
                        <td className="px-6 py-4 text-sm font-medium">{itm.name}</td>
                        <td className="px-6 py-4 text-sm">{itm.quantity}</td>
                        <td className="px-6 py-4 text-sm text-right">₹{itm.estimatedPrice * itm.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <h4 className="font-bold text-gray-700 mb-1">Description</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{request.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-indigo-50/50 rounded-2xl text-xs">
                 <div className="flex justify-between"><span>Base Total:</span><span className="font-bold">₹{request.baseAmount}</span></div>
                 <div className="flex justify-between"><span>Platform Fee:</span><span className="font-bold">₹{request.serviceCharge}</span></div>
                 <div className="flex justify-between"><span>Tip:</span><span className="font-bold">₹{request.tip}</span></div>
                 <div className="flex justify-between border-t border-indigo-200 pt-1 mt-1"><span>Total Paid:</span><span className="font-bold text-indigo-800">₹{request.totalAmount}</span></div>
              </div>
            </div>
          </div>

          {showChat && (
            <ChatComponent user={user} requestId={request.id} messages={messages} onSendMessage={onSendMessage} />
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-lg mb-4">Contacts</h3>
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-600">{request.hostelerName.charAt(0)}</div>
                <div className="flex-grow">
                  <p className="text-xs text-gray-400 font-bold uppercase">Hosteler</p>
                  <p className="text-sm font-bold">{request.hostelerName}</p>
                  {(request.status !== RequestStatus.OPEN && isInvolved) && (
                    <p className="text-xs font-medium text-indigo-600 mt-1 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      {hostelerUser?.phoneNumber || 'No phone provided'}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {request.dayScholarName ? (
                  <>
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center font-bold text-emerald-600">{request.dayScholarName.charAt(0)}</div>
                    <div className="flex-grow">
                      <p className="text-xs text-gray-400 font-bold uppercase">Day Scholar</p>
                      <p className="text-sm font-bold">{request.dayScholarName}</p>
                      {isInvolved && (
                        <p className="text-xs font-medium text-emerald-600 mt-1 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                          {dayScholarUser?.phoneNumber || 'No phone provided'}
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-sm italic text-gray-400">Waiting for acceptance...</p>
                )}
              </div>
            </div>
          </div>

          {user.role === UserRole.HOSTELER && request.status !== RequestStatus.COMPLETED && (
            <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-lg">
              <h3 className="font-bold text-lg mb-1">Delivery OTP</h3>
              <p className="text-indigo-100 text-xs mb-4">Only share this after receiving items.</p>
              <div className="bg-white/20 backdrop-blur-md rounded-2xl py-6 text-center">
                <span className="text-5xl font-mono font-bold tracking-[0.5em] pl-[0.5em]">{request.otp}</span>
              </div>
            </div>
          )}

          {user.role === UserRole.DAY_SCHOLAR && request.status === RequestStatus.ACCEPTED && (
             <button 
              onClick={() => handleStatusChange(RequestStatus.DELIVERED)}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition shadow-lg"
            >
              Mark as Delivered
            </button>
          )}

          {user.role === UserRole.DAY_SCHOLAR && request.status === RequestStatus.DELIVERED && (
            <div className="bg-white rounded-3xl p-6 border-2 border-indigo-600 shadow-sm">
              <h3 className="font-bold text-lg mb-2">Complete Order</h3>
              <p className="text-xs text-gray-500 mb-4">Enter the 4-digit OTP provided by the hosteler.</p>
              <form onSubmit={verifyOtp} className="space-y-4">
                <input 
                  type="text" maxLength={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-indigo-600 text-center text-3xl font-mono font-bold"
                  value={enteredOtp}
                  onChange={e => setEnteredOtp(e.target.value)}
                />
                {error && <p className="text-red-500 text-xs font-bold">{error}</p>}
                <button type="submit" className="w-full py-4 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition">
                  Confirm OTP & Release Pay
                </button>
              </form>
            </div>
          )}

          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
             <h4 className="text-amber-800 font-bold text-sm mb-1">Need help?</h4>
             <p className="text-amber-700 text-xs mb-3">If you face any issues, contact support or raise a dispute.</p>
             <button 
               onClick={() => handleStatusChange(RequestStatus.DISPUTED)}
               className="text-indigo-600 font-bold text-xs hover:underline"
             >
               Raise Dispute
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetails;
