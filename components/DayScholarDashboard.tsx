
import React, { useState } from 'react';
import { User, DeliveryRequest, RequestStatus } from '../types';
import RequestCard from './RequestCard';
import ProfileSetup from './ProfileSetup';

interface DayScholarDashboardProps {
  user: User;
  requests: DeliveryRequest[];
  onUpdateRequest: (req: DeliveryRequest) => void;
  onUpdateProfile: (data: Partial<User>) => void;
}

const DayScholarDashboard: React.FC<DayScholarDashboardProps> = ({ user, requests, onUpdateRequest, onUpdateProfile }) => {
  const [filter, setFilter] = useState<'OPEN' | 'MY_ACTIVE' | 'COMPLETED'>('OPEN');
  const [etaId, setEtaId] = useState<string | null>(null);
  const [etaValue, setEtaValue] = useState('');

  if (!user.profileComplete) {
    return <ProfileSetup user={user} onComplete={onUpdateProfile} />;
  }

  const openRequests = requests.filter(r => r.status === RequestStatus.OPEN);
  const myActive = requests.filter(r => r.campusHelperId === user.id && r.status !== RequestStatus.COMPLETED);
  const myCompleted = requests.filter(r => r.campusHelperId === user.id && r.status === RequestStatus.COMPLETED);

  // Bonus Calculation
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const completedThisWeek = requests.filter(r => 
    r.campusHelperId === user.id && 
    r.status === RequestStatus.COMPLETED && 
    new Date(r.createdAt) > oneWeekAgo
  ).length;

  const bonusGoal = 25;
  const bonusProgress = (completedThisWeek % bonusGoal);
  const progressPercent = (bonusProgress / bonusGoal) * 100;

  const displayedRequests = filter === 'OPEN' ? openRequests : filter === 'MY_ACTIVE' ? myActive : myCompleted;

  const handleAcceptJob = (req: DeliveryRequest) => {
    if (!etaValue) {
      alert("Please provide an estimated delivery time.");
      return;
    }
    onUpdateRequest({
      ...req,
      status: RequestStatus.ACCEPTED,
      campusHelperId: user.id,
      campusHelperName: user.fullName,
      estimatedDeliveryTime: etaValue
    });
    setEtaId(null);
    setEtaValue('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">Helper Command</h2>
          <p className="text-gray-500 font-medium">Earn peer appreciation for campus deliveries</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="bg-indigo-900 border-2 border-indigo-900 px-6 py-4 rounded-[2rem] shadow-xl shadow-indigo-100 flex flex-col items-center min-w-[140px]">
            <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">Wallet</p>
            <p className="text-2xl font-black text-white">₹{user.walletBalance.toFixed(2)}</p>
          </div>
          <div className="bg-emerald-50 border-2 border-emerald-100 px-6 py-4 rounded-[2rem] shadow-sm flex flex-col items-center min-w-[140px]">
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Total Appreciation</p>
            <p className="text-2xl font-black text-emerald-700">₹{(user.totalAppreciation || 0).toFixed(2)}</p>
          </div>
          
          {/* Weekly Bonus Widget */}
          <div className="bg-white border-2 border-indigo-50 px-6 py-4 rounded-[2rem] shadow-sm flex flex-col min-w-[200px] relative overflow-hidden group">
            <div className="absolute bottom-0 left-0 h-1 bg-indigo-600 transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
            <div className="flex justify-between items-center mb-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Weekly Bonus</p>
              <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">₹250 REWARD</span>
            </div>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-black text-gray-900">{bonusProgress}<span className="text-gray-300 text-lg">/{bonusGoal}</span></p>
              <p className="text-[9px] font-black text-indigo-400 uppercase mb-1">Orders This Week</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 p-1.5 bg-gray-100 rounded-2xl w-fit border border-gray-200 shadow-inner">
        <button onClick={() => setFilter('OPEN')} className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${filter === 'OPEN' ? 'bg-white shadow-sm text-indigo-900' : 'text-gray-400 hover:text-gray-600'}`}>
          Available Jobs
        </button>
        <button onClick={() => setFilter('MY_ACTIVE')} className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${filter === 'MY_ACTIVE' ? 'bg-white shadow-sm text-indigo-900' : 'text-gray-400 hover:text-gray-600'}`}>
          Active Tasks
        </button>
        <button onClick={() => setFilter('COMPLETED')} className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${filter === 'COMPLETED' ? 'bg-white shadow-sm text-indigo-900' : 'text-gray-400 hover:text-gray-600'}`}>
          Completed
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayedRequests.length === 0 ? (
          <div className="col-span-full py-32 bg-white rounded-[3rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-400">
            <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p className="font-black uppercase tracking-widest text-sm italic">No data packets in this segment.</p>
          </div>
        ) : (
          displayedRequests.map(req => (
            <div key={req.id} className="relative group">
              <RequestCard 
                request={req} 
                role={user.role} 
                onAccept={() => setEtaId(req.id)}
              />
              {etaId === req.id && (
                <div className="absolute inset-0 z-20 bg-indigo-900/95 backdrop-blur-md rounded-[2rem] p-8 flex flex-col justify-center animate-in zoom-in-95 duration-300">
                  <h4 className="font-black text-center text-white text-xl mb-2 tracking-tight">Deployment Strategy</h4>
                  <p className="text-indigo-300 text-[10px] font-bold text-center uppercase tracking-widest mb-6">Estimate Arrival Time</p>
                  <input 
                    type="text"
                    placeholder="e.g. 20-30 mins"
                    autoFocus
                    className="w-full px-5 py-4 rounded-2xl bg-white/10 border border-white/20 outline-none focus:border-white text-white font-black text-center mb-6 transition placeholder:text-indigo-400"
                    value={etaValue}
                    onChange={e => setEtaValue(e.target.value)}
                  />
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleAcceptJob(req)}
                      className="flex-grow bg-emerald-500 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition shadow-xl shadow-emerald-900/40"
                    >
                      Initialize Help
                    </button>
                    <button 
                      onClick={() => {setEtaId(null); setEtaValue('');}}
                      className="px-6 bg-white/10 text-white rounded-2xl font-black py-4 hover:bg-white/20 transition"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DayScholarDashboard;
