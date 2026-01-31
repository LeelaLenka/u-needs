
export enum UserRole {
  HOSTELER = 'HOSTELER',
  DAY_SCHOLAR = 'DAY_SCHOLAR',
  ADMIN = 'ADMIN'
}

export enum RequestStatus {
  OPEN = 'OPEN',
  ACCEPTED = 'ACCEPTED',
  PICKED_UP = 'PICKED_UP',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DISPUTED = 'DISPUTED'
}

export interface NotificationPreferences {
  newOrders: boolean;
  messages: boolean;
  statusUpdates: boolean;
  emailAlerts: boolean;
}

export type TransactionType = 'deposit' | 'withdrawal' | 'earning' | 'payment' | 'refund';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  description: string;
  timestamp: string;
}

export interface User {
  id: string;
  userName: string;
  fullName: string;
  email: string;
  role: UserRole;
  profileComplete: boolean;
  phoneNumber?: string;
  college?: string;
  registrationNumber?: string;
  branch?: string;
  section?: string;
  year?: string;
  walletBalance: number;
  totalEarnings?: number;
  notificationPreferences?: NotificationPreferences;
}

export interface ItemEntry {
  name: string;
  quantity: number;
  estimatedPrice: number;
}

export interface DeliveryRequest {
  id: string;
  hostelerId: string;
  hostelerName: string;
  dayScholarId?: string;
  dayScholarName?: string;
  items: ItemEntry[];
  description: string;
  baseAmount: number;
  serviceCharge: number;
  tip: number;
  totalAmount: number;
  status: RequestStatus;
  otp: string;
  createdAt: string;
  location: { lat: number; lng: number; address: string };
  paymentReleased?: boolean;
}

export interface ChatMessage {
  id: string;
  requestId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
}
