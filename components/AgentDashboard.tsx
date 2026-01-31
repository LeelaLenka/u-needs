
import React, { useState } from 'react';
import { User, DeliveryRequest, RequestStatus, UserRole } from '../types';
import { Link } from 'react-router-dom';

interface AgentDashboardProps {
  user: User;
  allUsers: User[];
  requests: DeliveryRequest[];
  onUpdateRequest: (req: DeliveryRequest) => void;
}

const AgentDashboard: React.FC<AgentDashboardProps> = ({ user, allUsers, requests, onUpdateRequest }) => {
  const [filter, setFilter] = useState<RequestStatus | 'ALL'>('ALL');

  const getFilteredRequests = () => {
    if (filter === 'ALL') return requests;
    return requests.filter(r => r.status === filter);
  };

  const getUserPhone = (userId: string) => {
    return allUsers.find(u => u.id === userId)?.phoneNumber || 'No Number';
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Agent Command Center</h2>
          <p className="text-gray-500 font-medium">Mediating Campus Logistics</p>
        </div>
        <div className="bg-white border-2 border-indigo-50 px-6 py-3 rounded-2xl shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Tickets</p>
          <p className="text-xl font-black text-indigo-900">{requests.filter(r => r.status !== RequestStatus.COMPLETED).length}</p>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl w-fit overflow-x-auto">
        {(['ALL', ...Object.values(RequestStatus)] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition ${filter === s ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="grid gap-6">
        {getFilteredRequests().map(req => (
          <div key={req.id} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div className="space-y-4 flex-grow">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">#{req.id}</span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    req.status === RequestStatus.DISPUTED ? 'bg-red-100 text-red-600' : 'bg-indigo-50 text-indigo-600'
                  }`}>
                    {req.status}
                  </span>
                </div>
                <h3 className="text-xl font-black text-gray-800">{req.items[0]?.name}...</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Hosteler</p>
                    <p className="font-bold text-gray-800">{req.hostelerName}</p>
                    <p className="text-xs text-indigo-600 font-black mt-1">📞 {getUserPhone(req.hostelerId)}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Campus Helper</p>
                    <p className="font-bold text-gray-800">{req.campusHelperName || 'Unassigned'}</p>
                    {req.campusHelperId && (
                      <p className="text-xs text-emerald-600 font-black mt-1">📞 {getUserPhone(req.campusHelperId)}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="md:w-64 space-y-3">
                <div className="bg-indigo-900 text-white p-6 rounded-3xl text-center">
                  <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-1">Exchange OTP</p>
                  <p className="text-3xl font-mono font-black tracking-widest">{req.otp}</p>
                </div>
                <Link 
                  to={`/request/${req.id}`}
                  className="w-full py-4 bg-gray-100 text-gray-700 rounded-2xl text-center font-black text-xs block hover:bg-gray-200 transition"
                >
                  Open Mediator Chat
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgentDashboard;
