'use client';

import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MessageCircle, X, User, Calendar } from 'lucide-react';

interface Chat {
  id: string;
  senderId: string;
  senderName?: string;
  senderType?: 'supplier' | 'customer';
  message?: string;
  text?: string;
  content?: string;
  createdAt: any;
  [key: string]: any; // Allow any additional fields
}

interface ChatViewerProps {
  isOpen: boolean;
  onClose: () => void;
  reportId: string;
  reportDetails: {
    customerName: string;
    supplierBusinessName: string;
  };
}

export default function ChatViewer({ isOpen, onClose, reportId, reportDetails }: ChatViewerProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !reportId) {
      setChats([]);
      setLoading(true);
      return;
    }

    setLoading(true);

    // Real-time listener for chats
    const chatsQuery = query(
      collection(db, `reports/${reportId}/chats`),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(
      chatsQuery,
      (snapshot) => {
        const chatsData = snapshot.docs.map(doc => {
          const data = doc.data();
          console.log('Chat document data:', data); // Debug log
          return {
            id: doc.id,
            ...data
          } as Chat;
        });
        setChats(chatsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching chats:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [isOpen, reportId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <MessageCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Chat History</h2>
              <p className="text-sm text-slate-500">
                {reportDetails.customerName} ↔ {reportDetails.supplierBusinessName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
            </div>
          ) : chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <MessageCircle className="h-16 w-16 mb-4 opacity-30" />
              <p className="text-lg font-medium">No messages yet</p>
              <p className="text-sm mt-1">Chat history will appear here</p>
            </div>
          ) : (
            chats.map((chat) => {
              // Try different possible field names for the message
              const messageContent = chat.message || chat.text || chat.content || chat.msg || '';
              const senderType = chat.senderType || chat.sender || 'unknown';
              const senderName = chat.senderName || chat.name || chat.from || 'Unknown';

              return (
                <div
                  key={chat.id}
                  className={`flex ${senderType === 'supplier' ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-4 shadow-sm ${
                      senderType === 'supplier'
                        ? 'bg-slate-100 text-slate-900'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    {/* Sender Info */}
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-current opacity-50">
                      <User className="h-3 w-3" />
                      <span className="text-xs font-semibold">
                        {senderName}
                      </span>
                      <span className="text-xs">•</span>
                      <span className="text-xs capitalize">
                        {senderType}
                      </span>
                    </div>

                    {/* Message Content */}
                    <div className="my-2">
                      <p className="text-base font-normal leading-relaxed whitespace-pre-wrap break-words">
                        {messageContent || JSON.stringify(chat, null, 2)}
                      </p>
                    </div>

                    {/* Timestamp */}
                    <div className="flex items-center gap-1 mt-2 pt-2 border-t border-current opacity-50">
                      <Calendar className="h-3 w-3" />
                      <span className="text-xs">
                        {chat.createdAt?.toDate?.()?.toLocaleString('en-IN', {
                          dateStyle: 'short',
                          timeStyle: 'short'
                        }) || 'Just now'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Info */}
        <div className="border-t border-slate-200 bg-slate-50 p-3">
          <p className="text-xs text-slate-500 text-center">
            Viewing {chats.length} message{chats.length !== 1 ? 's' : ''} • Admin View Only
          </p>
        </div>
      </div>
    </div>
  );
}
