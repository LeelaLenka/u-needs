
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
    [RequestStatus.OPEN]: 'bg-indigo-100 text-indigo-700',
    [RequestStatus.ACCEPTED]: 'bg-amber-100 text-amber-700',
    [RequestStatus.PICKED_UP]: 'bg-blue-100 text-blue-700',
    [RequestStatus.DELIVERED]: 'bg-emerald-100 text-emerald-700',
    [RequestStatus.COMPLETED]: 'bg-gray-100 text-gray-700',
    [RequestStatus.CANCELLED]: 'bg-red-100 text-red-700',
    [RequestStatus.DISPUTED]: 'bg-rose-600 text-white',
  };

  const mainItem = request.items[0]?.name || 'Unknown Item';
  const itemCount = request.items.length;

  // Earnings for scholar: Base + Tip + 80% Service Charge
  const scholarEarnings = request.baseAmount + request.tip + (request.serviceCharge * 0.8);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-lg transition-all flex flex-col group">
      <div className="flex justify-between items-start mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusColors[request.status]}`}>
          {request.status.replace('_', ' ')}
        </span>
        <div className="text-right">
          <span className="text-lg font-bold text-indigo-600 block">₹{request.totalAmount}</span>
          {role === UserRole.DAY_SCHOLAR && (
            <span className="text-[10px] text-emerald-600 font-bold uppercase">Earn: ₹{scholarEarnings.toFixed(2)}</span>
          )}
        </div>
      </div>

      <h4 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-indigo-600 transition-colors">
        {mainItem} {itemCount > 1 ? `(+${itemCount - 1} more)` : ''}
      </h4>
      <p className="text-gray-500 text-sm mb-4 line-clamp-1">{request.description}</p>

      <div className="mt-auto pt-4 border-t flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-xs font-bold text-indigo-600">
            {request.hostelerName.charAt(0)}
          </div>
          <div>
            <p className="text-xs text-gray-400">Hosteler</p>
            <p className="text-sm font-semibold">{request.hostelerName}</p>
          </div>
        </div>

        {role === UserRole.DAY_SCHOLAR && request.status === RequestStatus.OPEN ? (
          <button 
            onClick={(e) => { e.preventDefault(); onAccept?.(); }}
            className="w-full py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition shadow-md"
          >
            Accept Job
          </button>
        ) : (
          <Link 
            to={`/request/${request.id}`}
            className="w-full py-3 bg-gray-50 text-gray-700 text-center rounded-xl font-bold hover:bg-gray-100 transition border"
          >
            View Details
          </Link>
        )}
      </div>
    </div>
  );
};

export default RequestCard;
