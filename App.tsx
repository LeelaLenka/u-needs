
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import HostelerDashboard from './components/HostelerDashboard';
import DayScholarDashboard from './components/DayScholarDashboard';
import AdminDashboard from './components/AdminDashboard';
import RequestDetails from './components/RequestDetails';
import ProfilePage from './components/ProfilePage';
import { User, UserRole, DeliveryRequest, ChatMessage, RequestStatus, Transaction, TransactionType } from './types';
import { mockRequests } from './mockData';

const App: React.FC = () => {
  // Global user "database" simulation
  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('app_users');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((u: User) => ({
        ...u,
        walletBalance: u.walletBalance ?? 0,
        totalEarnings: u.totalEarnings ?? 0
      }));
    }
    return [];
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [requests, setRequests] = useState<DeliveryRequest[]>(() => {
    const saved = localStorage.getItem('requests');
    return saved ? JSON.parse(saved) : mockRequests;
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('messages');
    return saved ? JSON.parse(saved) : [];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [];
  });

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('app_users', JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('requests', JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem('messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (userId: string, type: TransactionType, amount: number, description: string) => {
    const newTx: Transaction = {
      id: 'tx-' + Math.random().toString(36).substr(2, 9),
      userId,
      type,
      amount,
      description,
      timestamp: new Date().toISOString()
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const handleLogin = (user: User) => {
    const existingUser = allUsers.find(u => u.email === user.email);
    if (existingUser) {
      setCurrentUser(existingUser);
    } else {
      const newUser = { ...user, walletBalance: 0, totalEarnings: 0 };
      setAllUsers(prev => [...prev, newUser]);
      setCurrentUser(newUser);
    }
  };

  const handleLogout = () => setCurrentUser(null);

  const updateRequest = (updated: DeliveryRequest) => {
    const oldRequest = requests.find(r => r.id === updated.id);
    if (!oldRequest) return;

    // Trigger payout only when transitioning to COMPLETED and if not already paid
    if (oldRequest.status !== RequestStatus.COMPLETED && updated.status === RequestStatus.COMPLETED && !updated.paymentReleased) {
      processPayout(updated);
      updated.paymentReleased = true;
    }
    
    // Trigger refund if transitioning to CANCELLED and it was previously active/open
    if (oldRequest.status !== RequestStatus.CANCELLED && updated.status === RequestStatus.CANCELLED && !updated.paymentReleased) {
      processRefund(updated);
      updated.paymentReleased = true; // Mark as settled to prevent double processing
    }

    setRequests(prev => prev.map(r => r.id === updated.id ? updated : r));
  };

  const processPayout = (req: DeliveryRequest) => {
    if (!req.dayScholarId) return;

    // Distribution:
    // Scholar: Base + Tip + (80% of Service Charge)
    // Admin: (20% of Service Charge)
    const scholarShare = req.baseAmount + req.tip + (req.serviceCharge * 0.8);
    const adminShare = req.serviceCharge * 0.2;

    const firstAdmin = allUsers.find(u => u.role === UserRole.ADMIN);

    setAllUsers(prev => prev.map(u => {
      // Payout Scholar
      if (u.id === req.dayScholarId) {
        addTransaction(u.id, 'earning', scholarShare, `Earnings from Order #${req.id}`);
        return {
          ...u,
          walletBalance: u.walletBalance + scholarShare,
          totalEarnings: (u.totalEarnings || 0) + scholarShare
        };
      }
      // Payout Admin
      if (u.role === UserRole.ADMIN && (!firstAdmin || u.id === firstAdmin.id)) {
        addTransaction(u.id, 'earning', adminShare, `Platform fee share from Order #${req.id}`);
        return {
          ...u,
          walletBalance: u.walletBalance + adminShare,
          totalEarnings: (u.totalEarnings || 0) + adminShare
        };
      }
      return u;
    }));

    // Local state sync for active user
    if (currentUser?.id === req.dayScholarId) {
       setCurrentUser(prev => prev ? { ...prev, walletBalance: prev.walletBalance + scholarShare, totalEarnings: (prev.totalEarnings || 0) + scholarShare } : null);
    } else if (currentUser?.role === UserRole.ADMIN && (!firstAdmin || currentUser.id === firstAdmin.id)) {
       setCurrentUser(prev => prev ? { ...prev, walletBalance: prev.walletBalance + adminShare, totalEarnings: (prev.totalEarnings || 0) + adminShare } : null);
    }
  };

  const processRefund = (req: DeliveryRequest) => {
    const refundAmount = req.totalAmount;
    
    setAllUsers(prev => prev.map(u => {
      if (u.id === req.hostelerId) {
        addTransaction(u.id, 'refund', refundAmount, `Refund for cancelled Order #${req.id}`);
        return {
          ...u,
          walletBalance: u.walletBalance + refundAmount
        };
      }
      return u;
    }));

    // Sync current user if they are the hosteler
    if (currentUser?.id === req.hostelerId) {
      setCurrentUser(prev => prev ? { ...prev, walletBalance: prev.walletBalance + refundAmount } : null);
    }
  };

  const addRequest = (req: DeliveryRequest) => {
    if (currentUser && currentUser.walletBalance >= req.totalAmount) {
      const updatedUser = { ...currentUser, walletBalance: currentUser.walletBalance - req.totalAmount };
      setCurrentUser(updatedUser);
      setAllUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
      setRequests(prev => [req, ...prev]);
      addTransaction(currentUser.id, 'payment', req.totalAmount, `Payment for Delivery Request #${req.id}`);
      return true;
    }
    return false;
  };

  const updateUserProfile = (profileData: Partial<User>) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, ...profileData, profileComplete: true };
      setCurrentUser(updatedUser);
      setAllUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    }
  };

  const updateWallet = (amount: number, type: 'add' | 'withdraw') => {
    if (!currentUser) return;
    const change = type === 'add' ? amount : -amount;
    
    if (type === 'withdraw' && currentUser.walletBalance < amount) {
      alert("Insufficient funds in wallet.");
      return;
    }

    const updatedUser = { ...currentUser, walletBalance: currentUser.walletBalance + change };
    setCurrentUser(updatedUser);
    setAllUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    addTransaction(currentUser.id, type === 'add' ? 'deposit' : 'withdrawal', amount, `${type === 'add' ? 'Wallet Top-up' : 'Wallet Withdrawal'}`);
  };

  const addMessage = (msg: ChatMessage) => {
    setMessages(prev => [...prev, msg]);
  };

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar user={currentUser} onLogout={handleLogout} />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage onLogin={handleLogin} allUsers={allUsers} />} />
            
            <Route 
              path="/dashboard" 
              element={
                !currentUser ? <Navigate to="/auth" /> :
                currentUser.role === UserRole.HOSTELER ? (
                  <HostelerDashboard 
                    user={currentUser} 
                    requests={requests} 
                    onAddRequest={addRequest} 
                    onUpdateProfile={updateUserProfile} 
                  />
                ) :
                currentUser.role === UserRole.DAY_SCHOLAR ? (
                  <DayScholarDashboard 
                    user={currentUser} 
                    requests={requests} 
                    onUpdateRequest={updateRequest} 
                    onUpdateProfile={updateUserProfile}
                  />
                ) :
                <AdminDashboard user={currentUser} requests={requests} allUsers={allUsers} onUpdateRequest={updateRequest} />
              }
            />

            <Route 
              path="/profile" 
              element={
                currentUser ? <ProfilePage user={currentUser} transactions={transactions} requests={requests} onUpdate={updateUserProfile} onUpdateWallet={updateWallet} /> : <Navigate to="/auth" />
              }
            />

            <Route 
              path="/request/:id" 
              element={
                currentUser ? 
                <RequestDetails 
                  user={currentUser} 
                  allUsers={allUsers}
                  requests={requests} 
                  messages={messages}
                  onUpdateRequest={updateRequest} 
                  onSendMessage={addMessage}
                /> : 
                <Navigate to="/auth" />
              } 
            />
          </Routes>
        </main>
        <footer className="bg-white border-t py-6 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} YOU NEEDS - Empowering Campus Connections
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;
