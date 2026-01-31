
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

  if (!user.profileComplete) {
    return <ProfileSetup user={user} onComplete={onUpdateProfile} />;
  }

  const openRequests = requests.filter(r => r.status === RequestStatus.OPEN);
  const myActive = requests.filter(r => r.dayScholarId === user.id && r.status !== RequestStatus.COMPLETED);
  const myCompleted = requests.filter(r => r.dayScholarId === user.id && r.status === RequestStatus.COMPLETED);

  const displayedRequests = filter === 'OPEN' ? openRequests : filter === 'MY_ACTIVE' ? myActive : myCompleted;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold text-gray-900">Day Scholar Dashboard</h2>
        <p className="text-gray-500">Pick up requests on your way</p>
      </div>

      <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-2xl w-fit">
        <button 
          onClick={() => setFilter('OPEN')}
          className={`px-6 py-2.5 rounded-xl font-bold text-sm transition ${filter === 'OPEN' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Open Orders
        </button>
        <button 
          onClick={() => setFilter('MY_ACTIVE')}
          className={`px-6 py-2.5 rounded-xl font-bold text-sm transition ${filter === 'MY_ACTIVE' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          My Jobs
        </button>
        <button 
          onClick={() => setFilter('COMPLETED')}
          className={`px-6 py-2.5 rounded-xl font-bold text-sm transition ${filter === 'COMPLETED' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Completed
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedRequests.length === 0 ? (
          <div className="col-span-full py-20 text-center text-gray-400 font-medium">
            Nothing to show here.
          </div>
        ) : (
          displayedRequests.map(req => (
            <RequestCard 
              key={req.id} 
              request={req} 
              role={user.role} 
              onAccept={() => {
                onUpdateRequest({
                  ...req,
                  status: RequestStatus.ACCEPTED,
                  dayScholarId: user.id,
                  dayScholarName: user.fullName
                });
              }}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default DayScholarDashboard;
