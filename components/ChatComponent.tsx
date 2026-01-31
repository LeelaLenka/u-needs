
import React, { useState, useEffect, useRef } from 'react';
import { User, ChatMessage } from '../types';

interface ChatComponentProps {
  user: User;
  requestId: string;
  messages: ChatMessage[];
  onSendMessage: (msg: ChatMessage) => void;
}

const ChatComponent: React.FC<ChatComponentProps> = ({ user, requestId, messages, onSendMessage }) => {
  const [text, setText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

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
      text: text.trim(),
      timestamp: new Date().toISOString()
    };
    onSendMessage(newMsg);
    setText('');
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[500px]">
      <div className="p-4 bg-indigo-600 text-white font-bold flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        In-App Chat
      </div>
      <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-gray-50">
        {filteredMessages.length === 0 ? (
          <div className="text-center py-10 text-gray-400 italic text-sm">No messages yet. Say hi!</div>
        ) : (
          filteredMessages.map(msg => (
            <div key={msg.id} className={`flex flex-col ${msg.senderId === user.id ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.senderId === user.id ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none shadow-sm'}`}>
                <p className="font-bold text-[10px] opacity-70 mb-1">{msg.senderName}</p>
                <p>{msg.text}</p>
              </div>
              <span className="text-[9px] text-gray-400 mt-1">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={handleSend} className="p-4 border-t flex gap-2">
        <input 
          type="text" 
          placeholder="Type a message..."
          className="flex-grow px-4 py-2 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none text-sm"
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <button type="submit" className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
        </button>
      </form>
    </div>
  );
};

export default ChatComponent;
