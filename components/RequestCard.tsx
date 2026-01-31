
import React from 'react';
import { Link } from 'react-router-dom';
import { DeliveryRequest, RequestStatus, UserRole } from '../types';

interface RequestCardProps {
  request: DeliveryRequest;
  role: UserRole;
  onAccept?: () => void;
}

const RequestCard: React.FC<RequestCardProps> = ({ request, role, onAccept }) => {
  const statusColors = {
    [RequestStatus.OPEN]: 'bg-indigo-50 text-indigo-600',
    [RequestStatus.ACCEPTED]: 'bg-amber-50 text-amber-600',
    [RequestStatus.PICKED_UP]: 'bg-blue-50 text-blue-600',
    [RequestStatus.DELIVERED]: 'bg-emerald-50 text-emerald-600',
    [RequestStatus.COMPLETED]: 'bg-gray-100 text-gray-500',
    [RequestStatus.CANCELLED]: 'bg-red-50 text-red-600',
    [RequestStatus.DISPUTED]: 'bg-rose-600 text-white',
  };

  const mainItem = request.items[0]?.name || 'Request';
  const itemCount = request.items.length;
  const scholarAppreciation = request.tip + (request.serviceCharge * 0.8);

  return (
    <div className="bg-white border border-gray-100 rounded-[2rem] p-6 hover:shadow-xl transition-all flex flex-col group border-b-4 border-b-transparent hover:border-b-indigo-600">
      <div className="flex justify-between items-start mb-6">
        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${statusColors[request.status]}`}>
          {request.status.replace('_', ' ')}
        </span>
        <div className="text-right">
          <span className="text-2xl font-black text-indigo-900 block tracking-tighter">₹{request.totalAmount}</span>
          {role === UserRole.CAMPUS_HELPER && (
            <span className="text-[9px] text-emerald-600 font-black uppercase tracking-widest">Appreciation: ₹{scholarAppreciation.toFixed(2)}</span>
          )}
        </div>
      </div>

      <h4 className="font-black text-gray-800 text-xl mb-2 leading-tight">
        {mainItem} {itemCount > 1 ? `(+${itemCount - 1} more)` : ''}
      </h4>
      <p className="text-gray-400 text-xs mb-6 line-clamp-2 font-medium">{request.description}</p>

      {request.estimatedDeliveryTime && (
        <div className="mb-6 flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50/50 px-3 py-1.5 rounded-xl w-fit">
           🕒 Arrival: {request.estimatedDeliveryTime}
        </div>
      )}

      <div className="mt-auto pt-6 border-t border-gray-50 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-sm font-black text-indigo-600">
            {request.hostelerName[0]}
          </div>
          <div>
            <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Hosteler</p>
            <p className="text-sm font-bold text-gray-700">{request.hostelerName}</p>
          </div>
        </div>

        {role === UserRole.CAMPUS_HELPER && request.status === RequestStatus.OPEN ? (
          <button 
            onClick={(e) => { e.preventDefault(); onAccept?.(); }}
            className="w-full py-4 bg-indigo-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-800 transition shadow-lg shadow-indigo-100"
          >
            Accept Help Request
          </button>
        ) : (
          <Link 
            to={`/request/${request.id}`}
            className="w-full py-4 bg-gray-50 text-gray-700 text-center rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition border border-gray-100"
          >
            Investigate Ticket
          </Link>
        )}
      </div>
    </div>
  );
};

export default RequestCard;
