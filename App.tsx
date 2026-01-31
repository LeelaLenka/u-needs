
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import HostelerDashboard from './components/HostelerDashboard';
import DayScholarDashboard from './components/DayScholarDashboard';
import AdminDashboard from './components/AdminDashboard';
import AgentDashboard from './components/AgentDashboard';
import RequestDetails from './components/RequestDetails';
import ProfilePage from './components/ProfilePage';
import { User, UserRole, DeliveryRequest, ChatMessage, RequestStatus, Transaction, TransactionType, AdminAlert } from './types';
import { mockRequests } from './mockData';

const App: React.FC = () => {
  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('app_users');
    if (saved) return JSON.parse(saved);
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

  const [adminAlerts, setAdminAlerts] = useState<AdminAlert[]>(() => {
    const saved = localStorage.getItem('admin_alerts');
    return saved ? JSON.parse(saved) : [];
  });

  // Database Persistence Effect
  useEffect(() => {
    localStorage.setItem('app_users', JSON.stringify(allUsers));
    localStorage.setItem('user', JSON.stringify(currentUser));
    localStorage.setItem('requests', JSON.stringify(requests));
    localStorage.setItem('messages', JSON.stringify(messages));
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('admin_alerts', JSON.stringify(adminAlerts));
  }, [allUsers, currentUser, requests, messages, transactions, adminAlerts]);

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    setAllUsers(prev => {
      const exists = prev.find(u => u.id === user.id || u.email === user.email);
      if (!exists) return [...prev, user];
      // Sync the user from list to currentUser in case the list has more updated data
      const updatedUser = { ...exists, ...user };
      return prev.map(u => u.email === user.email ? updatedUser : u);
    });
  };

  const handleUpdateUser = (updatedUser: User) => {
    setAllUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser?.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  };

  const addTransaction = (userId: string, type: TransactionType, amount: number, description: string) => {
    const newTx: Transaction = {
      id: 'tx-' + Math.random().toString(36).substr(2, 9),
      userId, type, amount, description,
      timestamp: new Date().toISOString()
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const processPayout = (req: DeliveryRequest) => {
    if (!req.campusHelperId) return;
    
    const appreciation = req.tip + (req.serviceCharge * 0.8);
    const totalPayout = req.baseAmount + appreciation;
    
    setAllUsers(prev => {
      const updatedList = prev.map(u => {
        if (u.id === req.campusHelperId) {
          const updated = { 
            ...u, 
            walletBalance: u.walletBalance + totalPayout, 
            totalAppreciation: (u.totalAppreciation || 0) + appreciation 
          };
          if (currentUser?.id === u.id) {
            setTimeout(() => setCurrentUser(updated), 0);
          }
          return updated;
        }
        return u;
      });
      return updatedList;
    });

    addTransaction(req.campusHelperId, 'appreciation', totalPayout, `Payout for Order #${req.id} (₹${appreciation.toFixed(2)} Appreciation earned)`);
  };

  const updateRequest = (updated: DeliveryRequest) => {
    const old = requests.find(r => r.id === updated.id);
    if (!old) return;
    
    if (old.status !== RequestStatus.COMPLETED && updated.status === RequestStatus.COMPLETED && !updated.paymentReleased) {
      processPayout(updated);
      updated.paymentReleased = true;
    }
    setRequests(prev => prev.map(r => r.id === updated.id ? updated : r));
  };

  const addRequest = (req: DeliveryRequest) => {
    if (currentUser && currentUser.walletBalance >= req.totalAmount) {
      const updatedUser = { ...currentUser, walletBalance: currentUser.walletBalance - req.totalAmount };
      handleUpdateUser(updatedUser);
      setRequests(prev => [req, ...prev]);
      addTransaction(currentUser.id, 'payment', req.totalAmount, `Escrow Locked for Order #${req.id}`);
      return true;
    }
    return false;
  };

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar user={currentUser} onLogout={() => setCurrentUser(null)} />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage onLogin={handleAuthSuccess} allUsers={allUsers} />} />
            <Route path="/dashboard" element={
              !currentUser ? <Navigate to="/auth" /> :
              currentUser.role === UserRole.HOSTELER ? (
                <HostelerDashboard 
                  user={currentUser} 
                  requests={requests} 
                  onAddRequest={addRequest} 
                  onUpdateProfile={u => handleUpdateUser({...currentUser, ...u, profileComplete: true})} 
                />
              ) :
              currentUser.role === UserRole.CAMPUS_HELPER ? (
                <DayScholarDashboard 
                  user={currentUser} 
                  requests={requests} 
                  onUpdateRequest={updateRequest} 
                  onUpdateProfile={u => handleUpdateUser({...currentUser, ...u, profileComplete: true})} 
                />
              ) :
              currentUser.role === UserRole.AGENT ? (
                <AgentDashboard 
                  user={currentUser} 
                  allUsers={allUsers} 
                  requests={requests} 
                  onUpdateRequest={updateRequest} 
                />
              ) :
              <AdminDashboard user={currentUser} allUsers={allUsers} requests={requests} transactions={transactions} onUpdateRequest={updateRequest} onUpdateUser={handleUpdateUser} addTransaction={addTransaction} alerts={adminAlerts} onClearAlerts={() => setAdminAlerts([])} onDismissAlert={id => setAdminAlerts(prev => prev.filter(a => a.id !== id))} />
            } />
            <Route path="/profile" element={currentUser ? <ProfilePage user={currentUser} transactions={transactions} requests={requests} onUpdate={u => handleUpdateUser({...currentUser, ...u})} onUpdateWallet={(amt, type) => {
              const change = type === 'add' ? amt : -amt;
              const updated = {...currentUser, walletBalance: currentUser.walletBalance + change};
              handleUpdateUser(updated);
              addTransaction(currentUser.id, type === 'add' ? 'deposit' : 'withdrawal', amt, `Wallet ${type}`);
            }} /> : <Navigate to="/auth" />} />
            <Route path="/request/:id" element={currentUser ? <RequestDetails user={currentUser} allUsers={allUsers} requests={requests} messages={messages} onUpdateRequest={updateRequest} onSendMessage={m => setMessages(prev => [...prev, m])} /> : <Navigate to="/auth" />} />
          </Routes>
        </main>
        <footer className="bg-white border-t py-6 text-center text-gray-500 text-sm font-black uppercase tracking-widest">
          &copy; {new Date().getFullYear()} UNEEDS - WE SERVE
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;
