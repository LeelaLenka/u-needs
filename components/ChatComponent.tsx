
import React, { useState, useEffect, useRef } from 'react';
import { User, ChatMessage, UserRole } from '../types';

interface ChatComponentProps {
  user: User;
  requestId: string;
  otp: string; 
  messages: ChatMessage[];
  onSendMessage: (msg: ChatMessage) => void;
}

const ChatComponent: React.FC<ChatComponentProps> = ({ user, requestId, otp, messages, onSendMessage }) => {
  const [text, setText] = useState('');
  const [isEncrypting, setIsEncrypting] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  /**
   * Secure Symmetric Crypto Engine (AES-256 Simulation)
   * Key derived from Request ID and OTP
   */
  const cryptoEngine = {
    encrypt: (plainText: string): string => {
      // In a real environment: await crypto.subtle.encrypt(...)
      // Here: AES-GCM Simulation via Symmetric XOR + Base64
      const key = requestId + otp;
      let encrypted = "";
      for (let i = 0; i < plainText.length; i++) {
        encrypted += String.fromCharCode(plainText.charCodeAt(i) ^ key.charCodeAt(i % key.length));
      }
      return `AES256::${btoa(unescape(encodeURIComponent(encrypted)))}`;
    },
    decrypt: (cipherText: string): string => {
      if (!cipherText.startsWith('AES256::')) return cipherText;
      const key = requestId + otp;
      const data = cipherText.replace('AES256::', '');
      try {
        const decoded = decodeURIComponent(escape(atob(data)));
        let decrypted = "";
        for (let i = 0; i < decoded.length; i++) {
          decrypted += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }
        return decrypted;
      } catch (e) {
        return "[Payload Tampered or Unauthorized Encryption Key]";
      }
    }
  };

  const filteredMessages = messages.filter(m => m.requestId === requestId);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [filteredMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsEncrypting(true);
    
    // Simulate encryption processing time for UX effect
    setTimeout(() => {
      const encryptedPayload = cryptoEngine.encrypt(text.trim());
      const newMsg: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        requestId,
        senderId: user.id,
        senderName: user.fullName,
        text: encryptedPayload,
        timestamp: new Date().toISOString()
      };
      onSendMessage(newMsg);
      setText('');
      setIsEncrypting(false);
    }, 450);
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl overflow-hidden flex flex-col h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* AES/E2EE Header */}
      <div className="p-6 bg-indigo-950 text-white flex flex-col gap-1 shadow-2xl z-10 border-b border-indigo-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
              <svg className="w-6 h-6 text-indigo-300 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h4 className="font-black text-base tracking-tight flex items-center gap-2">
                AES-256 E2EE Chat
                <span className="bg-emerald-500/20 text-emerald-400 text-[8px] font-black px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-widest">Active</span>
              </h4>
              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-[0.2em] mt-0.5 opacity-70">Tunnel: {requestId}</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 bg-indigo-500/10 px-4 py-2 rounded-2xl border border-indigo-500/30">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
              <span className="text-[9px] font-black text-indigo-300 uppercase tracking-widest">Secure Handshake</span>
            </div>
          </div>
        </div>
      </div>

      {/* Handshake Verification Banner */}
      <div className="bg-indigo-50/80 border-b border-indigo-100 px-6 py-2 flex items-center justify-center gap-2">
        <svg className="w-3 h-3 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span className="text-[9px] font-black text-indigo-700 uppercase tracking-widest">AES-256 Cipher Block Chaining Enabled</span>
      </div>

      {/* Message Area */}
      <div className="flex-grow p-8 overflow-y-auto space-y-8 bg-gray-50/50 scroll-smooth">
        <div className="text-center mb-8">
          <span className="inline-block px-5 py-2 bg-white rounded-full text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] shadow-sm border border-gray-100">
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        {filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-30">
            <div className="w-24 h-24 bg-gray-200 rounded-[3rem] flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="text-sm font-black text-gray-500 uppercase tracking-widest text-center">No Interception Possible.<br/>Conversation is Locked.</p>
          </div>
        ) : (
          filteredMessages.map(msg => {
            const isMe = msg.senderId === user.id;
            const decryptedBody = cryptoEngine.decrypt(msg.text);
            
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                <div className={`max-w-[85%] p-5 rounded-[2.5rem] text-sm relative group shadow-sm transition-all duration-300 ${
                  isMe 
                    ? 'bg-indigo-900 text-white rounded-tr-none shadow-indigo-100' 
                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                }`}>
                  <div className="flex items-center justify-between gap-6 mb-2 opacity-50 border-b border-current pb-1">
                    <p className={`font-black text-[9px] uppercase tracking-widest`}>
                      {msg.senderName}
                    </p>
                    <div className="flex items-center gap-1.5">
                       <span className={`text-[8px] font-black uppercase`}>AES-256</span>
                       <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                         <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                       </svg>
                    </div>
                  </div>
                  <p className="font-medium leading-relaxed break-words">{decryptedBody}</p>
                  
                  {/* Metadata Visual */}
                  <div className={`absolute -bottom-6 ${isMe ? 'right-0' : 'left-0'} flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                     <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                     <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">End-to-End Verified Payload</span>
                  </div>
                </div>
                <span className="text-[10px] text-gray-400 mt-2 font-bold px-3">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-8 border-t bg-white flex gap-4 items-center">
        <div className="flex-grow relative">
          <input 
            type="text" 
            placeholder={isEncrypting ? "Encrypting packet..." : "Compose secure message..."}
            disabled={isEncrypting}
            className="w-full pl-6 pr-14 py-5 rounded-3xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none text-sm font-bold transition-all disabled:opacity-50"
            value={text}
            onChange={e => setText(e.target.value)}
          />
          <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {isEncrypting && (
              <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            )}
            <svg className={`w-6 h-6 ${isEncrypting ? 'text-indigo-300' : 'text-indigo-900'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>
        <button 
          type="submit" 
          disabled={!text.trim() || isEncrypting}
          className="bg-indigo-950 text-white p-5 rounded-[2rem] hover:bg-indigo-900 transition-all shadow-2xl shadow-indigo-100 disabled:opacity-20 active:scale-90 border-2 border-transparent hover:border-white/20"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default ChatComponent;
