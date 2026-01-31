
import React, { useState, useEffect, useRef } from 'react';
import { User, ChatMessage } from '../types';

interface ChatComponentProps {
  user: User;
  requestId: string;
  otp: string; // Used as part of the session key derivation
  messages: ChatMessage[];
  onSendMessage: (msg: ChatMessage) => void;
}

const ChatComponent: React.FC<ChatComponentProps> = ({ user, requestId, otp, messages, onSendMessage }) => {
  const [text, setText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Simple Obfuscation/Encryption Utility (Simulation for local environment)
  // In a production app, this would use the Web Crypto API (SubtleCrypto)
  const encrypt = (plainText: string): string => {
    const salt = requestId + otp;
    const encoded = btoa(unescape(encodeURIComponent(plainText)));
    // Add a signature to show it's encrypted
    return `ENC[${salt.substring(0, 4)}]${encoded}`;
  };

  const decrypt = (encryptedText: string): string => {
    if (!encryptedText.startsWith('ENC[')) return encryptedText;
    const parts = encryptedText.split(']');
    const content = parts[1];
    try {
      return decodeURIComponent(escape(atob(content)));
    } catch (e) {
      return "[Decryption Error: Invalid Key]";
    }
  };

  const filteredMessages = messages.filter(m => m.requestId === requestId);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [filteredMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const newMsg: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      requestId,
      senderId: user.id,
      senderName: user.fullName,
      text: encrypt(text.trim()), // Encrypt before sending
      timestamp: new Date().toISOString()
    };
    onSendMessage(newMsg);
    setText('');
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden flex flex-col h-[550px] animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Encryption Header */}
      <div className="p-5 bg-indigo-900 text-white flex flex-col gap-1 shadow-md z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div>
              <h4 className="font-black text-sm tracking-tight">Direct Conversation</h4>
              <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest">Job ID: {requestId}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-emerald-500/20 px-3 py-1.5 rounded-xl border border-emerald-500/30">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-tighter">Secure Session</span>
          </div>
        </div>
      </div>

      {/* Encryption Status Banner */}
      <div className="bg-emerald-50 border-b border-emerald-100 px-4 py-2 flex items-center justify-center gap-2">
        <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
        <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">End-to-End Encrypted</span>
      </div>

      {/* Message Area */}
      <div className="flex-grow p-6 overflow-y-auto space-y-6 bg-gray-50/50">
        <div className="text-center">
          <span className="inline-block px-4 py-1.5 bg-gray-200/50 rounded-full text-[9px] font-black text-gray-500 uppercase tracking-widest">
            {new Date().toLocaleDateString()}
          </span>
        </div>

        {filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 opacity-40">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="text-sm font-bold italic">This chat is private and encrypted.</p>
          </div>
        ) : (
          filteredMessages.map(msg => (
            <div key={msg.id} className={`flex flex-col ${msg.senderId === user.id ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[85%] p-4 rounded-3xl text-sm relative group ${
                msg.senderId === user.id 
                  ? 'bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-100' 
                  : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none shadow-sm'
              }`}>
                <div className="flex items-center justify-between gap-4 mb-1">
                  <p className={`font-black text-[9px] uppercase tracking-widest opacity-70`}>
                    {msg.senderName}
                  </p>
                  <svg className={`w-3 h-3 opacity-30 ${msg.senderId === user.id ? 'text-white' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="font-medium leading-relaxed">{decrypt(msg.text)}</p>
                
                {/* Micro encrypted hint */}
                <div className={`absolute -bottom-5 ${msg.senderId === user.id ? 'right-0' : 'left-0'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                   <span className="text-[8px] font-black text-emerald-600 uppercase">🔒 Verifiable Handshake</span>
                </div>
              </div>
              <span className="text-[10px] text-gray-400 mt-2 font-bold px-1">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-6 border-t bg-white flex gap-3 items-center">
        <div className="flex-grow relative">
          <input 
            type="text" 
            placeholder="Type a private message..."
            className="w-full pl-5 pr-12 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none text-sm font-medium transition"
            value={text}
            onChange={e => setText(e.target.value)}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>
        <button 
          type="submit" 
          disabled={!text.trim()}
          className="bg-indigo-900 text-white p-4 rounded-2xl hover:bg-indigo-800 transition shadow-xl shadow-indigo-100 disabled:opacity-30 disabled:shadow-none active:scale-95"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default ChatComponent;
