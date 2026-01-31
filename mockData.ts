
import { DeliveryRequest, RequestStatus } from './types';

export const mockRequests: DeliveryRequest[] = [
  {
    id: 'req-1',
    hostelerId: 'user-2',
    hostelerName: 'Rahul Sharma',
    items: [{ name: 'Chicken Biryani', quantity: 1, estimatedPrice: 250 }],
    description: 'From Paradise Takeaway, spicy.',
    baseAmount: 250,
    serviceCharge: 25,
    tip: 20,
    totalAmount: 295,
    status: RequestStatus.OPEN,
    otp: '1234',
    createdAt: new Date().toISOString(),
    location: { lat: 17.4483, lng: 78.3915, address: 'Hostel A, Block 3, Room 402' }
  },
  {
    id: 'req-2',
    hostelerId: 'user-3',
    hostelerName: 'Priya Singh',
    items: [
      { name: 'Cough Syrup', quantity: 1, estimatedPrice: 120 },
      { name: 'Band-aids', quantity: 1, estimatedPrice: 60 }
    ],
    description: 'Apollo Pharmacy, any generic brand is fine.',
    baseAmount: 180,
    serviceCharge: 18,
    tip: 10,
    totalAmount: 208,
    status: RequestStatus.ACCEPTED,
    dayScholarId: 'user-4',
    dayScholarName: 'Amit Verma',
    otp: '5678',
    createdAt: new Date().toISOString(),
    location: { lat: 17.4495, lng: 78.3900, address: 'Girls Hostel, Main Gate' }
  }
];
